import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getWeatherAdvisoryExplainer } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { district, message, drySpellRisk, severity } = await req.json();

    if (!district || !message) {
      return NextResponse.json({ error: "District name and warning message are required" }, { status: 400 });
    }

    // 1. Find all farmers registered in this district
    const farmers = await sql`
      SELECT id, village_name, preferred_language FROM profiles
      WHERE role = 'farmer' AND lower(district) = ${district.toLowerCase().trim()}
    `;

    if (farmers.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: `No farmers registered in district: ${district}. Warning was logged but not dispatched.` 
      });
    }

    // Heuristics/constants for broadcast weather advisory
    const temp = 34.2;
    const humidity = 60;
    const forecast = "Extreme solar heating. Immediate drought caution.";

    // 2. Loop and insert weather advisory warnings for each matching farmer
    for (const farmer of farmers) {
      // Set localized content advice sheets
      const irrigationGuidance = farmer.preferred_language === 'hi' 
        ? 'ड्रिप सिंचाई चालू करें। दोपहर के समय पानी देने से बचें।' 
        : 'Optimize irrigation schedules. Prevent midday evapotranspiration.';
      
      const fertilizationGuidance = farmer.preferred_language === 'hi'
        ? 'रासायनिक खाद का छिड़काव अगले सप्ताह तक के लिए स्थगित करें।'
        : 'Delay application of granular fertilizers to avoid root burning.';

      // Insert advisory record
      await sql`
        INSERT INTO weather_advisories (
          profile_id, 
          village_name, 
          district, 
          temperature, 
          humidity, 
          rainfall_forecast, 
          dry_spell_risk, 
          irrigation_guidance, 
          fertilization_guidance, 
          alert_severity, 
          ai_explanation
        )
        VALUES (
          ${farmer.id}, 
          ${farmer.village_name || 'My Village'}, 
          ${district}, 
          ${temp}, 
          ${humidity}, 
          ${forecast}, 
          ${drySpellRisk || 'high'}, 
          ${irrigationGuidance}, 
          ${fertilizationGuidance}, 
          ${severity || 'medium'}, 
          ${message}
        )
      `;

      // Insert notification
      const notificationTitle = farmer.preferred_language === 'hi'
        ? 'आपातकालीन मौसम अलर्ट (KVK Broadcast Alert)'
        : 'Emergency Weather Alert';

      await sql`
        INSERT INTO notifications (profile_id, title, message, type)
        VALUES (
          ${farmer.id},
          ${notificationTitle},
          ${message.slice(0, 150)},
          'weather_alert'
        )
      `;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully broadcast weather advisories and alert cards to ${farmers.length} farmers in ${district}.`
    });

  } catch (error: any) {
    console.error("Alert broadcast API error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      message: error.message 
    }, { status: 500 });
  }
}
