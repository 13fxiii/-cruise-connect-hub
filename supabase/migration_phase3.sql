-- ═══════════════════════════════════════════════════════════════
-- CRUISE & CONNECT HUB — PHASE 3 SUPABASE MIGRATION
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard
-- ═══════════════════════════════════════════════════════════════

-- ── ENUMS ──────────────────────────────────────────────────────

CREATE TYPE space_status AS ENUM ('scheduled', 'live', 'ended');
CREATE TYPE game_type AS ENUM ('trivia', 'truth_dare', 'poll', 'ludo', 'tournament');
CREATE TYPE game_status AS ENUM ('upcoming', 'active', 'ended');
CREATE TYPE track_status AS ENUM ('pending', 'approved', 'rejected', 'live');
CREATE TYPE job_type AS ENUM ('Full-time', 'Part-time', 'Freelance', 'Contract', 'Internship');
CREATE TYPE job_status AS ENUM ('active', 'filled', 'expired', 'draft');
CREATE TYPE transaction_type AS ENUM ('gift_sent', 'gift_received', 'tournament_win', 'referral', 'withdrawal', 'deposit', 'ad_payment', 'entry_fee', 'prize_payout', 'points_reward');
CREATE TYPE notification_type AS ENUM ('like', 'comment', 'follow', 'game_start', 'wallet_credit', 'ad_approved', 'system', 'mention', 'prize_won', 'space_live');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');

-- ── SPACES ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS spaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  status space_status DEFAULT 'scheduled',
  twitter_space_url text,
  listener_count integer DEFAULT 0,
  tags text[] DEFAULT '{}',
  genre text,
  scheduled_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "spaces_public_read" ON spaces FOR SELECT USING (true);
CREATE POLICY "spaces_insert_auth" ON spaces FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "spaces_update_host" ON spaces FOR UPDATE USING (auth.uid() = host_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('mod', 'admin')));

-- ── GAMES ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type game_type NOT NULL,
  status game_status DEFAULT 'upcoming',
  entry_fee integer DEFAULT 0,
  prize_pool integer DEFAULT 0,
  max_players integer DEFAULT 100,
  player_count integer DEFAULT 0,
  starts_at timestamptz,
  ended_at timestamptz,
  winner_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS game_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES games(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  score integer DEFAULT 0,
  rank integer,
  paid boolean DEFAULT false,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(game_id, user_id)
);

ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "games_public_read" ON games FOR SELECT USING (true);
CREATE POLICY "game_entries_public_read" ON game_entries FOR SELECT USING (true);
CREATE POLICY "game_entries_insert_auth" ON game_entries FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ── TRACKS / MUSIC HUB ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  artist_name text NOT NULL,
  title text NOT NULL,
  genre text,
  streaming_url text,
  audiomack_url text,
  spotify_url text,
  apple_music_url text,
  cover_url text,
  duration_secs integer,
  status track_status DEFAULT 'pending',
  plays integer DEFAULT 0,
  likes integer DEFAULT 0,
  featured boolean DEFAULT false,
  submitted_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS track_likes (
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  track_id uuid REFERENCES tracks(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, track_id)
);

ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE track_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tracks_public_read" ON tracks FOR SELECT USING (status = 'live' OR status = 'approved');
CREATE POLICY "tracks_submit" ON tracks FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR artist_id IS NULL);
CREATE POLICY "track_likes_all" ON track_likes USING (true) WITH CHECK (auth.uid() = user_id);

-- ── MOVIE NIGHTS / RSVP ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS movie_nights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  movie_title text NOT NULL,
  description text,
  scheduled_at timestamptz NOT NULL,
  twitter_space_url text,
  youtube_url text,
  genre text,
  image_url text,
  rsvp_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS movie_rsvps (
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  movie_night_id uuid REFERENCES movie_nights(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, movie_night_id)
);

CREATE TABLE IF NOT EXISTS movie_votes (
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  movie_title text NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, movie_title)
);

ALTER TABLE movie_nights ENABLE ROW LEVEL SECURITY;
ALTER TABLE movie_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE movie_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "movie_nights_public" ON movie_nights FOR SELECT USING (true);
CREATE POLICY "movie_rsvps_all" ON movie_rsvps USING (true) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "movie_votes_all" ON movie_votes USING (true) WITH CHECK (auth.uid() = user_id);

