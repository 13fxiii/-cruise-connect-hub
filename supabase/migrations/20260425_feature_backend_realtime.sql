-- Cruise Connect: feature-complete backend tables + realtime support
-- Applies multi-user policies for every major feature module.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================
-- Artists / Music / Radio / Podcast
-- ================================
CREATE TABLE IF NOT EXISTS public.artistes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stage_name TEXT NOT NULL,
  genre TEXT,
  bio TEXT,
  avatar_url TEXT,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.music_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES public.artistes(id) ON DELETE CASCADE,
  uploader_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  audio_url TEXT,
  cover_url TEXT,
  duration_seconds INTEGER,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.radio_shows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  stream_url TEXT,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  is_live BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.podcast_episodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  audio_url TEXT,
  cover_url TEXT,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================
-- Movies / Games / Jobs
-- ================================
CREATE TABLE IF NOT EXISTS public.movies_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  synopsis TEXT,
  genre TEXT,
  release_year INTEGER,
  poster_url TEXT,
  trailer_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.games_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL,
  room_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'live', 'closed')),
  max_players INTEGER DEFAULT 20,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.game_room_members (
  room_id UUID NOT NULL REFERENCES public.games_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (room_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.jobs_board (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poster_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT,
  location TEXT,
  job_type TEXT,
  description TEXT,
  apply_link TEXT,
  salary_range TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================
-- Merch / Store / PR-Ads / Live Spaces
-- ================================
CREATE TABLE IF NOT EXISTS public.merch_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  price_ngn NUMERIC(12,2) NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'sold_out')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.store_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  unit_price_ngn NUMERIC(12,2) NOT NULL DEFAULT 0,
  inventory_count INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ads_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  ad_copy TEXT,
  media_url TEXT,
  budget_ngn NUMERIC(12,2) NOT NULL DEFAULT 0,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'live', 'ended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.live_spaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  topic TEXT,
  x_space_url TEXT,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================
-- Wallet + Admin
-- ================================
CREATE TABLE IF NOT EXISTS public.wallet_accounts (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance_ngn NUMERIC(12,2) NOT NULL DEFAULT 0,
  points_balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount_ngn NUMERIC(12,2) NOT NULL,
  tx_type TEXT NOT NULL CHECK (tx_type IN ('deposit', 'withdrawal', 'reward', 'purchase', 'refund')),
  reference TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Triggers for updated_at columns
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'artistes','music_tracks','radio_shows','podcast_episodes','movies_catalog',
    'games_rooms','jobs_board','merch_items','store_products','ads_campaigns',
    'live_spaces','wallet_accounts'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON public.%I;', t, t);
    EXECUTE format('CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();', t, t);
  END LOOP;
END$$;

-- RLS
ALTER TABLE public.artistes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radio_shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcast_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movies_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs_board ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merch_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Generic member policies
CREATE POLICY IF NOT EXISTS "public_read_artistes" ON public.artistes FOR SELECT USING (TRUE);
CREATE POLICY IF NOT EXISTS "owner_write_artistes" ON public.artistes FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY IF NOT EXISTS "public_read_music_tracks" ON public.music_tracks FOR SELECT USING (TRUE);
CREATE POLICY IF NOT EXISTS "uploader_write_music_tracks" ON public.music_tracks FOR ALL USING (auth.uid() = uploader_id) WITH CHECK (auth.uid() = uploader_id);

CREATE POLICY IF NOT EXISTS "public_read_radio" ON public.radio_shows FOR SELECT USING (TRUE);
CREATE POLICY IF NOT EXISTS "host_write_radio" ON public.radio_shows FOR ALL USING (auth.uid() = host_id) WITH CHECK (auth.uid() = host_id);

CREATE POLICY IF NOT EXISTS "public_read_podcast" ON public.podcast_episodes FOR SELECT USING (TRUE);
CREATE POLICY IF NOT EXISTS "creator_write_podcast" ON public.podcast_episodes FOR ALL USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);

CREATE POLICY IF NOT EXISTS "public_read_movies_catalog" ON public.movies_catalog FOR SELECT USING (TRUE);
CREATE POLICY IF NOT EXISTS "owner_write_movies_catalog" ON public.movies_catalog FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY IF NOT EXISTS "public_read_game_rooms" ON public.games_rooms FOR SELECT USING (TRUE);
CREATE POLICY IF NOT EXISTS "host_write_game_rooms" ON public.games_rooms FOR ALL USING (auth.uid() = host_id) WITH CHECK (auth.uid() = host_id);
CREATE POLICY IF NOT EXISTS "member_read_game_room_members" ON public.game_room_members FOR SELECT USING (TRUE);
CREATE POLICY IF NOT EXISTS "member_join_game_room_members" ON public.game_room_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "member_leave_game_room_members" ON public.game_room_members FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "public_read_jobs_board" ON public.jobs_board FOR SELECT USING (TRUE);
CREATE POLICY IF NOT EXISTS "poster_write_jobs_board" ON public.jobs_board FOR ALL USING (auth.uid() = poster_id) WITH CHECK (auth.uid() = poster_id);

CREATE POLICY IF NOT EXISTS "public_read_merch_items" ON public.merch_items FOR SELECT USING (TRUE);
CREATE POLICY IF NOT EXISTS "seller_write_merch_items" ON public.merch_items FOR ALL USING (auth.uid() = seller_id) WITH CHECK (auth.uid() = seller_id);

CREATE POLICY IF NOT EXISTS "public_read_store_products" ON public.store_products FOR SELECT USING (TRUE);
CREATE POLICY IF NOT EXISTS "vendor_write_store_products" ON public.store_products FOR ALL USING (auth.uid() = vendor_id) WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY IF NOT EXISTS "public_read_ads_campaigns" ON public.ads_campaigns FOR SELECT USING (TRUE);
CREATE POLICY IF NOT EXISTS "owner_write_ads_campaigns" ON public.ads_campaigns FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY IF NOT EXISTS "public_read_live_spaces" ON public.live_spaces FOR SELECT USING (TRUE);
CREATE POLICY IF NOT EXISTS "host_write_live_spaces" ON public.live_spaces FOR ALL USING (auth.uid() = host_id) WITH CHECK (auth.uid() = host_id);

CREATE POLICY IF NOT EXISTS "own_wallet_account" ON public.wallet_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "own_wallet_account_update" ON public.wallet_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "own_wallet_transactions" ON public.wallet_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "own_wallet_transactions_insert" ON public.wallet_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "admin_read_logs" ON public.admin_audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);
CREATE POLICY IF NOT EXISTS "admin_insert_logs" ON public.admin_audit_logs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','moderator'))
);

