-- Add missing profile fields used by onboarding
alter table profiles
  add column if not exists interests text[] default '{}',
  add column if not exists location text,
  add column if not exists website text;
