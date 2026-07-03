import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { profileId, subject, description, urgency } = await req.json();

    if (!profileId || !subject || !description) {
      return NextResponse.json({ error: "Missing required fields (profileId, subject, description)" }, { status: 400 });
    }

    const [ticket] = await sql`
      INSERT INTO support_tickets (profile_id, subject, description, urgency, status)
      VALUES (${profileId}, ${subject}, ${description}, ${urgency || 'medium'}, 'new')
      RETURNING *
    `;

    // Send a ticket creation notification
    try {
      const [profile] = await sql`SELECT phone_number, farmer_name FROM profiles WHERE id = ${profileId} LIMIT 1`;
      if (profile) {
        const { sendSMS, sendWhatsApp } = require('@/utils/sms');
        const ticketMsg = `कृषिवाणी (KrishiVaani) AI: नमस्ते ${profile.farmer_name}, आपकी शिकायत (शिकायत आईडी: #${ticket.id}) जिला कृषि सेवा केंद्र को भेज दी गई है। विशेषज्ञ अधिकारी के जवाब देने पर आपको सूचित किया जाएगा।`;
        await sendSMS(profile.phone_number, ticketMsg);
        await sendWhatsApp(profile.phone_number, ticketMsg);
      }
    } catch (smsErr) {
      console.error("Support ticket SMS notification failed to dispatch:", smsErr);
    }

    return NextResponse.json({
      success: true,
      ticket
    });

  } catch (error: any) {
    console.error("Failed to create manual support ticket:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      message: error.message 
    }, { status: 500 });
  }
}
