-- ============================================================
-- CRUISE & CONNECT HUB — Database Stabilization & Feature Update
-- Author: MANUS for FX〽️
-- Date: 2026-04-15
-- ============================================================

-- 1. STABILIZE PROFILES TABLE
-- Ensure all columns expected by the app exist in the profiles table.
DO $$ 
BEGIN
    -- Core Profile Fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'display_name') THEN
        ALTER TABLE profiles ADD COLUMN display_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bio') THEN
        ALTER TABLE profiles ADD COLUMN bio TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'twitter_handle') THEN
        ALTER TABLE profiles ADD COLUMN twitter_handle TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'onboarding_done') THEN
        ALTER TABLE profiles ADD COLUMN onboarding_done BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'interests') THEN
        ALTER TABLE profiles ADD COLUMN interests TEXT[] DEFAULT '{}';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_admin') THEN
        ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'member';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'points') THEN
        ALTER TABLE profiles ADD COLUMN points INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'wallet_balance') THEN
        ALTER TABLE profiles ADD COLUMN wallet_balance BIGINT DEFAULT 0;
    END IF;

    -- X/Twitter Sync Specific Fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'x_username') THEN
        ALTER TABLE profiles ADD COLUMN x_username TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'x_display_name') THEN
        ALTER TABLE profiles ADD COLUMN x_display_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'x_avatar_url') THEN
        ALTER TABLE profiles ADD COLUMN x_avatar_url TEXT;
    END IF;

    -- Community ID Specific Fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'member_number') THEN
        ALTER TABLE profiles ADD COLUMN member_number SERIAL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'id_card_code') THEN
        ALTER TABLE profiles ADD COLUMN id_card_code TEXT UNIQUE;
    END IF;
END $$;

-- 2. DAILY THEME & AWARDS TABLES
CREATE TABLE IF NOT EXISTS daily_theme_pool (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    theme TEXT NOT NULL,
    emoji TEXT,
    day_hint INTEGER, -- 0=Sunday, 1=Monday...
    weight INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_theme_log (
    used_date DATE PRIMARY KEY,
    theme_id UUID REFERENCES daily_theme_pool(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS award_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS award_nominees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES award_categories(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    reason TEXT,
    vote_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(category_id, user_id, year)
);

-- 3. X OAUTH TOKENS STORAGE
CREATE TABLE IF NOT EXISTS x_oauth_tokens (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMPTZ,
    scope TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RLS POLICIES
ALTER TABLE daily_theme_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_theme_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE award_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE award_nominees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view themes" ON daily_theme_pool FOR SELECT USING (TRUE);
CREATE POLICY "Public can view theme logs" ON daily_theme_log FOR SELECT USING (TRUE);
CREATE POLICY "Public can view award categories" ON award_categories FOR SELECT USING (TRUE);
CREATE POLICY "Public can view nominees" ON award_nominees FOR SELECT USING (TRUE);

-- 5. ADMIN PERMISSIONS
-- Set FX〽️ and Community account as admins
UPDATE profiles 
SET role = 'admin', is_admin = TRUE 
WHERE x_username IN ('13fxiii_', '13fxiii', 'thecruisech', 'TheCruiseCH');

-- 6. UNIQUE ID CARD CODE GENERATOR
CREATE OR REPLACE FUNCTION generate_unique_id_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.id_card_code IS NULL THEN
        NEW.id_card_code := 'CCH-' || UPPER(SUBSTR(REPLACE(NEW.id::TEXT, '-', ''), 1, 10));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_generate_id_code ON profiles;
CREATE TRIGGER tr_generate_id_code
    BEFORE INSERT OR UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION generate_unique_id_code();

-- 7. INITIAL THEME POOL DATA
INSERT INTO daily_theme_pool (theme, emoji, day_hint) VALUES
('Motivation Monday', '🚀', 1),
('Travel Tuesday', '✈️', 2),
('Woman Crush Wednesday', '👑', 3),
('Throwback Thursday', '🔙', 4),
('Friday Cruise', '🎉', 5),
('Sports Saturday', '⚽', 6),
('Sunday Service', '🙏', 0)
ON CONFLICT DO NOTHING;
