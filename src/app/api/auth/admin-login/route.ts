import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { phone, password } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    // Lookup profile by phone and verify role is admin
    const [profile] = await sql`
      SELECT * FROM profiles 
      WHERE phone_number = ${phone.trim()} AND role = 'admin'
      LIMIT 1
    `;

    if (!profile) {
      return NextResponse.json({ 
        error: "Access Denied", 
        message: "No expert profile found with this credentials or you are not authorized as an expert." 
      }, { status: 403 });
    }

    // For a hackathon, we allow simple validation or matching password if entered
    if (password && password !== "admin123" && phone === "9999999999") {
      return NextResponse.json({ 
        error: "Incorrect Password", 
        message: "The password you entered is incorrect. Default password is 'admin123'." 
      }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      profile
    });

  } catch (error: any) {
    console.error("Admin login error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      message: error.message || "Failed to process expert authentication" 
    }, { status: 500 });
  }
}
