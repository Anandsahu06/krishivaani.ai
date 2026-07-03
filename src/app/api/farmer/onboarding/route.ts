import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function POST(req: Request) {
  try {
    const {
      profileId,
      village,
      district,
      state,
      latitude,
      longitude,
      farmName,
      farmSize,
      soilType,
      irrigationSource,
      waterAvailability,
      currentCrop,
      preferredCropCategory
    } = await req.json();

    if (!profileId) {
      return NextResponse.json({ error: "Profile ID is required" }, { status: 400 });
    }

    // 1. Update Profile's location fields and coordinates
    const [updatedProfile] = await sql`
      UPDATE profiles
      SET 
        village_name = ${village || ''},
        district = ${district || ''},
        state = ${state || ''},
        latitude = ${latitude ? parseFloat(latitude) : null},
        longitude = ${longitude ? parseFloat(longitude) : null}
      WHERE id = ${profileId}
      RETURNING *
    `;

    // 2. Create the Farm associated with the farmer profile
    const sizeAcres = parseFloat(farmSize) || 0;
    
    await sql`
      INSERT INTO farms (
        profile_id, 
        farm_name, 
        total_size_acres, 
        soil_type, 
        irrigation_source, 
        water_availability, 
        current_crop, 
        preferred_crop_category
      )
      VALUES (
        ${profileId}, 
        ${farmName || (updatedProfile.farmer_name + "'s Farm")}, 
        ${sizeAcres}, 
        ${soilType || ''}, 
        ${irrigationSource || ''}, 
        ${waterAvailability || ''}, 
        ${currentCrop || ''}, 
        ${preferredCropCategory || ''}
      )
    `;

    return NextResponse.json({
      success: true,
      profile: updatedProfile
    });

  } catch (error: any) {
    console.error("Farmer onboarding api error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      message: error.message || "Failed to finalize onboarding" 
    }, { status: 500 });
  }
}
