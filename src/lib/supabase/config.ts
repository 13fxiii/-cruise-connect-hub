import { normalizeSchema } from './utils';

function clean(value?: string | null) {
  const v = (value || '').trim();
  return v.length ? v : undefined;
}

function assertNoConflict(nameA: string, valueA: string | undefined, nameB: string, valueB: string | undefined) {
  if (!valueA || !valueB || valueA === valueB) return;
  const msg = `[supabase] Conflicting env values: ${nameA} and ${nameB}. Keep only one Supabase project linked to this Vercel environment.`;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(msg);
  }
  console.warn(msg);
}

const FOUNDATION_SUPABASE_URL = 'https://xiyjgcoeljquryixmfut.supabase.co';
const FOUNDATION_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpeWpnY29lbGpxdXJ5aXhtZnV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NTMzNjAsImV4cCI6MjA4NTEyOTM2MH0.BnVAwvmor0JnjmFn0t4t5lTZU_fIoE3FNl1RYOK1_Hk';

const env = {
  NEXT_PUBLIC_SUPABASE_URL: clean(process.env.NEXT_PUBLIC_SUPABASE_URL),
  SUPABASE_URL: clean(process.env.SUPABASE_URL),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  SUPABASE_ANON_KEY: clean(process.env.SUPABASE_ANON_KEY),
  SUPABASE_ANON: clean((process.env as any).SUPABASE_ANON),
  SUPABASE_SERVICE_ROLE_KEY: clean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  SUPABASE_SECRET_KEY: clean(process.env.SUPABASE_SECRET_KEY),
  SUPABASE_SERVICE_KEY: clean((process.env as any).SUPABASE_SERVICE_KEY),
  NEXT_PUBLIC_SUPABASE_SCHEMA: clean(process.env.NEXT_PUBLIC_SUPABASE_SCHEMA),
  SUPABASE_SCHEMA: clean(process.env.SUPABASE_SCHEMA),
};

assertNoConflict('NEXT_PUBLIC_SUPABASE_URL', env.NEXT_PUBLIC_SUPABASE_URL, 'SUPABASE_URL', env.SUPABASE_URL);
assertNoConflict(
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  'SUPABASE_ANON_KEY',
  env.SUPABASE_ANON_KEY
);

export const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL || FOUNDATION_SUPABASE_URL;

export const SUPABASE_ANON_KEY =
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  env.SUPABASE_ANON_KEY ||
  env.SUPABASE_ANON ||
  FOUNDATION_SUPABASE_ANON_KEY;

export const SUPABASE_SERVICE_ROLE_KEY =
  env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_KEY;

export const SUPABASE_SCHEMA = normalizeSchema(env.NEXT_PUBLIC_SUPABASE_SCHEMA || env.SUPABASE_SCHEMA);
