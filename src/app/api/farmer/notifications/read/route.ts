import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    await sql`
      UPDATE notifications 
      SET is_read = true 
      WHERE profile_id = ${userId}
    `;

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Notifications read mark error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
