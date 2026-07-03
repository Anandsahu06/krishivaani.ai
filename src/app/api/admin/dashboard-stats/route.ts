import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(req: Request) {
  try {
    // 1. Total registered farmers
    const [farmers] = await sql`
      SELECT count(*) FROM profiles WHERE role = 'farmer'
    `;

    // 2. Active dry spell alerts count
    const [weatherAlerts] = await sql`
      SELECT count(*) FROM weather_advisories WHERE alert_severity != 'none'
    `;

    // 3. Open diagnosis cases count (status != resolved)
    const [openDiagnoses] = await sql`
      SELECT count(*) FROM diagnosis_cases WHERE status != 'resolved'
    `;

    // 4. Open support tickets count
    const [openTickets] = await sql`
      SELECT count(*) FROM support_tickets WHERE status != 'resolved'
    `;

    // 5. Case distribution by district
    const districtBreakdown = await sql`
      SELECT p.district, count(c.id) as case_count
      FROM diagnosis_cases c
      JOIN profiles p ON c.profile_id = p.id
      GROUP BY p.district
      ORDER BY case_count DESC
      LIMIT 5
    `;

    // 6. Recent cases log
    const recentCases = await sql`
      SELECT c.id, c.crop_type, c.status, c.ai_disease, c.created_at, p.farmer_name, p.village_name
      FROM diagnosis_cases c
      JOIN profiles p ON c.profile_id = p.id
      ORDER BY c.created_at DESC
      LIMIT 5
    `;

    return NextResponse.json({
      success: true,
      data: {
        totalFarmers: parseInt(farmers.count, 10),
        activeAlerts: parseInt(weatherAlerts.count, 10),
        openDiagnoses: parseInt(openDiagnoses.count, 10),
        openTickets: parseInt(openTickets.count, 10),
        districtBreakdown,
        recentCases
      }
    });

  } catch (error: any) {
    console.error("Admin stats API error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      message: error.message 
    }, { status: 500 });
  }
}
