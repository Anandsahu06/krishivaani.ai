import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // 1. Get all crop recommendations
    const recommendations = await sql`
      SELECT * FROM crop_recommendations
      WHERE profile_id = ${userId}
      ORDER BY created_at DESC
    `;

    // 2. Get all crop diagnosis cases
    const diagnoses = await sql`
      SELECT * FROM diagnosis_cases
      WHERE profile_id = ${userId}
      ORDER BY created_at DESC
    `;

    // 3. Get all weather advisories
    const weatherAdvisories = await sql`
      SELECT * FROM weather_advisories
      WHERE profile_id = ${userId}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({
      success: true,
      data: {
        recommendations,
        diagnoses,
        weatherAdvisories
      }
    });

  } catch (error: any) {
    console.error("Farmer history API error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      message: error.message 
    }, { status: 500 });
  }
}
