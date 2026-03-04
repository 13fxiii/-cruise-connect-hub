-- ============================================================
-- CRUISE & CONNECT HUB — Full Schema Migration
-- Run in Supabase SQL Editor
-- ============================================================

-- EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ──────────────────────────────────────────────────────────
-- PROFILES
-- ──────────────────────────────────────────────────────────
create type user_role as enum ('member','mod','admin');

create table if not exists profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  username       text unique not null,
  display_name   text,
  avatar_url     text,
  bio            text,
  twitter_handle text,
  role           user_role default 'member',
  points         integer default 0,
  wallet_balance bigint default 0,      -- in kobo (×100)
  total_earned   bigint default 0,
  total_spent    bigint default 0,
  referral_code  text unique,
  referred_by    uuid references profiles(id),
  onboarding_done boolean default false,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);
alter table profiles enable row level security;
create policy "profiles_select" on profiles for select using (true);
create policy "profiles_insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on profiles for update using (auth.uid() = id);

-- auto create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles(id, username, display_name, avatar_url, referral_code)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)),
    new.raw_user_meta_data->>'avatar_url',
    upper('CCH-' || substr(replace(new.id::text,'-',''),1,8))
  );
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ──────────────────────────────────────────────────────────
-- POSTS
-- ──────────────────────────────────────────────────────────
create type post_status as enum ('published','draft','flagged','deleted');

create table if not exists posts (
  id             uuid primary key default uuid_generate_v4(),
  author_id      uuid references profiles(id) on delete cascade,
  content        text not null,
  media_urls     text[] default '{}',
  tags           text[] default '{}',
  status         post_status default 'published',
  likes_count    integer default 0,
  comments_count integer default 0,
  is_pinned      boolean default false,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);
alter table posts enable row level security;
create policy "posts_select" on posts for select using (status = 'published');
create policy "posts_insert" on posts for insert with check (auth.uid() = author_id);
create policy "posts_update" on posts for update using (auth.uid() = author_id);

create table if not exists post_likes (
  post_id    uuid references posts(id) on delete cascade,
  user_id    uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (post_id, user_id)
);
alter table post_likes enable row level security;
create policy "likes_all" on post_likes for all using (true);

-- ──────────────────────────────────────────────────────────
-- SPACES
-- ──────────────────────────────────────────────────────────
create type space_status as enum ('scheduled','live','ended','cancelled');

create table if not exists spaces (
  id               uuid primary key default uuid_generate_v4(),
  host_id          uuid references profiles(id) on delete set null,
  title            text not null,
  description      text,
  status           space_status default 'scheduled',
  listener_count   integer default 0,
  twitter_space_url text,
  tags             text[] default '{}',
  scheduled_at     timestamptz,
  ended_at         timestamptz,
  created_at       timestamptz default now()
);
alter table spaces enable row level security;
create policy "spaces_select" on spaces for select using (true);
create policy "spaces_insert" on spaces for insert with check (auth.uid() = host_id);
create policy "spaces_update" on spaces for update using (auth.uid() = host_id);

-- ──────────────────────────────────────────────────────────
-- GAMES
-- ──────────────────────────────────────────────────────────
create type game_type as enum ('trivia','truth_dare','poll','ludo','tournament');
create type game_status as enum ('upcoming','active','ended','cancelled');

create table if not exists games (
  id           uuid primary key default uuid_generate_v4(),
  title        text not null,
  type         game_type not null,
  status       game_status default 'upcoming',
  entry_fee    integer default 0,  -- naira
  prize_pool   integer default 0,
  max_players  integer default 50,
  player_count integer default 0,
  starts_at    timestamptz,
  ended_at     timestamptz,
  winner_id    uuid references profiles(id),
  created_at   timestamptz default now()
);
alter table games enable row level security;
create policy "games_select" on games for select using (true);

