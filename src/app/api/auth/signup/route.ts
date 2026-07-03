import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { name, phone, language, village, district, state } = await req.json();

    if (!name || !phone || !language) {
      return NextResponse.json({ error: "Missing required fields (Name, Phone, Language)" }, { status: 400 });
    }

    // Check if phone number is already registered
    const [existing] = await sql`
      SELECT id FROM profiles 
      WHERE phone_number = ${phone.trim()} 
      LIMIT 1
    `;

    if (existing) {
      // Auto-retrieve full profile details and return as success login fallback
      const [profile] = await sql`
        SELECT * FROM profiles 
        WHERE id = ${existing.id}
      `;
      return NextResponse.json({ 
        success: true,
        profile,
        message: "Account already exists. Logged in successfully."
      });
    }

    // Insert new profile
    const [newProfile] = await sql`
      INSERT INTO profiles (farmer_name, phone_number, preferred_language, village_name, district, state, role)
      VALUES (${name.trim()}, ${phone.trim()}, ${language}, ${village || ''}, ${district || ''}, ${state || ''}, 'farmer')
      RETURNING *
    `;

    // Send a signup welcome notification
    try {
      const { sendSMS, sendWhatsApp } = require('@/utils/sms');
      const signupMsg = `कृषिवाणी (KrishiVaani) AI: नमस्ते ${newProfile.farmer_name}, कृषिवाणी पर आपका पंजीकरण सफल रहा! अपनी फसल और खेत की सलाह पाने के लिए डैशबोर्ड देखें।`;
      await sendSMS(newProfile.phone_number, signupMsg);
      await sendWhatsApp(newProfile.phone_number, signupMsg);
    } catch (smsErr) {
      console.error("Signup SMS notification failed to dispatch:", smsErr);
    }

    return NextResponse.json({
      success: true,
      profile: newProfile
    });

  } catch (error: any) {
    console.error("Farmer signup error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      message: error.message || "Failed to create profile" 
    }, { status: 500 });
  }
}
