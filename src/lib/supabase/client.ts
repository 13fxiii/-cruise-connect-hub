import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';
import { SUPABASE_ANON_KEY, SUPABASE_SCHEMA, SUPABASE_URL } from './config';

export function createClient() {
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    ...(SUPABASE_SCHEMA ? { db: { schema: SUPABASE_SCHEMA } } : {}),
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}
