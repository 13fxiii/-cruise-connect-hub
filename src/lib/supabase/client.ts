import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';
import { normalizeSchema } from './utils';

const DEFAULT_SUPABASE_URL = 'https://xiyjgcoeljquryixmfut.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpeWpnY29lbGpxdXJ5aXhtZnV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NTMzNjAsImV4cCI6MjA4NTEyOTM2MH0.BnVAwvmor0JnjmFn0t4t5lTZU_fIoE3FNl1RYOK1_Hk';

function normalizeSupabaseUrl(maybeUrl: string | undefined) {
  const url = (maybeUrl || '').trim();
  if (!url) return DEFAULT_SUPABASE_URL;
  if (/\[.*\]/.test(url) || /your[_ -]?supabase/i.test(url) || /example\.com/i.test(url)) return DEFAULT_SUPABASE_URL;
  if (!/^https?:\/\//i.test(url)) return DEFAULT_SUPABASE_URL;
  return url;
}

function normalizeAnonKey(maybeKey: string | undefined) {
  const key = (maybeKey || '').trim();
  if (!key) return DEFAULT_SUPABASE_ANON_KEY;
  if (/\[.*\]/.test(key) || /anon key/i.test(key) || /your[_ -]?supabase/i.test(key)) return DEFAULT_SUPABASE_ANON_KEY;
  if (key.split('.').length === 3) return key; // legacy JWT
  if (key.startsWith('sb_publishable_')) return key; // new Supabase publishable format
  return DEFAULT_SUPABASE_ANON_KEY;
}

const SUPABASE_URL = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL);

const SUPABASE_ANON = normalizeAnonKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY);

type SchemaName = Exclude<keyof Database, "__InternalSupabase">;
function normalizeSchema(maybeSchema: string | undefined): SchemaName | undefined {
  const schema = (maybeSchema || "").trim().replace(/\.+$/, "");
  if (!schema) return undefined;
  if (/\[.*\]/.test(schema) || /your[_ -]?schema/i.test(schema)) return undefined;
  if (schema.toLowerCase() === "public") return undefined;
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(schema)) return undefined;
  return schema as SchemaName;
}

// Do not default to "public" to avoid "Invalid schema: public" when Supabase "Exposed schemas"
// is configured to something else.
const SUPABASE_SCHEMA = normalizeSchema(process.env.NEXT_PUBLIC_SUPABASE_SCHEMA || process.env.SUPABASE_SCHEMA);

export function createClient() {
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON, {
    ...(SUPABASE_SCHEMA ? { db: { schema: SUPABASE_SCHEMA } } : {}),
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}
