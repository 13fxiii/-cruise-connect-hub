-- Create unified payment events log
create table if not exists payment_events (
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
