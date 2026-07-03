import os
import sys
import psycopg2
from psycopg2 import sql

def load_env():
    """Manually loads environment variables from .env if present."""
    if os.path.exists(".env"):
        with open(".env") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    os.environ[key.strip()] = val.strip()

def get_connection():
    """Attempts to establish connection to PostgreSQL using psycopg2."""
    load_env()
    
    database_url = os.environ.get("DATABASE_URL")
    
    # If DATABASE_URL is set and not using the placeholder
    if database_url and "YOUR_DB_PASSWORD_HERE" not in database_url:
        print(f"Connecting to database using DATABASE_URL...")
        return psycopg2.connect(database_url)
        
    # Fallback to individual connection parameters
    host = os.environ.get("DB_HOST", "db.mbmkpyhxzicdayuwdsqi.supabase.co")
    port = os.environ.get("DB_PORT", "5432")
    name = os.environ.get("DB_NAME", "postgres")
    user = os.environ.get("DB_USER", "postgres")
    password = os.environ.get("DB_PASSWORD")
    
    if not password or password == "YOUR_DB_PASSWORD_HERE":
        print("[ERROR] Database password is not configured in the .env file.")
        print("Please replace 'YOUR_DB_PASSWORD_HERE' with your actual Supabase DB password.")
        sys.exit(1)
        
    print(f"Connecting to database at {host}:{port}/{name} as {user}...")
    return psycopg2.connect(
        host=host,
        port=port,
        dbname=name,
        user=user,
        password=password
    )

def init_db():
    """Executes DDL operations to safely provision tables if they do not exist."""
    
    # SQL DDL statements for creating the tables
    queries = [
        # 1. Profiles Table
        """
        CREATE TABLE IF NOT EXISTS profiles (
            phone_number VARCHAR(50) PRIMARY KEY,
            farmer_name VARCHAR(255) NOT NULL,
            preferred_language VARCHAR(50) DEFAULT 'en',
            village_name VARCHAR(255),
            latitude DOUBLE PRECISION,
            longitude DOUBLE PRECISION,
            soil_profile JSONB DEFAULT '{}'::jsonb,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
        );
        """,
        
        # 2. Cases Table
        """
        CREATE TABLE IF NOT EXISTS cases (
            id SERIAL PRIMARY KEY,
            profile_id VARCHAR(50) REFERENCES profiles(phone_number) ON DELETE CASCADE,
            crop_type VARCHAR(100),
            user_message_text TEXT,
            audio_storage_url TEXT,
            image_storage_url TEXT,
            ai_diagnosis_output JSONB DEFAULT '{}'::jsonb,
            status VARCHAR(50) DEFAULT 'resolved',
            expert_notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL

        );
        """,
        
        # 3. Weather Alerts Table
        """
        CREATE TABLE IF NOT EXISTS weather_alerts (
            id SERIAL PRIMARY KEY,
            village_name VARCHAR(255),
            anomaly_details JSONB DEFAULT '{}'::jsonb,
            alert_message TEXT,
            dispatched_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
        );
        """
    ]
    
    conn = None
    try:
        conn = get_connection()
        # Set autocommit to False so we can use transaction blocks
        conn.autocommit = False
        with conn.cursor() as cur:
            # Execute table creation
            print("Provisioning 'profiles' table...")
            cur.execute(queries[0])
            
            print("Provisioning 'cases' table...")
            cur.execute(queries[1])
            
            print("Provisioning 'weather_alerts' table...")
            cur.execute(queries[2])
            
            # Create indices for optimization if they do not exist
            print("Creating optimizations indices...")
            cur.execute("CREATE INDEX IF NOT EXISTS idx_cases_profile_id ON cases(profile_id);")
            cur.execute("CREATE INDEX IF NOT EXISTS idx_weather_alerts_village ON weather_alerts(village_name);")
            
            # Commit the transaction
            conn.commit()
            print("Database tables initialized and provisioned successfully!")
            
    except psycopg2.OperationalError as e:
        print(f"\n[Connection Error] Could not connect to the database: {e}")
        print("Please check your network connection, host URL, and database credentials.")
        if conn:
            conn.rollback()
    except Exception as e:
        print(f"\n[Error] Schema provisioning failed: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()
            print("Database connection closed.")

if __name__ == "__main__":
    init_db()
