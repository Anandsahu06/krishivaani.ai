import os
import requests
import psycopg2
from psycopg2.extras import RealDictCursor
from xml.sax.saxutils import escape as xml_escape
from fastapi import FastAPI, Form, Response, HTTPException

# Import the AgriAIEngine component
from ai_engine import AgriAIEngine, load_env

# Ensure env variables are loaded
load_env()

app = FastAPI(title="Krishivaani.ai Webhook Orchestrator")

def get_db_connection():
    """Establish connection to PostgreSQL using psycopg2."""
    database_url = os.environ.get("DATABASE_URL")
    
    # Use DATABASE_URL if properly configured
    if database_url and "YOUR_DB_PASSWORD_HERE" not in database_url:
        return psycopg2.connect(database_url)
        
    # Fallback to individual connection parameters
    host = os.environ.get("DB_HOST", "aws-1-ap-southeast-1.pooler.supabase.com")
    port = os.environ.get("DB_PORT", "5432")
    name = os.environ.get("DB_NAME", "postgres")
    user = os.environ.get("DB_USER", "postgres.mbmkpyhxzicdayuwdsqi")
    password = os.environ.get("DB_PASSWORD")
    
    return psycopg2.connect(
        host=host,
        port=port,
        dbname=name,
        user=user,
        password=password
    )

def get_or_create_profile(phone_number: str) -> dict:
    """
    Queries the profiles table matching the caller's telephone number.
    If the record does not exist, initializes a fallback template profile row.
    """
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT * FROM profiles WHERE phone_number = %s;", (phone_number,))
            profile = cur.fetchone()
            
            if not profile:
                print(f"Profile for {phone_number} not found. Creating fallback profile...")
                cur.execute(
                    """
                    INSERT INTO profiles (phone_number, farmer_name, preferred_language, village_name, latitude, longitude, soil_profile)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    RETURNING *;
                    """,
                    (phone_number, 'Unknown Farmer', 'en', 'Unknown', 0.0, 0.0, '{}')
                )
                profile = cur.fetchone()
                conn.commit()
                
            return dict(profile)
    except Exception as e:
        conn.rollback()
        print(f"Database error in get_or_create_profile: {e}")
        raise e
    finally:
        conn.close()

def log_case(profile_id: str, crop_type: str, user_message_text: str, image_url: str, ai_output: dict):
    """
    Logs a new record entry to the 'cases' table.
    Sets status state directly to 'escalated' if action_required == 'escalate'.
    """
    conn = get_db_connection()
    try:
        # Determine status
        status = 'resolved'
        if ai_output and ai_output.get('action_required') == 'escalate':
            status = 'escalated'
            
        import json
        ai_json = json.dumps(ai_output) if ai_output else '{}'
        
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO cases (profile_id, crop_type, user_message_text, image_storage_url, ai_diagnosis_output, status)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id;
                """,
                (profile_id, crop_type, user_message_text, image_url, ai_json, status)
            )
            case_id = cur.fetchone()[0]
            conn.commit()
            print(f"Logged new case ID: {case_id} with status: {status}")
            return case_id
    except Exception as e:
        conn.rollback()
        print(f"Database error in log_case: {e}")
        raise e
    finally:
        conn.close()

@app.get("/")
def read_root():
    return {"message": "Krishivaani.ai Web Orchestration App is running!"}

@app.post("/api/webhook/farmer")
async def twilio_webhook(
    From: str = Form(...),
    Body: str = Form(None),
    MediaUrl0: str = Form(None)
):
    """
    Handles Twilio's incoming webhook payload. Parses Form Data, queries/provisions
    caller profiles, executes AI crop issue diagnoses, logs cases, and returns valid TwiML.
    """
    print(f"Received webhook request from: {From}")
    
    # 1. Retrieve or create profile
    try:
        profile = get_or_create_profile(From)
        preferred_lang = profile.get('preferred_language') or 'en'
    except Exception as e:
        # Database connectivity fallback
        print(f"Could not connect to database: {e}")
        preferred_lang = 'en'
        profile = {'phone_number': From, 'preferred_language': 'en'}

    remedy_text = ""
    ai_output = None
    crop_type = "Unknown"

    # 2. Process image asset if MediaUrl0 is present
    if MediaUrl0:
        print(f"Processing image diagnosis for MediaUrl0: {MediaUrl0}")
        try:
            # Download image data
            img_res = requests.get(MediaUrl0, timeout=15)
            if img_res.status_code == 200:
                image_bytes = img_res.content
                
                # Execute AI Diagnosis using AgriAIEngine
                model_name = os.environ.get("GEMINI_MODEL_NAME", "gemini-2.5-flash")
                engine = AgriAIEngine(model_name=model_name)
                
                ai_output = await engine.diagnose_crop_issue(
                    image_bytes=image_bytes,
                    user_lang=preferred_lang,
                    voice_text=Body
                )
                
                remedy_text = ai_output.get("remedy", "No specific remedy provided by AI.")
                crop_type = ai_output.get("disease", "Unknown Crop Issue")
            else:
                remedy_text = f"Error: Unable to fetch image from Twilio gateway (HTTP {img_res.status_code})."
        except Exception as e:
            print(f"AI diagnosis processing failed: {e}")
            remedy_text = f"Error: AI processing encountered an exception during analysis: {str(e)}"
    else:
        # User message did not contain a Media attachment
        print("No media URL provided. Sending fallback instructions.")
        remedy_text = (
            "Welcome to Krishivaani.ai! Please send an image of your crop leaf "
            "showing the disease or damage, along with any description, and we will diagnose it."
        )

    # 3. Log a new record entry to the 'cases' table
    try:
        log_case(
            profile_id=From,
            crop_type=crop_type,
            user_message_text=Body,
            image_url=MediaUrl0,
            ai_output=ai_output
        )
    except Exception as e:
        print(f"Case logging failed: {e}")

    # 4. Formulate Twilio TwiML XML payload containing remedy or guidelines
    twiml_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>{xml_escape(remedy_text)}</Message>
</Response>"""

    return Response(content=twiml_xml, media_type="application/xml")
