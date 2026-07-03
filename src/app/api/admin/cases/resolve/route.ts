import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { caseId, ticketId, expertId, status, expertNotes } = await req.json();

    if (!caseId || !expertId || !expertNotes) {
      return NextResponse.json({ error: "Missing required caseId, expertId, or expertNotes parameters" }, { status: 400 });
    }

    const cId = parseInt(caseId, 10);

    // 1. Update diagnosis case status and notes
    const [updatedCase] = await sql`
      UPDATE diagnosis_cases 
      SET 
        status = ${status || 'resolved'}, 
        expert_notes = ${expertNotes} 
      WHERE id = ${cId}
      RETURNING profile_id, crop_type
    `;

    // 2. Update support ticket status if a ticket is linked
    let finalTicketId = ticketId;
    if (ticketId) {
      const tId = parseInt(ticketId, 10);
      await sql`
        UPDATE support_tickets 
        SET status = ${status || 'resolved'} 
        WHERE id = ${tId}
      `;
    } else {
      // Find linked ticket
      const [linkedTicket] = await sql`
        SELECT id FROM support_tickets WHERE case_id = ${cId} LIMIT 1
      `;
      if (linkedTicket) {
        finalTicketId = linkedTicket.id;
        await sql`
          UPDATE support_tickets 
          SET status = ${status || 'resolved'} 
          WHERE id = ${linkedTicket.id}
        `;
      }
    }

    // 3. Insert update chat message if ticket is active
    if (finalTicketId) {
      await sql`
        INSERT INTO ticket_updates (ticket_id, sender_id, sender_role, message)
        VALUES (${parseInt(finalTicketId, 10)}, ${expertId}, 'expert', ${expertNotes})
      `;
    }

    // 4. Send notification back to farmer
    if (updatedCase) {
      const title = status === 'resolved' 
        ? 'Case Resolved (समस्या का समाधान हुआ)' 
        : 'Expert Advice Received (विशेषज्ञ की सलाह प्राप्त हुई)';
      
      const message = `District expert reviewed your ${updatedCase.crop_type} case: "${expertNotes.slice(0, 100)}..."`;

      await sql`
        INSERT INTO notifications (profile_id, title, message, type)
        VALUES (${updatedCase.profile_id}, ${title}, ${message}, 'ticket_update')
      `;
      // Send SMS and WhatsApp alert to farmer
      try {
        const [profile] = await sql`SELECT phone_number, farmer_name FROM profiles WHERE id = ${updatedCase.profile_id} LIMIT 1`;
        if (profile) {
          const { sendSMS, sendWhatsApp } = require('@/utils/sms');
          const expertMsg = `कृषिवाणी (KrishiVaani) AI: नमस्ते ${profile.farmer_name}, विशेषज्ञ अधिकारी ने आपके पत्ती रोग निदान (केस #${cId}) पर परामर्श दिया है: "${expertNotes}"। जल्द उपचार शुरू करें।`;
          await sendSMS(profile.phone_number, expertMsg);
          await sendWhatsApp(profile.phone_number, expertMsg);
        }
      } catch (smsErr) {
        console.error("Expert resolution SMS failed:", smsErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Case resolved and advice sent successfully"
    });

  } catch (error: any) {
    console.error("Expert resolution write API error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      message: error.message 
    }, { status: 500 });
  }
}
