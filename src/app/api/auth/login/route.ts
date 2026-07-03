import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    // Look up profile by phone number
    const [profile] = await sql`
      SELECT * FROM profiles 
      WHERE phone_number = ${phone.trim()} 
      LIMIT 1
    `;

    if (!profile) {
      return NextResponse.json({ 
        error: "Not Found", 
        message: "Your phone number is not registered yet. Please click 'Register / Sign Up' to register your farm." 
      }, { status: 404 });
    }

    // Send a login alert notification
    try {
      const { sendSMS, sendWhatsApp } = require('@/utils/sms');
      const loginMsg = `कृषिवाणी (KrishiVaani) AI: नमस्ते ${profile.farmer_name}, आपने लॉग इन किया है। आपका स्वागत है!`;
      await sendSMS(profile.phone_number, loginMsg);
      await sendWhatsApp(profile.phone_number, loginMsg);
    } catch (smsErr) {
      console.error("SMS notification failed to dispatch:", smsErr);
    }

    return NextResponse.json({
      success: true,
      profile
    });

  } catch (error: any) {
    console.error("Farmer login error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      message: error.message || "Failed to process authentication" 
    }, { status: 500 });
  }
}