create table if not exists game_entries (
  id         uuid primary key default uuid_generate_v4(),
  game_id    uuid references games(id) on delete cascade,
  user_id    uuid references profiles(id) on delete cascade,
  score      integer default 0,
  rank       integer,
  paid       boolean default false,
  paid_at    timestamptz,
  created_at timestamptz default now(),
  unique(game_id, user_id)
);
alter table game_entries enable row level security;
create policy "entries_select" on game_entries for select using (true);
create policy "entries_insert" on game_entries for insert with check (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────
-- TOURNAMENTS
-- ──────────────────────────────────────────────────────────
create table if not exists tournaments (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  game_type     game_type not null,
  status        game_status default 'upcoming',
  entry_fee     integer default 1000,
  prize_pool    integer default 0,
  max_players   integer default 32,
  current_round integer default 1,
  starts_at     timestamptz,
  created_at    timestamptz default now()
);

create table if not exists tournament_matches (
  id            uuid primary key default uuid_generate_v4(),
  tournament_id uuid references tournaments(id) on delete cascade,
  round         integer not null,
  match_number  integer not null,
  player1_id    uuid references profiles(id),
  player2_id    uuid references profiles(id),
  winner_id     uuid references profiles(id),
  player1_score integer default 0,
  player2_score integer default 0,
  status        text default 'pending', -- pending|active|completed|bye
  played_at     timestamptz,
  created_at    timestamptz default now()
);
alter table tournaments enable row level security;
alter table tournament_matches enable row level security;
create policy "tournaments_select" on tournaments for select using (true);
create policy "matches_select" on tournament_matches for select using (true);

-- ──────────────────────────────────────────────────────────
-- WALLET & TRANSACTIONS
-- ──────────────────────────────────────────────────────────
create type tx_type as enum (
  'deposit','withdrawal','gift_sent','gift_received',
  'tournament_win','tournament_entry','referral',
  'ad_payment','shop_purchase','prize','refund'
);
create type tx_status as enum ('pending','completed','failed','reversed');

create table if not exists transactions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references profiles(id) on delete cascade,
  type        tx_type not null,
  amount      bigint not null,  -- positive = credit, negative = debit (kobo)
  description text,
  reference   text unique,
  status      tx_status default 'pending',
  metadata    jsonb default '{}',
  created_at  timestamptz default now()
);
alter table transactions enable row level security;
create policy "tx_select" on transactions for select using (auth.uid() = user_id);
create policy "tx_insert" on transactions for insert with check (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────
-- TRACKS (MUSIC HUB)
-- ──────────────────────────────────────────────────────────
create type track_status as enum ('pending','approved','live','rejected');

create table if not exists tracks (
  id              uuid primary key default uuid_generate_v4(),
  artist_id       uuid references profiles(id) on delete set null,
  artist_name     text not null,
  twitter_handle  text,
  title           text not null,
  genre           text,
  streaming_url   text,
  audiomack_url   text,
  spotify_url     text,
  apple_url       text,
  cover_url       text,
  duration_secs   integer,
  plays           integer default 0,
  likes           integer default 0,
  status          track_status default 'pending',
  featured        boolean default false,
  description     text,
  submitted_at    timestamptz default now(),
  approved_at     timestamptz
);
alter table tracks enable row level security;
create policy "tracks_select" on tracks for select using (status in ('live','approved'));
create policy "tracks_insert" on tracks for insert with check (true);

-- ──────────────────────────────────────────────────────────
-- MOVIE NIGHTS / WATCH PARTIES
-- ──────────────────────────────────────────────────────────
create table if not exists movie_nights (
  id               uuid primary key default uuid_generate_v4(),
  host_id          uuid references profiles(id) on delete set null,
  title            text not null,
  movie_title      text not null,
  youtube_url      text,
  twitter_space_url text,
  status           text default 'scheduled', -- scheduled|live|ended
  scheduled_at     timestamptz,
  attendee_count   integer default 0,
  chat_enabled     boolean default true,
  created_at       timestamptz default now()
);
alter table movie_nights enable row level security;
create policy "movie_nights_select" on movie_nights for select using (true);

create table if not exists movie_night_rsvps (
  movie_night_id uuid references movie_nights(id) on delete cascade,
  user_id        uuid references profiles(id) on delete cascade,
  created_at     timestamptz default now(),
  primary key (movie_night_id, user_id)
);
alter table movie_night_rsvps enable row level security;
create policy "rsvps_all" on movie_night_rsvps for all using (true);

create table if not exists watch_party_chat (
  id             uuid primary key default uuid_generate_v4(),
  movie_night_id uuid references movie_nights(id) on delete cascade,
  user_id        uuid references profiles(id) on delete cascade,
  message        text not null,
  created_at     timestamptz default now()
);
alter table watch_party_chat enable row level security;
create policy "chat_select" on watch_party_chat for select using (true);
create policy "chat_insert" on watch_party_chat for insert with check (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────
-- SHOP — ITEMS, ORDERS, VENDORS
-- ──────────────────────────────────────────────────────────
create table if not exists shop_items (
  id          uuid primary key default uuid_generate_v4(),
  seller_id   uuid references profiles(id) on delete set null,
  name        text not null,
  description text,
  category    text not null,
  price       integer not null, -- naira
  image_url   text,
  sizes       text[] default '{}',
  stock       integer default 0,
  is_official boolean default false,
  is_featured boolean default false,
  active      boolean default true,
  created_at  timestamptz default now()
);
alter table shop_items enable row level security;
create policy "shop_items_select" on shop_items for select using (active = true);

create type order_status as enum ('pending_payment','paid','processing','shipped','delivered','cancelled','refunded');

create table if not exists orders (
  id              uuid primary key default uuid_generate_v4(),
  buyer_id        uuid references profiles(id) on delete set null,
  item_id         uuid references shop_items(id),
  item_name       text not null,
  item_price      integer not null,
  size            text,
  quantity        integer default 1,
  total_naira     integer not null,
  status          order_status default 'pending_payment',
  payment_ref     text unique,
  delivery_name   text,
  delivery_phone  text,
  delivery_address text,
  delivery_city   text,
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
alter table orders enable row level security;
create policy "orders_select" on orders for select using (auth.uid() = buyer_id);
create policy "orders_insert" on orders for insert with check (auth.uid() = buyer_id);

create table if not exists vendor_applications (
  id             uuid primary key default uuid_generate_v4(),
  applicant_id   uuid references profiles(id) on delete cascade,
  business_name  text not null,
  category       text not null,
  description    text not null,
  twitter_handle text,
  instagram      text,
  phone          text,
  website        text,
  status         text default 'pending', -- pending|approved|rejected
  created_at     timestamptz default now()
);
alter table vendor_applications enable row level security;
create policy "vendor_apps_insert" on vendor_applications for insert with check (auth.uid() = applicant_id);
create policy "vendor_apps_select" on vendor_applications for select using (auth.uid() = applicant_id);

-- ──────────────────────────────────────────────────────────
-- JOBS
-- ──────────────────────────────────────────────────────────
create table if not exists jobs (
  id              uuid primary key default uuid_generate_v4(),
  poster_id       uuid references profiles(id) on delete set null,
  title           text not null,
  company         text not null,
  type            text not null, -- Full-time|Part-time|Freelance|Contract
  category        text not null,
  location        text not null,
  pay             text,
  description     text not null,
  requirements    text[] default '{}',
  contact_handle  text,
  status          text default 'active', -- active|filled|expired|paused
  is_urgent       boolean default false,
  is_featured     boolean default false,
  application_count integer default 0,
  expires_at      timestamptz default (now() + interval '30 days'),
  created_at      timestamptz default now()
);
alter table jobs enable row level security;
create policy "jobs_select" on jobs for select using (status = 'active');
create policy "jobs_insert" on jobs for insert with check (true);

create table if not exists job_applications (
  id           uuid primary key default uuid_generate_v4(),
  job_id       uuid references jobs(id) on delete cascade,
  applicant_id uuid references profiles(id) on delete cascade,
  cover_note   text,
  status       text default 'pending', -- pending|reviewed|shortlisted|hired|rejected
  created_at   timestamptz default now(),
  unique(job_id, applicant_id)
);
alter table job_applications enable row level security;
create policy "applications_insert" on job_applications for insert with check (auth.uid() = applicant_id);
create policy "applications_select" on job_applications for select using (auth.uid() = applicant_id);

-- auto-increment application_count
create or replace function increment_application_count()
returns trigger language plpgsql as $$
begin
  update jobs set application_count = application_count + 1 where id = new.job_id;
  return new;
end;
$$;
create trigger on_application_insert
  after insert on job_applications
  for each row execute procedure increment_application_count();

-- ──────────────────────────────────────────────────────────
-- ADS SUBMISSIONS
-- ──────────────────────────────────────────────────────────
create type ad_package as enum ('day','day_dual','weekly','monthly','ambassador_3m','ambassador_6m');
create type ad_status as enum ('pending','approved','rejected','live','expired');

create table if not exists ads_submissions (
  id                  uuid primary key default uuid_generate_v4(),
  submitter_id        uuid references profiles(id) on delete set null,
  brand_name          text not null,
  contact_name        text,
  contact_email       text,
  contact_phone       text,
  package             ad_package not null,
  amount_ngn          integer not null,
  description         text,
  media_url           text,
  link_url            text,
  status              ad_status default 'pending',
  payment_reference   text,
  payment_confirmed   boolean default false,
  starts_at           timestamptz,
  ends_at             timestamptz,
  created_at          timestamptz default now()
);
alter table ads_submissions enable row level security;
create policy "ads_select" on ads_submissions for select using (auth.uid() = submitter_id);
create policy "ads_insert" on ads_submissions for insert with check (true);

-- ──────────────────────────────────────────────────────────
-- NOTIFICATIONS
-- ──────────────────────────────────────────────────────────
create table if not exists notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references profiles(id) on delete cascade,
  type       text not null, -- like|comment|game_start|wallet_credit|space_live|prize_won|system
  title      text not null,
  body       text,
  link       text,
  is_read    boolean default false,
  created_at timestamptz default now()
);
alter table notifications enable row level security;
create policy "notifs_select" on notifications for select using (auth.uid() = user_id);
create policy "notifs_insert" on notifications for insert with check (true); -- server inserts
create policy "notifs_update" on notifications for update using (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────
-- PAYSTACK WEBHOOKS LOG
-- ──────────────────────────────────────────────────────────
create table if not exists paystack_events (
  id         uuid primary key default uuid_generate_v4(),
  event      text not null,
  reference  text,
  amount     bigint,
  email      text,
  status     text,
  payload    jsonb,
  processed  boolean default false,
  created_at timestamptz default now()
);

-- ──────────────────────────────────────────────────────────
-- USEFUL INDEXES
-- ──────────────────────────────────────────────────────────
create index if not exists posts_author_idx on posts(author_id);
create index if not exists posts_created_idx on posts(created_at desc);
create index if not exists notifs_user_idx on notifications(user_id, is_read, created_at desc);
create index if not exists tx_user_idx on transactions(user_id, created_at desc);
create index if not exists jobs_status_idx on jobs(status, created_at desc);
create index if not exists tracks_status_idx on tracks(status, plays desc);

-- ──────────────────────────────────────────────────────────
-- REALTIME ENABLE
-- ──────────────────────────────────────────────────────────
alter publication supabase_realtime add table notifications;
alter publication supabase_realtime add table posts;
alter publication supabase_realtime add table watch_party_chat;
alter publication supabase_realtime add table spaces;
alter publication supabase_realtime add table games;

-- ──────────────────────────────────────────────────────────
-- HELPER FUNCTIONS
-- ──────────────────────────────────────────────────────────

-- Increment wallet balance
create or replace function increment_wallet(user_id uuid, amount_kobo bigint)
returns void language plpgsql security definer as $$
begin
  update profiles
  set wallet_balance = wallet_balance + amount_kobo,
      total_earned = case when amount_kobo > 0 then total_earned + amount_kobo else total_earned end,
      total_spent = case when amount_kobo < 0 then total_spent + abs(amount_kobo) else total_spent end
  where id = user_id;
end;
$$;

-- Transfer between wallets
create or replace function transfer_wallet(from_id uuid, to_id uuid, amount_kobo bigint)
returns void language plpgsql security definer as $$
begin
  update profiles set wallet_balance = wallet_balance - amount_kobo where id = from_id;
  update profiles set wallet_balance = wallet_balance + amount_kobo where id = to_id;
end;
$$;
