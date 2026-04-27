import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';
import { SUPABASE_ANON_KEY, SUPABASE_SCHEMA, SUPABASE_URL } from './config';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    ...(SUPABASE_SCHEMA ? { db: { schema: SUPABASE_SCHEMA } } : {}),
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: Record<string, unknown>) {
        try {
          cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2]);
        } catch {}
      },
      remove(name: string, options: Record<string, unknown>) {
        try {
          cookieStore.set(name, '', options as Parameters<typeof cookieStore.set>[2]);
        } catch {}
      },
    },
  });
}
