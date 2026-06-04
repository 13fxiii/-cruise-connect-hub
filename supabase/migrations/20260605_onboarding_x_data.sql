-- Create x_oauth_tokens table
CREATE TABLE IF NOT EXISTS public.x_oauth_tokens (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_type TEXT,
    scope TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create community_id_cards table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.community_id_cards (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    card_number TEXT UNIQUE,
    qr_data TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_done BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS x_username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS x_display_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS x_avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code TEXT;

-- Enable RLS
ALTER TABLE public.x_oauth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_id_cards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for x_oauth_tokens
CREATE POLICY "Users can view their own tokens" ON public.x_oauth_tokens FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can do everything on tokens" ON public.x_oauth_tokens FOR ALL USING (true);

-- RLS Policies for community_id_cards
CREATE POLICY "Users can view their own cards" ON public.community_id_cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own cards" ON public.community_id_cards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own cards" ON public.community_id_cards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role can do everything on cards" ON public.community_id_cards FOR ALL USING (true);

-- Fix handle_new_user trigger to be conflict-safe
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url, onboarding_done)
  VALUES (
    new.id,
    LOWER(REPLACE(new.raw_user_meta_data->>'username', ' ', '_')),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    FALSE
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
