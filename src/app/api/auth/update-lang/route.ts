import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { userId, language } = await req.json();
    if (!userId || !language) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    
    await sql`
      UPDATE profiles 
      SET preferred_language = ${language} 
      WHERE id = ${userId}
    `;
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to update language in DB:", error);
    return NextResponse.json({ error: error.message || "Failed to update language" }, { status: 500 });
  }
}
