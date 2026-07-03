import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not defined in the environment variables.");
}

const ai = new GoogleGenAI({ apiKey });

// Types for Crop Recommendation
export interface CropRecInput {
  state: string;
  district: string;
  season: string;
  soilType: string;
  farmSize: number;
  irrigationAvailability: string;
  preferredCropCategory?: string;
  language?: string;
}

export interface RecommendedCrop {
  cropName: string;
  suitabilityScore: number;
  reason: string;
  risks: string;
  nextSteps: string;
}

// Types for Crop Diagnosis
export interface DiagnosisInput {
  imageBufferBase64: string; // base64 string
  mimeType: string;
  userNotes?: string;
  language?: string;
}

export interface DiagnosisResult {
  disease: string;
  remedy: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  actionRequired: 'escalate' | 'resolve';
}

// 1. Crop Recommendation Service
export async function getCropRecommendation(input: CropRecInput): Promise<RecommendedCrop[]> {
  const language = input.language || 'hi';
  const systemInstruction = `You are a professional agricultural systems agronomist and crop expert for Indian farmers. 
Your goal is to recommend the top 3 most suitable crops for a farm based on geography, season, soil type, farm size, and irrigation availability. 
You must output a JSON array of exactly 3 recommended crops, matching the requested schema.
All explanations, reasons, risks, and next steps must be written in the language specified: '${language}' (e.g. Hindi or English). 
Make the advice highly practical, simple to understand for a farmer, and localized for their region.`;

  const prompt = `
Farm Configuration:
- State: ${input.state}
- District: ${input.district}
- Season (Sowing Season): ${input.season}
- Soil Type: ${input.soilType}
- Farm Size: ${input.farmSize} acres
- Irrigation Availability: ${input.irrigationAvailability}
- Preferred Crop Category: ${input.preferredCropCategory || 'Any'}

Please recommend the top 3 crops. Use the following JSON schema:
[
  {
    "cropName": "Name of the crop in English and local script (e.g. 'Soybean (सोयाबीन)')",
    "suitabilityScore": 95,
    "reason": "Detailed reason why this crop fits this soil, season, and region",
    "risks": "Potential risk notes (e.g., pests, water requirements, price volatility)",
    "nextSteps": "Sowing and land preparation advice"
  }
]
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.2,
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No text response from Gemini");
    }

    const parsed: RecommendedCrop[] = JSON.parse(responseText.trim());
    return parsed;
  } catch (error) {
    console.error("Gemini crop recommendation failed:", error);
    // Return mock fallback data
    return [
      {
        cropName: "Soybean (सोयाबीन) [Fallback]",
        suitabilityScore: 90,
        reason: "Well suited for the Nagpur black soil matrix and rainy Kharif season.",
        risks: "Sensitive to heavy stagnant water. Construct proper drainage paths.",
        nextSteps: "Purchase seeds from government cooperative. Apply chemical seed treatment before sowing."
      },
      {
        cropName: "Pigeon Pea / Tur (अरहर) [Fallback]",
        suitabilityScore: 82,
        reason: "Excellent nitrogen-fixation properties for black soil; low water requirement.",
        risks: "Vulnerable to pod borer insect during mid-growth.",
        nextSteps: "Sow in ridges 1.5 feet apart. Mix organic compost prior to sowing."
      },
      {
        cropName: "Sorghum / Jowar (ज्वार) [Fallback]",
        suitabilityScore: 75,
        reason: "Drought resistant crop, minimal irrigation needed.",
        risks: "Lower yield returns if excessive rain occurs late season.",
        nextSteps: "Prepare seedbed to depth of 5-10 cm. Sow with early monsoon showers."
      }
    ];
  }
}

// 2. Crop Diagnosis Service
export async function diagnoseCropDisease(input: DiagnosisInput): Promise<DiagnosisResult> {
  const language = input.language || 'hi';
  const systemInstruction = `You are an expert plant pathologist AI. 
Your goal is to inspect the crop leaf image, consider any farmer notes/complaints, and diagnose the disease or pest issue.
You must output a JSON object adhering to the schema requested.
All remedies and descriptions must be translated and written entirely in the requested language: '${language}' (e.g. Hindi or English). 
Provide simple, natural, and actionable remedies (chemical and organic) that a marginal farmer can easily follow.`;

  const prompt = `
Farmer Notes: "${input.userNotes || 'No notes provided'}"
Identify the plant disease and provide remedy steps. Use the following JSON schema:
{
  "disease": "Disease name in English and local script (e.g. 'Cotton Leaf Blight (पत्ती झुलसा रोग)')",
  "remedy": "Step-by-step remedy guidelines in bullet points",
  "confidence": 0.85,
  "severity": "low" | "medium" | "high",
  "actionRequired": "escalate" | "resolve"
}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          inlineData: {
            data: input.imageBufferBase64,
            mimeType: input.mimeType
          }
        },
        prompt
      ],
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.1,
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No text response from Gemini");
    }

    const parsed: DiagnosisResult = JSON.parse(responseText.trim());
    return parsed;
  } catch (error) {
    console.error("Gemini crop diagnosis failed:", error);
    // Return mock fallback data
    return {
      disease: "Cotton Leaf Blight / Cercospora (पत्ती झुलसा रोग) [Fallback]",
      remedy: "1. Remove affected leaves to stop the spread.\n2. Spray Copper Oxychloride (2.5g per litre of water).\n3. Keep the farm soil aerated and avoid overwatering.",
      confidence: 0.75,
      severity: "high",
      actionRequired: "escalate"
    };
  }
}

// 3. Weather Advisory Explainer Service
export interface WeatherAdvisoryInput {
  village: string;
  district: string;
  temp: number;
  humidity: number;
  forecast: string;
  drySpellRisk: 'low' | 'medium' | 'high' | 'critical';
  language?: string;
}

export async function getWeatherAdvisoryExplainer(input: WeatherAdvisoryInput): Promise<string> {
  const language = input.language || 'hi';
  const systemInstruction = `You are a regional Krishi Vigyan Kendra (KVK) advisory AI. 
Your goal is to provide a warm, encouraging, yet precise farmer advisory message in the language: '${language}' (e.g. Hindi or English). 
Summarize the current weather conditions, address the dry-spell threat, and give actionable farming tips (e.g. irrigation adjustments, timing for fertilizer/pest sprays).
Keep it concise, friendly, and structured as if sent via voice or SMS.`;

  const prompt = `
Location: ${input.village}, ${input.district}
Current Temperature: ${input.temp}°C
Humidity: ${input.humidity}%
Forecast: ${input.forecast}
Dry Spell Risk: ${input.drySpellRisk}

Provide the advisory explainer in '${language}'.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.3,
      }
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.error("Gemini weather advisory failed:", error);
    if (language === 'hi') {
      return `किसान भाइयों, ${input.village} में तापमान ${input.temp}°C और सूखा जोखिम ${input.drySpellRisk} है। ${input.forecast} के कारण फसल में सिंचाई की कमी न होने दें। आवश्यकतानुसार सुबह के समय सिंचाई करें।`;
    }
    return `Farmer brothers, the temperature in ${input.village} is ${input.temp}°C and the dry-spell risk is ${input.drySpellRisk}. Due to ${input.forecast}, maintain adequate soil moisture. Irrigate in the early morning hours.`;
  }
}
