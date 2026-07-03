import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Case ID is required" }, { status: 400 });
    }

    const [diagnosisCase] = await sql`
      SELECT c.*, t.id as ticket_id FROM diagnosis_cases c
      LEFT JOIN support_tickets t ON t.case_id = c.id
      WHERE c.id = ${parseInt(id, 10)} 
      LIMIT 1
    `;

    if (!diagnosisCase) {
      return NextResponse.json({ error: "Diagnosis record not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: diagnosisCase
    });

  } catch (error: any) {
    console.error("Fetch diagnosis details error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      message: error.message 
    }, { status: 500 });
  }
}