-- Realtime: allow UPDATE/DELETE old row payloads
ALTER TABLE public.artistes REPLICA IDENTITY FULL;
ALTER TABLE public.music_tracks REPLICA IDENTITY FULL;
ALTER TABLE public.radio_shows REPLICA IDENTITY FULL;
ALTER TABLE public.podcast_episodes REPLICA IDENTITY FULL;
ALTER TABLE public.movies_catalog REPLICA IDENTITY FULL;
ALTER TABLE public.games_rooms REPLICA IDENTITY FULL;
ALTER TABLE public.game_room_members REPLICA IDENTITY FULL;
ALTER TABLE public.jobs_board REPLICA IDENTITY FULL;
ALTER TABLE public.merch_items REPLICA IDENTITY FULL;
ALTER TABLE public.store_products REPLICA IDENTITY FULL;
ALTER TABLE public.ads_campaigns REPLICA IDENTITY FULL;
ALTER TABLE public.live_spaces REPLICA IDENTITY FULL;
ALTER TABLE public.wallet_accounts REPLICA IDENTITY FULL;
ALTER TABLE public.wallet_transactions REPLICA IDENTITY FULL;
ALTER TABLE public.admin_audit_logs REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.artistes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.music_tracks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.radio_shows;
ALTER PUBLICATION supabase_realtime ADD TABLE public.podcast_episodes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.movies_catalog;
ALTER PUBLICATION supabase_realtime ADD TABLE public.games_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_room_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs_board;
ALTER PUBLICATION supabase_realtime ADD TABLE public.merch_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.store_products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ads_campaigns;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_spaces;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wallet_accounts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wallet_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_audit_logs;
