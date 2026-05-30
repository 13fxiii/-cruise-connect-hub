import { normalizeSchema } from './utils';

function clean(value?: string | null) {
  const v = (value || '').trim();
  return v.length ? v : undefined;
}

const url = clean(process.env.NEXT_PUBLIC_SUPABASE_URL) || clean(process.env.SUPABASE_URL);
const anonKey = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) || clean(process.env.SUPABASE_ANON_KEY);

if (!url) throw new Error('[supabase] NEXT_PUBLIC_SUPABASE_URL is not set');
if (!anonKey) throw new Error('[supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');

export const SUPABASE_URL = url;
export const SUPABASE_ANON_KEY = anonKey;
export const SUPABASE_SERVICE_ROLE_KEY =
  clean(process.env.SUPABASE_SERVICE_ROLE_KEY) ||
  clean(process.env.SUPABASE_SECRET_KEY);

export const SUPABASE_SCHEMA = normalizeSchema(
  clean(process.env.NEXT_PUBLIC_SUPABASE_SCHEMA) || clean(process.env.SUPABASE_SCHEMA)
);
