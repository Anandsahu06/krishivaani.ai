import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Recommendation ID is required" }, { status: 400 });
    }

    const [recommendation] = await sql`
      SELECT * FROM crop_recommendations 
      WHERE id = ${parseInt(id, 10)} 
      LIMIT 1
    `;

    if (!recommendation) {
      return NextResponse.json({ error: "Recommendation record not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: recommendation
    });

  } catch (error: any) {
    console.error("Fetch recommendation details error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      message: error.message 
    }, { status: 500 });
  }
}
