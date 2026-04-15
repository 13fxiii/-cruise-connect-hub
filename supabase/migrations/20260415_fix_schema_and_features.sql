-- CRUISE CONNECT HUB — Schema Fix & Features Migration 2026-04-15
-- Run this to set up all required tables, columns and policies

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_done BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS x_username TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS x_display_name TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS x_avatar_url TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cover_url TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS followers_count INT DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS following_count INT DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_streak INT DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS longest_streak INT DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_checkin DATE;
ALTER TABLE public.profiles ALTER COLUMN username DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN display_name SET DEFAULT '';
ALTER TABLE public.profiles ALTER COLUMN bio SET DEFAULT '';
ALTER TABLE public.profiles ALTER COLUMN avatar_url SET DEFAULT '';

DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='dm_conversations') THEN
    ALTER TABLE public.dm_conversations ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "dm_own_read" ON public.dm_conversations;
    DROP POLICY IF EXISTS "dm_own_insert" ON public.dm_conversations;
    DROP POLICY IF EXISTS "dm_own_update" ON public.dm_conversations;
    CREATE POLICY "dm_own_read" ON public.dm_conversations FOR SELECT USING (auth.uid() = participant1 OR auth.uid() = participant2);
    CREATE POLICY "dm_own_insert" ON public.dm_conversations FOR INSERT WITH CHECK (auth.uid() = participant1 OR auth.uid() = participant2);
    CREATE POLICY "dm_own_update" ON public.dm_conversations FOR UPDATE USING (auth.uid() = participant1 OR auth.uid() = participant2);
  END IF;
END $$;

DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_own_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_own_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles;
DROP POLICY IF EXISTS "profiles_read" ON public.profiles;
DROP POLICY IF EXISTS "profiles_service_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_service_all" ON public.profiles;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_public_read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_own_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_own_update" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_service_all" ON public.profiles FOR ALL USING (auth.role() = 'service_role');

UPDATE public.profiles SET is_admin = TRUE
WHERE x_username IN ('13fxiii_', 'TheCruiseCH', '13fxiii', 'thecruisech')
   OR username IN ('13fxiii_', 'thecruisech', '13fxiii');
