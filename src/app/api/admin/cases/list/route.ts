import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || '';
    const district = searchParams.get('district') || '';
    const crop = searchParams.get('crop') || '';

    // Dynamically build filters
    let query = sql`
      SELECT 
        c.id as case_id,
        c.crop_type,
        c.ai_disease,
        c.ai_severity,
        c.status,
        c.created_at,
        p.farmer_name,
        p.phone_number,
        p.village_name,
        p.district,
        t.id as ticket_id
      FROM diagnosis_cases c
      JOIN profiles p ON c.profile_id = p.id
      LEFT JOIN support_tickets t ON t.case_id = c.id
      WHERE 1=1
    `;

    // Apply filters
    if (status && status !== 'all') {
      query = sql`${query} AND c.status = ${status}`;
    }
    if (district && district !== 'all') {
      query = sql`${query} AND p.district = ${district}`;
    }
    if (crop && crop !== 'all') {
      query = sql`${query} AND c.crop_type = ${crop}`;
    }

    // Sort order
    query = sql`${query} ORDER BY c.created_at DESC`;

    const casesList = await query;

    return NextResponse.json({
      success: true,
      cases: casesList
    });

  } catch (error: any) {
    console.error("Fetch admin cases error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      message: error.message 
    }, { status: 500 });
  }
}
