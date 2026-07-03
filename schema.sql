-- Drop Old Streamlit/Prototype Tables if they exist to avoid schema conflicts
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS ticket_updates CASCADE;
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS diagnosis_cases CASCADE;
DROP TABLE IF EXISTS weather_advisories CASCADE;
DROP TABLE IF EXISTS crop_recommendations CASCADE;
DROP TABLE IF EXISTS farms CASCADE;
DROP TABLE IF EXISTS cases CASCADE;
DROP TABLE IF EXISTS weather_alerts CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Profiles Table (Farmers and Admins)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(50) UNIQUE NOT NULL,
    farmer_name VARCHAR(255) NOT NULL,
    preferred_language VARCHAR(50) DEFAULT 'hi', -- Hindi-first default
    village_name VARCHAR(255),
    district VARCHAR(255),
    state VARCHAR(255),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    role VARCHAR(50) DEFAULT 'farmer', -- 'farmer' or 'admin'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Farms Table
CREATE TABLE farms (
    id SERIAL PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    farm_name VARCHAR(255),
    total_size_acres NUMERIC,
    soil_type VARCHAR(100),
    irrigation_source VARCHAR(100),
    water_availability VARCHAR(100),
    current_crop VARCHAR(100),
    preferred_crop_category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Crop Recommendations
CREATE TABLE crop_recommendations (
    id SERIAL PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    farm_id INT REFERENCES farms(id) ON DELETE SET NULL,
    state VARCHAR(100),
    district VARCHAR(100),
    season VARCHAR(100),
    soil_type VARCHAR(100),
    farm_size NUMERIC,
    irrigation_availability VARCHAR(100),
    preferred_crop_category VARCHAR(100),
    recommendations JSONB DEFAULT '[]'::jsonb, -- Array of recommendations with score, reason, risk
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Weather Advisories
CREATE TABLE weather_advisories (
    id SERIAL PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    village_name VARCHAR(255),
    district VARCHAR(255),
    temperature NUMERIC,
    humidity NUMERIC,
    rainfall_forecast VARCHAR(100),
    dry_spell_risk VARCHAR(50), -- 'low', 'medium', 'high', 'critical'
    irrigation_guidance TEXT,
    fertilization_guidance TEXT,
    alert_severity VARCHAR(50) DEFAULT 'none',
    ai_explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Diagnosis Cases
CREATE TABLE diagnosis_cases (
    id SERIAL PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    crop_type VARCHAR(100),
    image_url TEXT,
    voice_url TEXT,
    user_notes TEXT,
    ai_disease VARCHAR(255),
    ai_remedy TEXT,
    ai_confidence NUMERIC,
    ai_severity VARCHAR(50), -- 'low', 'medium', 'high'
    action_required VARCHAR(50) DEFAULT 'resolve', -- 'escalate', 'resolve'
    status VARCHAR(50) DEFAULT 'new', -- 'new', 'under_review', 'expert_assigned', 'advice_sent', 'resolved'
    expert_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Support Tickets
CREATE TABLE support_tickets (
    id SERIAL PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    case_id INT REFERENCES diagnosis_cases(id) ON DELETE SET NULL,
    subject VARCHAR(255),
    description TEXT,
    urgency VARCHAR(50) DEFAULT 'medium',
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Ticket Updates / Chat
CREATE TABLE ticket_updates (
    id SERIAL PRIMARY KEY,
    ticket_id INT REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    sender_role VARCHAR(50), -- 'farmer', 'expert'
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Notifications
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255),
    message TEXT,
    type VARCHAR(50), -- 'weather_alert', 'diagnosis_complete', 'ticket_update'
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Activity Logs
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    action VARCHAR(255),
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone_number);
CREATE INDEX IF NOT EXISTS idx_farms_profile ON farms(profile_id);
CREATE INDEX IF NOT EXISTS idx_crop_recs_profile ON crop_recommendations(profile_id);
CREATE INDEX IF NOT EXISTS idx_weather_adv_profile ON weather_advisories(profile_id);
CREATE INDEX IF NOT EXISTS idx_diag_cases_profile ON diagnosis_cases(profile_id);
CREATE INDEX IF NOT EXISTS idx_tickets_profile ON support_tickets(profile_id);
CREATE INDEX IF NOT EXISTS idx_ticket_updates_ticket ON ticket_updates(ticket_id);
CREATE INDEX IF NOT EXISTS idx_notifications_profile ON notifications(profile_id);
