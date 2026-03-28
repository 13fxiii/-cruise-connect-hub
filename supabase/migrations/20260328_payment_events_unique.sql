-- Prevent duplicate webhook inserts for the same event+reference (webhook retries)
create unique index if not exists payment_events_event_reference_uniq
  on payment_events(event, reference)
  where reference is not null;

