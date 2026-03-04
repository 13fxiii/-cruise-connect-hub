-- ============================================================
-- CRUISE CONNECT HUB — FULL SUPABASE SCHEMA
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT UNIQUE NOT NULL,
  display_name  TEXT NOT NULL DEFAULT '',
  bio           TEXT DEFAULT '',
  avatar_url    TEXT DEFAULT '',
  twitter_handle TEXT DEFAULT '',
  wallet_balance BIGINT NOT NULL DEFAULT 0,        -- in kobo (₦1 = 100 kobo)
  total_earned   BIGINT NOT NULL DEFAULT 0,
  total_spent    BIGINT NOT NULL DEFAULT 0,
  points         INT NOT NULL DEFAULT 0,
  level          TEXT NOT NULL DEFAULT 'newcomer', -- newcomer, cruiser, connector, hub_star, legend
  referral_code  TEXT UNIQUE,
  referred_by    UUID REFERENCES profiles(id),
  interests      TEXT[] DEFAULT '{}',
  is_verified    BOOLEAN DEFAULT FALSE,
  is_admin       BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_points ON profiles(points DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 2. POSTS / FEED
-- ============================================================
CREATE TABLE IF NOT EXISTS posts (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content        TEXT NOT NULL,
  media_urls     TEXT[] DEFAULT '{}',
  likes_count    INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  is_pinned      BOOLEAN DEFAULT FALSE,
  status         TEXT DEFAULT 'published', -- published, hidden, deleted
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);

CREATE TABLE IF NOT EXISTS post_likes (
  post_id    UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS post_comments (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. SPACES
-- ============================================================
CREATE TABLE IF NOT EXISTS spaces (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT DEFAULT '',
  x_space_url  TEXT DEFAULT '',  -- actual X Space link
  status       TEXT DEFAULT 'scheduled', -- scheduled, live, ended
  category     TEXT DEFAULT 'general',
  listener_count INT DEFAULT 0,
  scheduled_at TIMESTAMPTZ,
  started_at   TIMESTAMPTZ,
  ended_at     TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_spaces_status ON spaces(status);

-- ============================================================
-- 4. WALLET TRANSACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type         TEXT NOT NULL,   -- deposit, withdrawal, gift_sent, gift_received, tournament_win, referral, ad_payment
  amount       BIGINT NOT NULL, -- in kobo, positive = credit, negative = debit
  description  TEXT DEFAULT '',
  reference    TEXT UNIQUE,     -- Paystack reference or internal ref
  status       TEXT DEFAULT 'pending', -- pending, completed, failed
  metadata     JSONB DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_user ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_created ON wallet_transactions(created_at DESC);

-- ============================================================
-- 5. BANK ACCOUNTS (for withdrawals)
-- ============================================================
CREATE TABLE IF NOT EXISTS bank_accounts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  bank_name    TEXT NOT NULL,
  bank_code    TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  is_default   BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. GAMES
-- ============================================================
CREATE TABLE IF NOT EXISTS game_sessions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_type    TEXT NOT NULL,  -- trivia, ludo, word_guess, tournament
  host_id      UUID REFERENCES profiles(id),
  status       TEXT DEFAULT 'waiting', -- waiting, active, completed
  entry_fee    BIGINT DEFAULT 0,       -- kobo
  prize_pool   BIGINT DEFAULT 0,       -- kobo
  max_players  INT DEFAULT 4,
  winner_id    UUID REFERENCES profiles(id),
  metadata     JSONB DEFAULT '{}',
  started_at   TIMESTAMPTZ,
  ended_at     TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS game_participants (
  session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  score      INT DEFAULT 0,
  rank       INT,
  joined_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (session_id, user_id)
);

-- ============================================================
-- 7. TOURNAMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS tournaments (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title          TEXT NOT NULL,
  game_type      TEXT NOT NULL,
  prize_pool     BIGINT NOT NULL DEFAULT 0,
  entry_fee      BIGINT DEFAULT 0,
  max_players    INT DEFAULT 16,
  current_players INT DEFAULT 0,
  status         TEXT DEFAULT 'upcoming', -- upcoming, active, completed, cancelled
  current_round  INT DEFAULT 0,
  starts_at      TIMESTAMPTZ,
  rules          TEXT DEFAULT '',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tournament_entries (
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE,
  paid          BOOLEAN DEFAULT FALSE,
  eliminated_at TIMESTAMPTZ,
  final_rank    INT,
  joined_at     TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (tournament_id, user_id)
);

-- ============================================================
-- 8. NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,    -- like, comment, game_start, wallet_credit, space_live, prize_won, system
  title      TEXT NOT NULL,
  body       TEXT DEFAULT '',
  link       TEXT DEFAULT '',
  is_read    BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_unread ON notifications(user_id, is_read);

-- ============================================================
-- 9. SHOP / MARKETPLACE
-- ============================================================
CREATE TABLE IF NOT EXISTS shop_products (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id    UUID REFERENCES profiles(id),
  name         TEXT NOT NULL,
  description  TEXT DEFAULT '',
  price        BIGINT NOT NULL, -- kobo
  category     TEXT DEFAULT 'merch',
  images       TEXT[] DEFAULT '{}',
  stock        INT DEFAULT -1,   -- -1 = unlimited
  is_active    BOOLEAN DEFAULT TRUE,
  is_featured  BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id     UUID NOT NULL REFERENCES profiles(id),
  product_id   UUID NOT NULL REFERENCES shop_products(id),
  quantity     INT DEFAULT 1,
  total_amount BIGINT NOT NULL, -- kobo
  status       TEXT DEFAULT 'pending', -- pending, paid, shipped, delivered, cancelled
  payment_ref  TEXT,
  address      JSONB DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 10. JOBS BOARD
-- ============================================================
CREATE TABLE IF NOT EXISTS job_listings (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poster_id    UUID REFERENCES profiles(id),
  title        TEXT NOT NULL,
  company      TEXT NOT NULL,
  description  TEXT NOT NULL,
  requirements TEXT DEFAULT '',
  type         TEXT DEFAULT 'full_time', -- full_time, part_time, contract, internship, gig
  category     TEXT DEFAULT 'tech',
  location     TEXT DEFAULT 'Remote',
  salary_min   BIGINT DEFAULT 0,
  salary_max   BIGINT DEFAULT 0,
  is_active    BOOLEAN DEFAULT TRUE,
  is_featured  BOOLEAN DEFAULT FALSE,
  apply_url    TEXT DEFAULT '',
  apply_email  TEXT DEFAULT '',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_applications (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id       UUID NOT NULL REFERENCES job_listings(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cover_letter TEXT DEFAULT '',
  status       TEXT DEFAULT 'submitted',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (job_id, applicant_id)
);

-- ============================================================
-- 11. MUSIC / TRACKS
-- ============================================================
CREATE TABLE IF NOT EXISTS tracks (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submitter_id  UUID REFERENCES profiles(id),
  artist        TEXT NOT NULL,
  title         TEXT NOT NULL,
  twitter_handle TEXT DEFAULT '',
  genre         TEXT DEFAULT 'afrobeats',
  spotify_url   TEXT DEFAULT '',
  apple_url     TEXT DEFAULT '',
  youtube_url   TEXT DEFAULT '',
  audiomack_url TEXT DEFAULT '',
  linktree_url  TEXT DEFAULT '',
  plays         INT DEFAULT 0,
  likes         INT DEFAULT 0,
  is_featured   BOOLEAN DEFAULT FALSE,
  status        TEXT DEFAULT 'pending', -- pending, approved, rejected
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 12. POLLS
-- ============================================================
CREATE TABLE IF NOT EXISTS polls (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id  UUID REFERENCES profiles(id),
  question    TEXT NOT NULL,
  category    TEXT DEFAULT 'general',
  options     JSONB NOT NULL DEFAULT '[]', -- [{id, text, votes}]
  total_votes INT DEFAULT 0,
  ends_at     TIMESTAMPTZ,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS poll_votes (
  poll_id    UUID REFERENCES polls(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  option_id  TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (poll_id, user_id)
);

-- ============================================================
-- 13. AD SUBMISSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS ad_submissions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_name     TEXT NOT NULL,
  contact_name   TEXT NOT NULL,
  contact_email  TEXT NOT NULL,
  contact_phone  TEXT DEFAULT '',
  package        TEXT NOT NULL,
  price          BIGINT NOT NULL,
  description    TEXT DEFAULT '',
  link_url       TEXT DEFAULT '',
  status         TEXT DEFAULT 'pending', -- pending, approved, live, completed, rejected
  payment_ref    TEXT,
  starts_at      TIMESTAMPTZ,
  ends_at        TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 14. LEADERBOARD VIEW
-- ============================================================
CREATE OR REPLACE VIEW leaderboard AS
  SELECT
    p.id,
    p.username,
    p.display_name,
    p.avatar_url,
    p.points,
    p.level,
    RANK() OVER (ORDER BY p.points DESC) as rank,
    COUNT(wt.id) FILTER (WHERE wt.type = 'tournament_win') as wins
  FROM profiles p
  LEFT JOIN wallet_transactions wt ON wt.user_id = p.id
  WHERE p.is_admin = FALSE
  GROUP BY p.id
  ORDER BY p.points DESC
  LIMIT 100;

-- ============================================================
-- 15. ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

-- Profiles: anyone can read, only owner can update
CREATE POLICY "profiles_read" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Posts: anyone reads published, owner manages own
CREATE POLICY "posts_read" ON posts FOR SELECT USING (status = 'published');
CREATE POLICY "posts_insert" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_update" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "posts_delete" ON posts FOR DELETE USING (auth.uid() = user_id);

-- Wallet: only owner sees own transactions
CREATE POLICY "wallet_own" ON wallet_transactions FOR ALL USING (auth.uid() = user_id);

-- Notifications: only owner sees own
CREATE POLICY "notif_own" ON notifications FOR ALL USING (auth.uid() = user_id);

-- Bank accounts: only owner
CREATE POLICY "bank_own" ON bank_accounts FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- 16. AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  ref_code TEXT;
BEGIN
  ref_code := 'CCH-' || UPPER(SUBSTRING(MD5(NEW.id::TEXT), 1, 6));
  INSERT INTO profiles (id, username, display_name, referral_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || SUBSTRING(NEW.id::TEXT, 1, 6)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'New Member'),
    ref_code
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 17. SAMPLE DATA (for development/testing)
-- ============================================================
-- NOTE: Only run in dev. Comment out before production deploy.

-- Sample tournaments
INSERT INTO tournaments (title, game_type, prize_pool, entry_fee, max_players, current_players, status, starts_at) VALUES
  ('Ludo Championship 🎲', 'ludo', 5000000, 100000, 16, 16, 'active', NOW() - INTERVAL '1 hour'),
  ('Trivia Showdown ⚡', 'trivia', 2500000, 50000, 32, 21, 'upcoming', NOW() + INTERVAL '2 days'),
  ('Word Master Challenge 📝', 'word_guess', 1000000, 25000, 16, 8, 'upcoming', NOW() + INTERVAL '5 days')
ON CONFLICT DO NOTHING;

SELECT 'Schema created successfully! 🚀' as status;
