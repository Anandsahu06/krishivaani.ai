import os
from typing import Literal
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

def load_env():
    """Manually loads environment variables from .env if present in the current working directory."""
    if os.path.exists(".env"):
        with open(".env") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    os.environ[key.strip()] = val.strip()

def detect_mime_type(data: bytes) -> str:
    """Helper to detect image MIME type based on magic bytes."""
    if data.startswith(b'\x89PNG\r\n\x1a\n'):
        return 'image/png'
    elif data.startswith(b'\xff\xd8'):
        return 'image/jpeg'
    elif data.startswith(b'GIF87a') or data.startswith(b'GIF89a'):
        return 'image/gif'
    elif data.startswith(b'RIFF') and b'WEBP' in data[8:16]:
        return 'image/webp'
    return 'image/jpeg'  # fallback standard

class CropDiagnosis(BaseModel):
    """Pydantic model representing the strict JSON output schema for crop diagnosis."""
    disease: str = Field(description="String identity naming the detected crop disease or issue.")
    remedy: str = Field(description="Step by step advice string written entirely inside the user_lang target dialect.")
    confidence: float = Field(description="Confidence score of the diagnosis, between 0.0 and 1.0.")
    action_required: Literal["escalate", "resolve"] = Field(description="Action required classification: 'escalate' or 'resolve'.")

class AgriAIEngine:
    """Core AI processing engine configured to interact with the gemini-1.5-flash model."""

    def __init__(self, api_key: str = None, model_name: str = "gemini-1.5-flash"):
        load_env()
        # Initialize the google-genai Client. Picks up GEMINI_API_KEY from environment if not passed.
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY")
        self.client = genai.Client(api_key=self.api_key)
        self.model_name = model_name


    async def diagnose_crop_issue(self, image_bytes: bytes, user_lang: str, voice_text: str = None) -> dict:
        """
        Asynchronously diagnoses a crop issue using a leaf image and optional voice context.
        Enforces a strict system prompt instruction and JSON output matching the CropDiagnosis schema.
        """
        mime_type = detect_mime_type(image_bytes)
        image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)

        contents = [image_part]
        if voice_text:
            contents.append(f"User context voice message description: {voice_text}")
        
        contents.append(
            f"Diagnose this crop issue. The user's language is '{user_lang}'. "
            f"You must supply the 'remedy' advice written entirely in '{user_lang}' dialect/language."
        )

        system_instruction = (
            "You are a professional agricultural plant pathologist AI. Analyze the provided crop leaf image "
            "and optional user voice context to diagnose the issue. You must output JSON conforming "
            "strictly to the requested schema. Ensure the 'remedy' advice is translated and written "
            "entirely in the requested user_lang dialect."
        )

        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            response_mime_type="application/json",
            response_schema=CropDiagnosis,
            temperature=0.2
        )

        async with self.client.aio as aclient:
            response = await aclient.models.generate_content(
                model=self.model_name,
                contents=contents,
                config=config
            )

        # Retrieve parsed response or parse manually
        if response.parsed:
            return response.parsed.model_dump()
        else:
            import json
            return json.loads(response.text)

    async def get_crop_recommendation(self, soil_data: dict, weather_forecast: dict, target_lang: str) -> str:
        """
        Asynchronously analyzes soil data and weather forecast vectors to recommend crops
        and structural farming advice in the specified target language.
        """
        prompt = (
            f"Soil Parameters: {soil_data}\n"
            f"Weather Forecast: {weather_forecast}\n\n"
            f"Please recommend suitable crops and provide localized structural advice. "
            f"The final output must be in the '{target_lang}' language."
        )

        system_instruction = (
            "You are an expert agricultural systems agronomist advisor. Analyze the provided soil vectors "
            "and weather forecast data. Return localized structural crop advice recommendations in the "
            "specified target native language framework. Keep the recommendations practical, logical, and fully localized."
        )

        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.3
        )

        async with self.client.aio as aclient:
            response = await aclient.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=config
            )

        return response.text
