import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ticketId = searchParams.get('ticketId');

    if (!ticketId) {
      return NextResponse.json({ error: "ticketId is required" }, { status: 400 });
    }

    const messages = await sql`
      SELECT u.*, p.farmer_name as sender_name, p.role as sender_role 
      FROM ticket_updates u
      LEFT JOIN profiles p ON u.sender_id = p.id
      WHERE u.ticket_id = ${parseInt(ticketId, 10)}
      ORDER BY u.created_at ASC
    `;

    return NextResponse.json({
      success: true,
      messages
    });

  } catch (error: any) {
    console.error("Messages fetch error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      message: error.message 
    }, { status: 500 });
  }
}
