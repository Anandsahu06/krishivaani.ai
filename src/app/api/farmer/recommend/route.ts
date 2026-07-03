import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getCropRecommendation } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const {
      profileId,
      state,
      district,
      season,
      soilType,
      farmSize,
      irrigationAvailability,
      preferredCropCategory,
      language
    } = await req.json();

    if (!profileId || !state || !district || !season || !soilType || !farmSize) {
      return NextResponse.json({ error: "Missing required farm parameters" }, { status: 400 });
    }

    // 1. Fetch user's active farm ID if exists
    const [farm] = await sql`
      SELECT id FROM farms 
      WHERE profile_id = ${profileId} 
      LIMIT 1
    `;
    const farmId = farm ? farm.id : null;

    // 2. Call Gemini agronomist engine to get top-3 crop recommendations
    const recommendations = await getCropRecommendation({
      state,
      district,
      season,
      soilType,
      farmSize: parseFloat(farmSize) || 0,
      irrigationAvailability,
      preferredCropCategory,
      language: language || 'hi'
    });

    // 3. Save recommendations request and results in the database
    const [savedRec] = await sql`
      INSERT INTO crop_recommendations (
        profile_id, 
        farm_id, 
        state, 
        district, 
        season, 
        soil_type, 
        farm_size, 
        irrigation_availability, 
        preferred_crop_category, 
        recommendations
      )
      VALUES (
        ${profileId}, 
        ${farmId}, 
        ${state}, 
        ${district}, 
        ${season}, 
        ${soilType}, 
        ${parseFloat(farmSize)}, 
        ${irrigationAvailability}, 
        ${preferredCropCategory || 'Any'}, 
        ${JSON.stringify(recommendations)}
      )
      RETURNING id
    `;

    // Send a recommendation alert notification
    try {
      const [profile] = await sql`SELECT phone_number, farmer_name FROM profiles WHERE id = ${profileId} LIMIT 1`;
      if (profile && recommendations && recommendations.length > 0) {
        const topCrop = recommendations[0];
        const { sendSMS, sendWhatsApp } = require('@/utils/sms');
        const recommendMsg = `कृषिवाणी (KrishiVaani) AI: नमस्ते ${profile.farmer_name}, आपकी मिट्टी के लिए सर्वोत्तम अनुशंसित फसल: ${topCrop.cropName} (सूटिबिलिटी: ${topCrop.suitabilityScore}%)। विवरण देखने के लिए ऐप में जाएँ!`;
        await sendSMS(profile.phone_number, recommendMsg);
        await sendWhatsApp(profile.phone_number, recommendMsg);
      }
    } catch (smsErr) {
      console.error("Recommendation SMS notification failed to dispatch:", smsErr);
    }

    return NextResponse.json({
      success: true,
      recommendationId: savedRec.id
    });

  } catch (error: any) {
    console.error("Crop recommendation API error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      message: error.message || "Failed to generate recommendations" 
    }, { status: 500 });
  }
}
