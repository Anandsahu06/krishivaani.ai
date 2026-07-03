import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { diagnoseCropDisease } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const {
      profileId,
      cropType,
      imageBase64,
      mimeType,
      userNotes,
      language
    } = await req.json();

    if (!profileId || !cropType || !imageBase64 || !mimeType) {
      return NextResponse.json({ error: "Missing required profile, crop, or leaf image parameters" }, { status: 400 });
    }

    // Extract the raw base64 data (strip prefix if present)
    const rawBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    // 1. Trigger Gemini multi-modal leaf diagnostic visual analyzer
    const diagnosis = await diagnoseCropDisease({
      imageBufferBase64: rawBase64,
      mimeType,
      userNotes,
      language: language || 'hi'
    });

    // Construct the complete image data URI for inline display and save in database
    const imageUrl = `data:${mimeType};base64,${rawBase64}`;

    // 2. Insert the case details into diagnosis_cases
    const [savedCase] = await sql`
      INSERT INTO diagnosis_cases (
        profile_id, 
        crop_type, 
        image_url, 
        voice_url, 
        user_notes, 
        ai_disease, 
        ai_remedy, 
        ai_confidence, 
        ai_severity, 
        action_required, 
        status
      )
      VALUES (
        ${profileId}, 
        ${cropType}, 
        ${imageUrl}, 
        '', 
        ${userNotes || ''}, 
        ${diagnosis.disease}, 
        ${diagnosis.remedy}, 
        ${diagnosis.confidence}, 
        ${diagnosis.severity}, 
        ${diagnosis.actionRequired}, 
        ${diagnosis.actionRequired === 'escalate' ? 'escalated' : 'new'}
      )
      RETURNING id, status
    `;

    // 3. If action_required is 'escalate', register a support ticket automatically
    if (diagnosis.actionRequired === 'escalate') {
      const subject = `Escalation: Severe ${diagnosis.disease} detected in ${cropType}`;
      const description = `The farmer has uploaded an image showing symptoms identified by AI as ${diagnosis.disease} with ${Math.round(diagnosis.confidence * 100)}% confidence. User notes: "${userNotes || 'None'}". Remedy recommended by AI: "${diagnosis.remedy}". Action needed: Specialist verification and response.`;
      
      const [ticket] = await sql`
        INSERT INTO support_tickets (profile_id, case_id, subject, description, urgency, status)
        VALUES (
          ${profileId},
          ${savedCase.id},
          ${subject},
          ${description},
          ${diagnosis.severity},
          'new'
        )
        RETURNING id
      `;

      // Insert notification
      const alertMsg = `Your leaf diagnosis shows high severity symptoms. We have opened support ticket #${ticket.id} for expert review.`;
      await sql`
        INSERT INTO notifications (profile_id, title, message, type)
        VALUES (
          ${profileId},
          'Case Escalated to Expert (केस विशेषज्ञ को भेजा गया)',
          ${alertMsg},
          'ticket_update'
        )
      `;
    } else {
      // Insert regular complete notification
      const normalMsg = `AI leaf analysis finished. Identified disease: ${diagnosis.disease}.`;
      await sql`
        INSERT INTO notifications (profile_id, title, message, type)
        VALUES (
          ${profileId},
          'Diagnosis Completed (निदान पूरा हुआ)',
          ${normalMsg},
          'diagnosis_complete'
        )
      `;
    }

    return NextResponse.json({
      success: true,
      caseId: savedCase.id
    });

  } catch (error: any) {
    console.error("Diagnosis endpoint failed:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      message: error.message || "Failed to process visual diagnosis" 
    }, { status: 500 });
  }
}

