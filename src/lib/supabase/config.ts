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

function requireValue(label: string, value: string | undefined) {
  if (value) return value;
  throw new Error(`[supabase] Missing required environment variable: ${label}`);
}

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

export const SUPABASE_URL = requireValue(
  'NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)',
  env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL
);

export const SUPABASE_ANON_KEY = requireValue(
  'NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_ANON_KEY)',
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || env.SUPABASE_ANON
);

export const SUPABASE_SERVICE_ROLE_KEY =
  env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_KEY;

export const SUPABASE_SCHEMA = normalizeSchema(env.NEXT_PUBLIC_SUPABASE_SCHEMA || env.SUPABASE_SCHEMA);
