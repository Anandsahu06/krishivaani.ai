import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function POST(req: Request) {
  try {
    const {
      profileId,
      name,
      language,
      village,
      district,
      state,
      farmSize,
      soilType,
      irrigationSource,
      waterAvailability,
      currentCrop,
      preferredCropCategory
    } = await req.json();

    if (!profileId || !name) {
      return NextResponse.json({ error: "Profile ID and Name are required" }, { status: 400 });
    }

    // 1. Update profile
    const [updatedProfile] = await sql`
      UPDATE profiles
      SET 
        farmer_name = ${name.trim()},
        preferred_language = ${language},
        village_name = ${village || ''},
        district = ${district || ''},
        state = ${state || ''}
      WHERE id = ${profileId}
      RETURNING *
    `;

    // 2. Update farm details (associated with profile)
    const size = parseFloat(farmSize) || 0;
    
    // Check if farm exists first
    const [existingFarm] = await sql`
      SELECT id FROM farms WHERE profile_id = ${profileId} LIMIT 1
    `;

    if (existingFarm) {
      await sql`
        UPDATE farms
        SET 
          total_size_acres = ${size},
          soil_type = ${soilType},
          irrigation_source = ${irrigationSource},
          water_availability = ${waterAvailability},
          current_crop = ${currentCrop},
          preferred_crop_category = ${preferredCropCategory}
        WHERE profile_id = ${profileId}
      `;
    } else {
      await sql`
        INSERT INTO farms (
          profile_id, total_size_acres, soil_type, irrigation_source, water_availability, current_crop, preferred_crop_category
        ) VALUES (
          ${profileId}, ${size}, ${soilType}, ${irrigationSource}, ${waterAvailability}, ${currentCrop}, ${preferredCropCategory}
        )
      `;
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile
    });

  } catch (error: any) {
    console.error("Profile update API error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      message: error.message 
    }, { status: 500 });
  }
}
