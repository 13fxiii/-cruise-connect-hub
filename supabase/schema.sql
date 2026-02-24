-- ============================================================
-- CRUISE & CONNECT HUB — Supabase Schema (Phase 1)
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  twitter_handle TEXT,
  website_url TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  is_verified BOOLEAN DEFAULT FALSE,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url, twitter_handle)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'user_name',
      SPLIT_PART(NEW.email, '@', 1) || '_' || SUBSTR(NEW.id::TEXT, 1, 6)
    ),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    NEW.raw_user_meta_data->>'user_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- POSTS (Community Feed)
-- ============================================================
CREATE TABLE public.posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL CHECK (LENGTH(content) <= 500),
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video', NULL)),
  post_type TEXT DEFAULT 'text' CHECK (post_type IN ('text', 'music', 'promo', 'event')),
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  reposts_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LIKES
-- ============================================================
CREATE TABLE public.likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Trigger: update likes count on posts
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_like_change
  AFTER INSERT OR DELETE ON public.likes
  FOR EACH ROW EXECUTE FUNCTION update_likes_count();

-- ============================================================
-- REPLIES
-- ============================================================
CREATE TABLE public.replies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL CHECK (LENGTH(content) <= 280),
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: update replies count
CREATE OR REPLACE FUNCTION update_replies_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET replies_count = replies_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET replies_count = replies_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_reply_change
  AFTER INSERT OR DELETE ON public.replies
  FOR EACH ROW EXECUTE FUNCTION update_replies_count();

-- ============================================================
-- PR / ADS SUBMISSIONS
-- ============================================================
CREATE TABLE public.pr_ads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  submitter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Contact & Identity
  artist_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  twitter_handle TEXT,
  
  -- Campaign Details
  campaign_type TEXT NOT NULL CHECK (campaign_type IN ('1_day', '1_day_dual', 'weekly', 'monthly', 'brand_ambassador_3m', 'brand_ambassador_6m')),
  promotion_type TEXT NOT NULL CHECK (promotion_type IN ('music', 'brand', 'business', 'event', 'other')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_audience TEXT,
  
  -- Content
  asset_url TEXT,
  asset_type TEXT CHECK (asset_type IN ('image', 'video', 'audio', NULL)),
  linktree_url TEXT,
  
  -- Pricing (in Naira)
  amount_ngn INTEGER NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'live', 'completed')),
  admin_notes TEXT,
  
  -- Dates
  requested_start_date DATE,
  approved_at TIMESTAMPTZ,
  goes_live_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FOLLOWS
-- ============================================================
CREATE TABLE public.follows (
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'reply', 'follow', 'pr_approved', 'pr_rejected', 'mention')),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_posts_author ON public.posts(author_id);
CREATE INDEX idx_posts_created ON public.posts(created_at DESC);
CREATE INDEX idx_posts_type ON public.posts(post_type);
CREATE INDEX idx_likes_post ON public.likes(post_id);
CREATE INDEX idx_likes_user ON public.likes(user_id);
CREATE INDEX idx_replies_post ON public.replies(post_id);
CREATE INDEX idx_pr_ads_status ON public.pr_ads(status);
CREATE INDEX idx_pr_ads_submitter ON public.pr_ads(submitter_id);
CREATE INDEX idx_notifications_recipient ON public.notifications(recipient_id, is_read);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pr_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: public read, own write
CREATE POLICY "profiles_public_read" ON public.profiles FOR SELECT USING (TRUE);
CREATE POLICY "profiles_own_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_own_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Posts: public read, auth write
CREATE POLICY "posts_public_read" ON public.posts FOR SELECT USING (is_deleted = FALSE);
CREATE POLICY "posts_auth_insert" ON public.posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "posts_own_update" ON public.posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "posts_own_delete" ON public.posts FOR DELETE USING (auth.uid() = author_id);

-- Likes: public read, auth write
CREATE POLICY "likes_public_read" ON public.likes FOR SELECT USING (TRUE);
CREATE POLICY "likes_auth_insert" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_own_delete" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- Replies: public read, auth write
CREATE POLICY "replies_public_read" ON public.replies FOR SELECT USING (is_deleted = FALSE);
CREATE POLICY "replies_auth_insert" ON public.replies FOR INSERT WITH CHECK (auth.uid() = author_id);

-- PR/ADS: own read/write + admin read all
CREATE POLICY "pr_ads_own_read" ON public.pr_ads FOR SELECT USING (auth.uid() = submitter_id);
CREATE POLICY "pr_ads_auth_insert" ON public.pr_ads FOR INSERT WITH CHECK (auth.uid() = submitter_id);
CREATE POLICY "pr_ads_own_update" ON public.pr_ads FOR UPDATE USING (
  auth.uid() = submitter_id AND status = 'pending'
);

-- Follows: public read, auth write
CREATE POLICY "follows_public_read" ON public.follows FOR SELECT USING (TRUE);
CREATE POLICY "follows_auth_insert" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows_own_delete" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- Notifications: own read only
CREATE POLICY "notifications_own_read" ON public.notifications FOR SELECT USING (auth.uid() = recipient_id);
CREATE POLICY "notifications_own_update" ON public.notifications FOR UPDATE USING (auth.uid() = recipient_id);

-- ============================================================
-- STORAGE BUCKETS (run separately in Supabase Dashboard)
-- ============================================================
-- Create these buckets in Storage section:
-- 1. "avatars" - public, max 2MB, image/*
-- 2. "post-media" - public, max 10MB, image/*, video/*
-- 3. "pr-assets" - public, max 50MB, image/*, video/*, audio/*
