import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const tickets = await sql`
      SELECT t.*, c.crop_type, c.ai_disease, c.image_url FROM support_tickets t
      LEFT JOIN diagnosis_cases c ON t.case_id = c.id
      WHERE t.profile_id = ${userId}
      ORDER BY t.created_at DESC
    `;

    return NextResponse.json({
      success: true,
      tickets
    });

  } catch (error: any) {
    console.error("Support tickets fetch error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      message: error.message 
    }, { status: 500 });
  }
}
