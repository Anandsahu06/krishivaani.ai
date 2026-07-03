import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // Get profile
    const [profile] = await sql`
      SELECT * FROM profiles WHERE id = ${userId} LIMIT 1
    `;

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get active farm
    const [farm] = await sql`
      SELECT * FROM farms 
      WHERE profile_id = ${userId} 
      ORDER BY created_at DESC 
      LIMIT 1
    `;

    return NextResponse.json({
      success: true,
      profile,
      farm: farm || null
    });

  } catch (error: any) {
    console.error("Active farm fetch error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      message: error.message 
    }, { status: 500 });
  }
}
