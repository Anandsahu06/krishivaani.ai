import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

// Ensure DATABASE_URL is available
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("DATABASE_URL environment variable is not defined.");
}

// Establish a single database client instance for the Next.js process lifecycle
const sql = postgres(connectionString || '', {
  ssl: 'require',
  connect_timeout: 10,
  idle_timeout: 10,
});

// Self-executing function to auto-setup database schema and seed data on first backend query
(async () => {
  // Prevent running in environments without database credentials (e.g. initial build phases)
  if (!connectionString) return;

  try {
    // Check if the 'profiles' table already exists in the public schema
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles'
      )
    `;

    if (!tableCheck[0]?.exists) {
      console.log("[DB Auto-Setup] Database schema not found. Provisioning public tables...");

      const schemaPath = path.join(process.cwd(), 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        
        // Execute the entire schema.sql queries
        await sql.unsafe(schemaSql);
        console.log("[DB Auto-Setup] Tables created successfully. Seeding hackathon demo data...");

        // Seed default hackathon records
        const adminId = 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1';
        const farmerId = 'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1';

        await sql`
          INSERT INTO profiles (id, phone_number, farmer_name, preferred_language, village_name, district, state, latitude, longitude, role)
          VALUES 
            (${adminId}, '9999999999', 'Dr. Ramesh Kumar (Agri Expert)', 'hi', 'Nagpur HQ', 'Nagpur', 'Maharashtra', 21.1458, 79.0882, 'admin'),
            (${farmerId}, '9876543210', 'Rajesh Patel', 'hi', 'Wadhona', 'Nagpur', 'Maharashtra', 21.2504, 79.1235, 'farmer')
          ON CONFLICT (phone_number) DO NOTHING
        `;

        const [farm] = await sql`
          INSERT INTO farms (profile_id, farm_name, total_size_acres, soil_type, irrigation_source, water_availability, current_crop, preferred_crop_category)
          VALUES 
            (${farmerId}, 'Rajesh Patel Sweet Cotton Farm', 4.5, 'Black Soil (Regur)', 'Well Water', 'Medium (Seasonal)', 'Cotton', 'Cash Crops')
          RETURNING id
        `;

        const mockRecs = [
          {
            crop: "Soybean (सोयाबीन)",
            suitability_score: 92,
            reason: "Soil is rich in organic matter and matches black soil constraints. Fits the current monsoon water level.",
            risks: "Highly sensitive to initial waterlogging. Ensure adequate drainage channels are dug.",
            next_steps: "Purchase certified seed from local cooperative. Treat seeds with Trichoderma before sowing."
          },
          {
            crop: "Pigeon Pea / Tur (अरहर)",
            suitability_score: 85,
            reason: "Deep root system utilizes subsoil moisture. Tolerates dry spells during early vegetative growth.",
            risks: "Pod borer infestation risk. Keep bio-pesticides ready.",
            next_steps: "Intercrop with Soybean in a 4:2 ratio for higher yield stability."
          },
          {
            crop: "Sorghum / Jowar (ज्वार)",
            suitability_score: 78,
            reason: "Extremely drought-tolerant. Suitable if rain is delayed or below average.",
            risks: "Lower market price compared to cash crops.",
            next_steps: "Sow in ridges to maximize rainwater harvesting."
          }
        ];

        await sql`
          INSERT INTO crop_recommendations (profile_id, farm_id, state, district, season, soil_type, farm_size, irrigation_availability, preferred_crop_category, recommendations)
          VALUES 
            (${farmerId}, ${farm.id}, 'Maharashtra', 'Nagpur', 'Kharif', 'Black Soil (Regur)', 4.5, 'Medium (Seasonal)', 'Cash Crops', ${JSON.stringify(mockRecs)})
        `;

        await sql`
          INSERT INTO weather_advisories (profile_id, village_name, district, temperature, humidity, rainfall_forecast, dry_spell_risk, irrigation_guidance, fertilization_guidance, alert_severity, ai_explanation)
          VALUES (
            ${farmerId}, 
            'Wadhona', 
            'Nagpur', 
            33.4, 
            68.0, 
            'No rain expected for next 9 days', 
            'high', 
            'Moderate dry-spell alert. Irrigate cotton plants immediately using drip irrigation during early morning hours to conserve moisture.', 
            'Postpone nitrogen top-dressing (urea application) until moisture is restored. Applying fertilizer under dry soil will burn crop roots.',
            'medium',
            'किसान भाइयों, अगले 9 दिनों तक बारिश की कोई संभावना नहीं है। तापमान 34 डिग्री तक जा सकता है। कृपया अपने कपास के खेतों में सुबह के समय ड्रिप सिंचाई से पानी दें और यूरिया का छिड़काव अभी रोक दें।'
          )
        `;

        const [diagCase] = await sql`
          INSERT INTO diagnosis_cases (profile_id, crop_type, image_url, voice_url, user_notes, ai_disease, ai_remedy, ai_confidence, ai_severity, action_required, status)
          VALUES (
            ${farmerId},
            'Cotton',
            'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800&auto=format&fit=crop',
            '',
            'पत्तियों पर लाल धब्बे आ रहे हैं और वे सूख कर गिर रही हैं। कृपया मार्गदर्शन करें।',
            'Cotton Leaf Blight / Cercospora (पत्ती झुलसा रोग)',
            '1. Remove and burn infected crop residues to check secondary spread.\n2. Spray Copper Oxychloride (2.5 g/L of water) mixed with Streptocycline (1 g/10 L of water) immediately.\n3. Keep the field free from weeds.',
            0.88,
            'high',
            'escalate',
            'new'
          )
          RETURNING id
        `;

        await sql`
          INSERT INTO support_tickets (profile_id, case_id, subject, description, urgency, status)
          VALUES (
            ${farmerId},
            ${diagCase.id},
            'Severe Leaf Spots in Cotton Crop',
            'The Cotton leaves are showing red spots, turning yellow and falling off. High severity leaf blight diagnosed by AI. Requesting expert guidance on chemical sprays.',
            'high',
            'new'
          )
        `;

        await sql`
          INSERT INTO notifications (profile_id, title, message, type)
          VALUES 
            (${farmerId}, 'Dry-Spell Warning (सूखा चेतावनी)', 'No rain forecast for the next 9 days. Read irrigation advisory.', 'weather_alert'),
            (${farmerId}, 'Support Case Created (सपोर्ट केस बनाया गया)', 'Your crop diagnosis case has been escalated to our regional agriculture support expert.', 'ticket_update')
        `;

        console.log("[DB Auto-Setup] Database schema initialized and seeded successfully.");
      } else {
        console.warn("[DB Auto-Setup Warn] schema.sql file not found at project root.");
      }
    }
  } catch (err) {
    console.error("[DB Auto-Setup Error] Auto initialization hook failed:", err);
  }
})();

export default sql;