-- ── JOBS ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poster_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  company text NOT NULL,
  type job_type NOT NULL DEFAULT 'Full-time',
  category text NOT NULL,
  location text NOT NULL,
  pay text,
  description text NOT NULL,
  requirements text[] DEFAULT '{}',
  contact_handle text,
  status job_status DEFAULT 'active',
  is_urgent boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  application_count integer DEFAULT 0,
  expires_at timestamptz DEFAULT (now() + interval '30 days'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  cover_note text,
  status text DEFAULT 'pending',
  applied_at timestamptz DEFAULT now(),
  UNIQUE(job_id, applicant_id)
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jobs_public_read" ON jobs FOR SELECT USING (status = 'active');
CREATE POLICY "jobs_insert_auth" ON jobs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "job_apps_user" ON job_applications USING (auth.uid() = applicant_id) WITH CHECK (auth.uid() = applicant_id);
CREATE POLICY "job_apps_poster_read" ON job_applications FOR SELECT USING (
  EXISTS (SELECT 1 FROM jobs WHERE id = job_id AND poster_id = auth.uid())
);

-- ── WALLET / TRANSACTIONS ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  balance integer DEFAULT 0,
  total_earned integer DEFAULT 0,
  total_spent integer DEFAULT 0,
  referral_code text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount integer NOT NULL,
  description text,
  reference text,
  status text DEFAULT 'completed',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wallets_owner" ON wallets USING (auth.uid() = user_id);
CREATE POLICY "transactions_owner" ON transactions USING (auth.uid() = user_id);

-- ── NOTIFICATIONS ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  is_read boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX notifications_user_unread ON notifications(user_id, is_read, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_owner" ON notifications USING (auth.uid() = user_id);
CREATE POLICY "notifications_mark_read" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- ── SHOP / ORDERS ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS shop_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  price integer NOT NULL,
  image_url text,
  sizes text[] DEFAULT '{}',
  stock integer DEFAULT 999,
  is_limited boolean DEFAULT false,
  badge text,
  seller text DEFAULT 'C&C Hub Official',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  item_id uuid REFERENCES shop_items(id) ON DELETE SET NULL,
  item_name text NOT NULL,
  size text,
  quantity integer DEFAULT 1,
  amount integer NOT NULL,
  status order_status DEFAULT 'pending',
  delivery_address text,
  contact_phone text,
  payment_reference text,
  payment_confirmed boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shop_items_public" ON shop_items FOR SELECT USING (is_active = true);
CREATE POLICY "orders_user" ON orders USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ── VENDOR LISTINGS ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vendor_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  business_name text NOT NULL,
  category text NOT NULL,
  description text,
  contact_handle text,
  contact_phone text,
  location text,
  is_verified boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vendor_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vendors_public" ON vendor_listings FOR SELECT USING (is_active = true);
CREATE POLICY "vendors_insert" ON vendor_listings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ── POLLS ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  question text NOT NULL,
  category text,
  options jsonb NOT NULL DEFAULT '[]',
  points_reward integer DEFAULT 30,
  is_hot boolean DEFAULT false,
  closes_at timestamptz,
  is_active boolean DEFAULT true,
  total_votes integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS poll_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES polls(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  option_index integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(poll_id, user_id)
);

ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "polls_public" ON polls FOR SELECT USING (true);
CREATE POLICY "polls_insert_auth" ON polls FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "poll_votes_all" ON poll_votes USING (true) WITH CHECK (auth.uid() = user_id);

-- ── LEADERBOARD ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS leaderboard_monthly (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  month text NOT NULL,
  points integer DEFAULT 0,
  wins integer DEFAULT 0,
  polls_voted integer DEFAULT 0,
  games_played integer DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month)
);

ALTER TABLE leaderboard_monthly ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leaderboard_public" ON leaderboard_monthly FOR SELECT USING (true);

-- ── TRIGGERS ───────────────────────────────────────────────────

-- Auto-create wallet on signup
CREATE OR REPLACE FUNCTION create_wallet_on_signup()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO wallets (user_id, referral_code)
  VALUES (NEW.id, 'CCH-' || UPPER(SUBSTRING(NEW.id::text, 1, 8)));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created_wallet ON profiles;
CREATE TRIGGER on_profile_created_wallet
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION create_wallet_on_signup();

-- Update updated_at automatically
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER wallets_updated_at BEFORE UPDATE ON wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── SEED SAMPLE DATA ───────────────────────────────────────────

-- Sample polls
INSERT INTO polls (question, category, options, points_reward, is_hot, closes_at) VALUES
('Who is the greatest Afrobeats artist of all time?', 'Music', '[{"text":"Fela Kuti","votes":342},{"text":"Wizkid","votes":891},{"text":"Burna Boy","votes":1203},{"text":"2Baba","votes":445}]'::jsonb, 50, true, now() + interval '2 days'),
('Best Naija jollof rice — Lagos or Abuja?', 'Food', '[{"text":"Lagos Jollof 🔥","votes":4521},{"text":"Abuja Jollof","votes":2187},{"text":"Same same","votes":891},{"text":"Both terrible","votes":234}]'::jsonb, 30, true, now() + interval '1 day'),
('Should C&C Hub add a dating feature?', 'Community', '[{"text":"YES please 😍","votes":1234},{"text":"No keep it clean","votes":567},{"text":"Maybe just friends","votes":890},{"text":"Let the community vote","votes":456}]'::jsonb, 25, false, now() + interval '5 days'),
('Naija vs Ghana — who has better music?', 'Music', '[{"text":"Nigeria ALL DAY 🇳🇬","votes":8923},{"text":"Ghana has bangers 🇬🇭","votes":3456},{"text":"Both equal","votes":2341},{"text":"East Africa rising","votes":567}]'::jsonb, 60, true, now() + interval '6 hours');

-- Sample shop items
INSERT INTO shop_items (name, category, price, sizes, is_limited, badge, seller) VALUES
('BIG CRUISE Tee — Design A (Black)', 'Tees', 12000, ARRAY['S','M','L','XL','2XL'], true, 'LIMITED', 'C&C Hub Official'),
('BIG CRUISE Tee — Design A (White)', 'Tees', 12000, ARRAY['S','M','L','XL'], true, 'LIMITED', 'C&C Hub Official'),
('C&C Hub Bus Tee — Design B (Black)', 'Tees', 11000, ARRAY['S','M','L','XL','2XL'], false, NULL, 'C&C Hub Official'),
('BIG CRUISE Hoodie', 'Hoodies', 25000, ARRAY['S','M','L','XL'], false, '🔥 Hot', 'C&C Hub Official'),
('C&C Hub Cap', 'Accessories', 8500, ARRAY['One Size'], false, NULL, 'C&C Hub Official'),
('Community Sticker Pack (5pcs)', 'Accessories', 2500, ARRAY['One Size'], false, NULL, 'C&C Hub Official');

-- Sample jobs
INSERT INTO jobs (title, company, type, category, location, pay, description, requirements, contact_handle, is_urgent) VALUES
('Social Media Manager', 'C&C Hub', 'Part-time', 'Marketing', 'Remote', '₦80,000/month', 'Manage our X, Instagram, and TikTok accounts. Create viral content.', ARRAY['2+ years social media','Strong X/Twitter knowledge','Video editing skills'], '@CCHub_', true),
('Graphic Designer (Freelance)', 'Lagos Creative Agency', 'Freelance', 'Design', 'Remote', '₦15,000–₦50,000/project', 'Looking for talented designers for brand identity and social media graphics.', ARRAY['Adobe Photoshop/Illustrator','Strong portfolio','Quick turnaround'], '@lagosbrand', false),
('React / Next.js Developer', 'Naija Startup', 'Full-time', 'Tech', 'Remote (Nigeria)', '₦200,000–₦400,000/month', 'Join our growing fintech startup as a frontend developer.', ARRAY['2+ years React/Next.js','TypeScript proficiency','Supabase or Firebase'], '@naijastartup', true),
('Music A&R Scout', 'Independent Label', 'Contract', 'Music Industry', 'Lagos / Abuja', 'Commission-based', 'Discover and pitch emerging Naija artists. Strong industry connections.', ARRAY['Music industry knowledge','Strong Naija network','Ear for talent'], '@indienaija', false);

-- Supabase Realtime setup (run in SQL editor)
-- DROP PUBLICATION IF EXISTS supabase_realtime;
-- CREATE PUBLICATION supabase_realtime FOR TABLE posts, notifications, spaces, polls, poll_votes;

SELECT 'Migration complete ✅' as status;
