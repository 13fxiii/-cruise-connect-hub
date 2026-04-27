import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';
import {
  SUPABASE_ANON_KEY,
  SUPABASE_SCHEMA,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_URL,
} from '@/lib/supabase/config';

let _supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseAdmin() {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      '[supabase] Missing SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY). Required for admin/server routes.'
    );
  }

  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
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
          cookiesToSet.forEach(({ name, value, options }) => (cookieStore as any).set(name, value, options));
        } catch {}
      },
    },
  });
}
