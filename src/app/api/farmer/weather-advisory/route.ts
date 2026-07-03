import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getWeatherAdvisoryExplainer } from '@/lib/gemini';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const lang = searchParams.get('lang') || 'hi';

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // 1. Lookup farmer profile to resolve coordinates
    const [profile] = await sql`
      SELECT * FROM profiles WHERE id = ${userId} LIMIT 1
    `;

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // 2. Resolve latitude and longitude
    let lat = 21.1458;
    let lon = 79.0882;

    if (profile.latitude && profile.longitude) {
      lat = parseFloat(profile.latitude);
      lon = parseFloat(profile.longitude);
    } else {
      const farmerDistrict = (profile.district || '').toLowerCase().trim();
      if (farmerDistrict === 'kanpur' || farmerDistrict === 'lucknow') {
        lat = 26.4499;
        lon = 80.3319;
      } else if (farmerDistrict === 'nagpur' || farmerDistrict === 'wardha') {
        lat = 21.1458;
        lon = 79.0882;
      } else if (farmerDistrict === 'bengaluru' || farmerDistrict === 'mysuru') {
        lat = 12.9716;
        lon = 77.5946;
      }
    }

    // 3. Query Open-Meteo API for real-time temperature and humidity
    let temp = 31.5;
    let humidity = 62;

    try {
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m`,
        { next: { revalidate: 60 } } // Cache weather data for maximum 1 minute to avoid rate limits
      );
      if (weatherRes.ok) {
        const weatherData = await weatherRes.json();
        if (weatherData.current) {
          temp = parseFloat(weatherData.current.temperature_2m);
          humidity = parseInt(weatherData.current.relative_humidity_2m, 10);
          console.log(`[Open-Meteo API Success] Coords: ${lat}, ${lon} | Temperature: ${temp}°C, Humidity: ${humidity}%`);
        }
      }
    } catch (weatherErr) {
      console.error("Open-Meteo real weather lookup failed, using local heuristics:", weatherErr);
    }

    // 4. Determine forecast text and dry-spell warnings based on metrics
    let forecast = "Scattered clouds. Scattered light showers expected in 3 days.";
    let drySpellRisk: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    let alertSeverity = 'low';

    if (temp >= 35) {
      forecast = "Intense heat wave alert. Extreme solar radiation; no rain expected for the next 10 days.";
      drySpellRisk = 'critical';
      alertSeverity = 'high';
    } else if (temp >= 31 && humidity < 60) {
      forecast = "Dry spell warning. Clear skies and high solar heating; no rain expected for 8 days.";
      drySpellRisk = 'high';
      alertSeverity = 'medium';
    } else if (humidity > 75) {
      forecast = "Monsoon showers active. Moderate to heavy rain expected daily.";
      drySpellRisk = 'low';
      alertSeverity = 'none';
    }

    // 5. Call Gemini to generate localized agronomy advisory
    const aiExplanation = await getWeatherAdvisoryExplainer({
      village: profile.village_name || 'My Village',
      district: profile.district || 'Nagpur',
      temp,
      humidity,
      forecast,
      drySpellRisk,
      language: lang
    });

    const irrigationGuidance = lang === 'hi' 
      ? 'खेत में नमी बनाए रखने के लिए सुबह और शाम के समय ड्रिप सिंचाई द्वारा हल्की सिंचाई करें।'
      : 'Maintain root zone humidity. Conduct drip irrigation during cooler morning/evening hours.';
    
    const fertilizationGuidance = lang === 'hi'
      ? 'नमी की स्थिति में ही नाइट्रोजन यूरिया का छिड़काव करें। सूखी मिट्टी में खाद डालने से बचें।'
      : 'Apply nitrogen urea only when soil has sufficient moisture to prevent fertilizer burn.';

    // 6. Write record to database advisories list
    const [newAdvisory] = await sql`
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
        ${userId}, 
        ${profile.village_name || 'My Village'}, 
        ${profile.district || 'Nagpur'}, 
        ${temp}, 
        ${humidity}, 
        ${forecast}, 
        ${drySpellRisk}, 
        ${irrigationGuidance}, 
        ${fertilizationGuidance}, 
        ${alertSeverity}, 
        ${aiExplanation}
      )
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      advisory: newAdvisory
    });

  } catch (error: any) {
    console.error("Failed to generate real-time weather advisory:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      message: error.message 
    }, { status: 500 });
  }
}
