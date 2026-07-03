import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const notifications = await sql`
      SELECT * FROM notifications 
      WHERE profile_id = ${userId} 
      ORDER BY created_at DESC 
      LIMIT 15
    `;

    return NextResponse.json({
      success: true,
      notifications
    });

  } catch (error: any) {
    console.error("Notifications fetch error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      message: error.message 
    }, { status: 500 });
  }
}
