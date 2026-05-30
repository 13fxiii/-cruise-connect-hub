-- Cruise Connect Hub — Add member_number and id_card_code to profiles
-- These power the onboarding Community ID card feature.
-- member_number: auto-incrementing 4-digit+ member counter (starts at 1000)
-- id_card_code: unique human-readable ID (e.g. CCH-A3F2)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS member_number  INTEGER,
  ADD COLUMN IF NOT EXISTS id_card_code   TEXT;

-- Create a sequence starting at 1001 if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'member_number_seq') THEN
    CREATE SEQUENCE public.member_number_seq START 1001 INCREMENT 1;
  END IF;
END $$;

-- Back-fill existing profiles with sequential member numbers (order by created_at)
DO $$ 
DECLARE
  rec RECORD;
  seq_val INTEGER;
BEGIN
  FOR rec IN SELECT id FROM public.profiles WHERE member_number IS NULL ORDER BY created_at ASC LOOP
    seq_val := nextval('public.member_number_seq');
    UPDATE public.profiles
    SET
      member_number = seq_val,
      id_card_code  = COALESCE(id_card_code, 'CCH-' || upper(substring(md5(id::text) for 4)))
    WHERE id = rec.id;
  END LOOP;
END $$;

-- Function + trigger: auto-assign member_number and id_card_code on new profile insert
CREATE OR REPLACE FUNCTION public.assign_member_id()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.member_number IS NULL THEN
    NEW.member_number := nextval('public.member_number_seq');
  END IF;
  IF NEW.id_card_code IS NULL OR NEW.id_card_code = '' THEN
    NEW.id_card_code := 'CCH-' || upper(substring(md5(NEW.id::text) for 4));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_assign_member_id ON public.profiles;
CREATE TRIGGER trg_assign_member_id
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.assign_member_id();
