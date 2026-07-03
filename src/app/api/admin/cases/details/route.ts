import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const caseId = searchParams.get('caseId');

    if (!caseId) {
      return NextResponse.json({ error: "caseId is required" }, { status: 400 });
    }

    const id = parseInt(caseId, 10);

    // 1. Fetch case details with farmer profile metadata
    const [caseDetails] = await sql`
      SELECT 
        c.*, 
        p.farmer_name, 
        p.phone_number, 
        p.village_name, 
        p.district, 
        p.state, 
        p.latitude, 
        p.longitude,
        p.preferred_language
      FROM diagnosis_cases c
      JOIN profiles p ON c.profile_id = p.id
      WHERE c.id = ${id}
      LIMIT 1
    `;

    if (!caseDetails) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    // 2. Fetch farm profile context
    const [farm] = await sql`
      SELECT * FROM farms 
      WHERE profile_id = ${caseDetails.profile_id} 
      LIMIT 1
    `;

    // 3. Fetch support ticket if exists
    const [ticket] = await sql`
      SELECT * FROM support_tickets 
      WHERE case_id = ${id} 
      LIMIT 1
    `;

    // 4. Fetch ticket messages if ticket exists
    let messages: any[] = [];
    if (ticket) {
      messages = await sql`
        SELECT u.*, p.farmer_name as sender_name, p.role as sender_role 
        FROM ticket_updates u
        LEFT JOIN profiles p ON u.sender_id = p.id
        WHERE u.ticket_id = ${ticket.id}
        ORDER BY u.created_at ASC
      `;
    }

    return NextResponse.json({
      success: true,
      data: {
        caseDetails,
        farm: farm || null,
        ticket: ticket || null,
        messages
      }
    });

  } catch (error: any) {
    console.error("Admin case details query error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      message: error.message 
    }, { status: 500 });
  }
}
