import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { normalizeSchema } from "@/lib/supabase/schema";
import { normalizeSchema } from '@/lib/supabase/utils';

const DEFAULT_SUPABASE_URL = 'https://xiyjgcoeljquryixmfut.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpeWpnY29lbGpxdXJ5aXhtZnV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NTMzNjAsImV4cCI6MjA4NTEyOTM2MH0.BnVAwvmor0JnjmFn0t4t5lTZU_fIoE3FNl1RYOK1_Hk';


// IMPORTANT:
// Do NOT default to "public" here. Some Supabase/PostgREST setups have a non-standard
// "Exposed schemas" configuration which will throw: "Invalid schema: public".
// If you need a specific schema, set NEXT_PUBLIC_SUPABASE_SCHEMA/SUPABASE_SCHEMA explicitly.
const SUPABASE_SCHEMA = normalizeSchema(process.env.NEXT_PUBLIC_SUPABASE_SCHEMA || process.env.SUPABASE_SCHEMA);

function normalizeSupabaseUrl(maybeUrl: string | undefined) {
  const url = (maybeUrl || '').trim();
  if (!url) return DEFAULT_SUPABASE_URL;
  // Avoid common placeholder values accidentally set in hosting dashboards.
  if (/\[.*\]/.test(url) || /your[_ -]?supabase/i.test(url) || /example\.com/i.test(url)) return DEFAULT_SUPABASE_URL;
  if (!/^https?:\/\//i.test(url)) return DEFAULT_SUPABASE_URL;
  return url;
}

function normalizeJwtKey(maybeKey: string | undefined, fallback: string) {
  const key = (maybeKey || '').trim();
  if (!key) return fallback;
  // Real Supabase keys are JWT-like (3 dot-separated segments).
  if (/\[.*\]/.test(key) || /anon key/i.test(key) || /service role/i.test(key) || /your[_ -]?supabase/i.test(key)) return fallback;
  if (key.split('.').length !== 3) return fallback;
  return key;
}

// Support both "Next public" vars and Vercel/Supabase integration vars.
const SUPABASE_URL = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL);

const SUPABASE_ANON_KEY = normalizeJwtKey(
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    // Back-compat: older env names
    (process.env as any).SUPABASE_ANON,
  DEFAULT_SUPABASE_ANON_KEY
);

const SUPABASE_SERVICE_KEY =
  normalizeJwtKey(
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SECRET_KEY ||
      (process.env as any).SUPABASE_SERVICE_KEY,
    SUPABASE_ANON_KEY
  );

let _supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { persistSession: false },
      ...(SUPABASE_SCHEMA ? { db: { schema: SUPABASE_SCHEMA } } : {}),
    });
  }
  return _supabaseAdmin;
}

export const supabaseAdmin = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(_target, prop) {
    return (getSupabaseAdmin() as any)[prop];
  },
});

export function getSupabaseBrowser() {
  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    ...(SUPABASE_SCHEMA ? { db: { schema: SUPABASE_SCHEMA } } : {}),
  });
}

export function createSupabaseServerClient() {
  const cookieStore = cookies();
  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    ...(SUPABASE_SCHEMA ? { db: { schema: SUPABASE_SCHEMA } } : {}),
    cookies: {
      getAll() {
        return (cookieStore as any).getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            (cookieStore as any).set(name, value, options)
          );
        } catch {}
      },
    },
  });
}
