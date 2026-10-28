-- ==============================================================================
-- KISAN GURU AI - BHARAT AGRICULTURE OPERATING SYSTEM (BAOS)
-- SUPABASE POSTGRESQL PRODUCTION DATABASE SCHEMA MIGRATION
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    phone VARCHAR(20) UNIQUE NOT NULL,
    hashed_password VARCHAR(128) NOT NULL,
    role VARCHAR(20) DEFAULT 'farmer' NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);

-- 3. CROPS TABLE
CREATE TABLE IF NOT EXISTS public.crops (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    variety VARCHAR(100),
    sowing_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_crops_user_id ON public.crops(user_id);

-- 4. DIAGNOSTIC REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.diagnostic_reports (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    crop_id VARCHAR(36) REFERENCES public.crops(id) ON DELETE SET NULL,
    image_url VARCHAR(512) NOT NULL,
    disease_detected VARCHAR(200) NOT NULL,
    confidence DOUBLE PRECISION NOT NULL,
    remedy VARCHAR(2000) NOT NULL,
    severity VARCHAR(50),
    affected_area DOUBLE PRECISION,
    location_latitude DOUBLE PRECISION,
    location_longitude DOUBLE PRECISION,
    is_favorite BOOLEAN DEFAULT FALSE NOT NULL,
    notes VARCHAR(1000),
    report_json VARCHAR(8000),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_diagnostic_reports_user_id ON public.diagnostic_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_reports_created_at ON public.diagnostic_reports(created_at DESC);

-- 5. RENTAL LISTINGS TABLE
CREATE TABLE IF NOT EXISTS public.rental_listings (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    owner_id VARCHAR(36) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    price_per_hour DOUBLE PRECISION NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rental_listings_owner_id ON public.rental_listings(owner_id);

-- 6. RENTAL BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.rental_bookings (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    listing_id VARCHAR(36) NOT NULL REFERENCES public.rental_listings(id) ON DELETE CASCADE,
    tenant_id VARCHAR(36) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status VARCHAR(30) DEFAULT 'created' NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    total_price DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rental_bookings_tenant_id ON public.rental_bookings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rental_bookings_listing_id ON public.rental_bookings(listing_id);

-- 7. CHAT SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(50) DEFAULT 'General' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);

-- 8. CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    session_id VARCHAR(36) NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    sender VARCHAR(10) NOT NULL,
    text VARCHAR(2000) NOT NULL,
    data_json VARCHAR(4000),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);

-- 9. RECOMMENDATION HISTORIES TABLE
CREATE TABLE IF NOT EXISTS public.recommendation_histories (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    inputs_json VARCHAR(4000) NOT NULL,
    results_json VARCHAR(4000) NOT NULL,
    is_favorite BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON public.recommendation_histories(user_id);

-- 10. WATER RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.water_records (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    crop_id VARCHAR(36) REFERENCES public.crops(id) ON DELETE SET NULL,
    water_applied_liters DOUBLE PRECISION NOT NULL,
    irrigation_method VARCHAR(50) NOT NULL,
    source VARCHAR(50) NOT NULL,
    cost DOUBLE PRECISION DEFAULT 0.0,
    duration_minutes INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_water_records_user_id ON public.water_records(user_id);

-- 11. SOIL REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.soil_reports (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    soil_type VARCHAR(50) NOT NULL,
    moisture_pct DOUBLE PRECISION NOT NULL,
    temperature_c DOUBLE PRECISION NOT NULL,
    nitrogen DOUBLE PRECISION,
    phosphorus DOUBLE PRECISION,
    potassium DOUBLE PRECISION,
    ph DOUBLE PRECISION NOT NULL,
    organic_matter_pct DOUBLE PRECISION,
    compaction_psi DOUBLE PRECISION,
    drainage_class VARCHAR(50),
    water_holding_capacity_pct DOUBLE PRECISION,
    soil_health_score DOUBLE PRECISION NOT NULL,
    soil_fertility_score DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_soil_reports_user_id ON public.soil_reports(user_id);

-- 12. SENSOR DATA TABLE
CREATE TABLE IF NOT EXISTS public.sensor_data (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    device_id VARCHAR(100) NOT NULL,
    sensor_type VARCHAR(50) NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sensor_data_device_id ON public.sensor_data(device_id);
CREATE INDEX IF NOT EXISTS idx_sensor_data_timestamp ON public.sensor_data(timestamp DESC);

-- 13. IRRIGATION HISTORIES TABLE
CREATE TABLE IF NOT EXISTS public.irrigation_histories (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    crop_id VARCHAR(36) REFERENCES public.crops(id) ON DELETE SET NULL,
    scheduled_time TIMESTAMP WITH TIME ZONE,
    actual_time TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    water_applied_liters DOUBLE PRECISION NOT NULL,
    status VARCHAR(30) DEFAULT 'completed' NOT NULL,
    notes VARCHAR(500)
);
CREATE INDEX IF NOT EXISTS idx_irrigation_histories_user_id ON public.irrigation_histories(user_id);

-- 14. WEATHER HISTORIES TABLE
CREATE TABLE IF NOT EXISTS public.weather_histories (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    location_name VARCHAR(100) NOT NULL,
    temperature_c DOUBLE PRECISION NOT NULL,
    humidity_pct DOUBLE PRECISION NOT NULL,
    wind_speed_kmh DOUBLE PRECISION NOT NULL,
    solar_radiation_wm2 DOUBLE PRECISION,
    rainfall_mm DOUBLE PRECISION DEFAULT 0.0,
    evaporation_rate_mm DOUBLE PRECISION DEFAULT 0.0,
    alert_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_weather_histories_created_at ON public.weather_histories(created_at DESC);

-- 15. IRRIGATION RECOMMENDATIONS TABLE
CREATE TABLE IF NOT EXISTS public.irrigation_recommendations (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    crop_id VARCHAR(36) REFERENCES public.crops(id) ON DELETE SET NULL,
    crop_type VARCHAR(100) NOT NULL,
    crop_stage VARCHAR(100) NOT NULL,
    soil_type VARCHAR(50) NOT NULL,
    soil_moisture_pct DOUBLE PRECISION NOT NULL,
    recommended_water_liters DOUBLE PRECISION NOT NULL,
    recommended_duration_minutes INTEGER NOT NULL,
    best_irrigation_time TIMESTAMP WITH TIME ZONE NOT NULL,
    irrigation_method VARCHAR(50) NOT NULL,
    confidence_score DOUBLE PRECISION NOT NULL,
    explanation VARCHAR(2000) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_irrigation_recommendations_user_id ON public.irrigation_recommendations(user_id);

-- 16. PEST REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.pest_reports (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    image_url VARCHAR(512) NOT NULL,
    pest_detected VARCHAR(200) NOT NULL,
    confidence DOUBLE PRECISION NOT NULL,
    severity VARCHAR(50) NOT NULL,
    damage_description VARCHAR(1000),
    spread_risk_percentage DOUBLE PRECISION NOT NULL,
    treatment_plan_json VARCHAR(4000) NOT NULL,
    crop_loss_percentage DOUBLE PRECISION NOT NULL,
    urgency_level VARCHAR(50) NOT NULL,
    location_latitude DOUBLE PRECISION,
    location_longitude DOUBLE PRECISION,
    is_favorite BOOLEAN DEFAULT FALSE NOT NULL,
    notes VARCHAR(1000),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pest_reports_user_id ON public.pest_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_pest_reports_pest_detected ON public.pest_reports(pest_detected);

-- 17. PEST LIBRARY TABLE
CREATE TABLE IF NOT EXISTS public.pest_library (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    pest_name VARCHAR(100) UNIQUE NOT NULL,
    scientific_name VARCHAR(150) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    damage_symptoms VARCHAR(1000) NOT NULL,
    organic_control VARCHAR(1000) NOT NULL,
    chemical_control VARCHAR(1000) NOT NULL,
    biological_control VARCHAR(1000) NOT NULL,
    mechanical_control VARCHAR(1000) NOT NULL,
    ipm_strategy VARCHAR(1000) NOT NULL,
    pesticide_name VARCHAR(200) NOT NULL,
    pesticide_dosage VARCHAR(200) NOT NULL,
    application_timing VARCHAR(200) NOT NULL,
    safety_precautions VARCHAR(1000) NOT NULL,
    waiting_period_days INTEGER DEFAULT 7 NOT NULL,
    crop_vulnerability VARCHAR(500) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pest_library_name ON public.pest_library(pest_name);

-- 18. Row Level Security (RLS) Configuration
-- Supabase enables RLS by default. Enable RLS and grant service/authenticated access:
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soil_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.irrigation_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.irrigation_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pest_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pest_library ENABLE ROW LEVEL SECURITY;

-- Allow read/write for service role & authenticated application client
DO $$ 
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'users', 'crops', 'diagnostic_reports', 'rental_listings', 'rental_bookings',
        'chat_sessions', 'chat_messages', 'recommendation_histories', 'water_records',
        'soil_reports', 'sensor_data', 'irrigation_histories', 'weather_histories',
        'irrigation_recommendations', 'pest_reports', 'pest_library'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        EXECUTE format('DROP POLICY IF EXISTS allow_all_app_access ON public.%I;', tbl);
        EXECUTE format('CREATE POLICY allow_all_app_access ON public.%I FOR ALL USING (true) WITH CHECK (true);', tbl);
    END LOOP;
END $$;
