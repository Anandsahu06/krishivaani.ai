import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // 1. Get latest crop recommendation
    const [latestRecommendation] = await sql`
      SELECT id, recommendations, created_at FROM crop_recommendations
      WHERE profile_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    // 2. Get latest weather advisory
    const [latestAdvisory] = await sql`
      SELECT id, temperature, dry_spell_risk, alert_severity, ai_explanation, created_at FROM weather_advisories
      WHERE profile_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    // 3. Get latest diagnosis case
    const [latestDiagnosis] = await sql`
      SELECT id, crop_type, ai_disease, status, ai_severity, created_at FROM diagnosis_cases
      WHERE profile_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    // 4. Get active escalation ticket count
    const [activeTickets] = await sql`
      SELECT count(*) FROM support_tickets
      WHERE profile_id = ${userId} AND status != 'resolved'
    `;

    // 5. Build recent activities list by combining recent DB entries
    const recentActivities: any[] = [];

    const recs = await sql`
      SELECT 'recommendation' as type, created_at, 'Received recommendations for crop matching.' as message
      FROM crop_recommendations WHERE profile_id = ${userId} ORDER BY created_at DESC LIMIT 3
    `;
    const cases = await sql`
      SELECT 'diagnosis' as type, created_at, concat('Uploaded ', crop_type, ' leaf image. Status: ', status) as message
      FROM diagnosis_cases WHERE profile_id = ${userId} ORDER BY created_at DESC LIMIT 3
    `;
    const tickets = await sql`
      SELECT 'ticket' as type, created_at, concat('Escalated ticket #', id, ' - ', subject) as message
      FROM support_tickets WHERE profile_id = ${userId} ORDER BY created_at DESC LIMIT 3
    `;

    recentActivities.push(...recs, ...cases, ...tickets);
    recentActivities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const finalActivities = recentActivities.slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        latestRecommendation: latestRecommendation || null,
        latestAdvisory: latestAdvisory || null,
        latestDiagnosis: latestDiagnosis || null,
        activeTicketsCount: parseInt(activeTickets.count, 10),
        activities: finalActivities
      }
    });

  } catch (error: any) {
    console.error("Dashboard summary API error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      message: error.message 
    }, { status: 500 });
  }
}
