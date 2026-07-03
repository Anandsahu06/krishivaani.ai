import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { ticketId, senderId, senderRole, message } = await req.json();

    if (!ticketId || !senderId || !senderRole || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Insert message update
    const [newMessage] = await sql`
      INSERT INTO ticket_updates (ticket_id, sender_id, sender_role, message)
      VALUES (${parseInt(ticketId, 10)}, ${senderId}, ${senderRole}, ${message})
      RETURNING *
    `;

    // Retrieve sender name for notification
    const [sender] = await sql`
      SELECT farmer_name FROM profiles WHERE id = ${senderId} LIMIT 1
    `;
    const senderName = sender ? sender.farmer_name : 'Expert';

    // Notify the alternate party (if expert sent, notify farmer. If farmer sent, notify admin pool).
    if (senderRole === 'expert') {
      const [ticket] = await sql`
        SELECT profile_id FROM support_tickets WHERE id = ${parseInt(ticketId, 10)}
      `;
      if (ticket) {
        const replyMsg = `${senderName} replied to your support ticket #${ticketId}.`;
        await sql`
          INSERT INTO notifications (profile_id, title, message, type)
          VALUES (
            ${ticket.profile_id},
            'New Expert Advice (विशेषज्ञ का नया संदेश)',
            ${replyMsg},
            'ticket_update'
          )
        `;

        // Send real-time SMS/WhatsApp notification to the farmer's registered number
        try {
          const [profile] = await sql`SELECT phone_number, farmer_name FROM profiles WHERE id = ${ticket.profile_id} LIMIT 1`;
          if (profile) {
            const { sendSMS, sendWhatsApp } = require('@/utils/sms');
            const alertMsg = `कृषिवाणी (KrishiVaani) AI: नमस्ते ${profile.farmer_name}, विशेषज्ञ अधिकारी ने आपकी शिकायत (टिकट #${ticketId}) पर उत्तर दिया है: "${message.slice(0, 100)}..."`;
            await sendSMS(profile.phone_number, alertMsg);
            await sendWhatsApp(profile.phone_number, alertMsg);
          }
        } catch (smsErr) {
          console.error("Expert ticket reply SMS alert failed:", smsErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: newMessage
    });

  } catch (error: any) {
    console.error("Support send message API error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      message: error.message 
    }, { status: 500 });
  }
}
