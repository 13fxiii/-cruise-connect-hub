-- Cruise Connect Hub: fresh-data reset helper
-- Run in Supabase SQL Editor (NOT in a shell).
-- WARNING: This permanently deletes app content data.

begin;

truncate table public.likes restart identity cascade;
truncate table public.post_comments restart identity cascade;
truncate table public.posts restart identity cascade;
truncate table public.notifications restart identity cascade;
truncate table public.live_spaces restart identity cascade;
truncate table public.game_sessions restart identity cascade;
truncate table public.game_participants restart identity cascade;
truncate table public.spaces restart identity cascade;

-- Optional: force onboarding flow for all members again.
update public.profiles
set onboarding_done = false,
    updated_at = now();

commit;
