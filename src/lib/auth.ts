// Pure Supabase SSR auth - no NextAuth dependency
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xiyjgcoeljquryixmfut.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpeWpnY29lbGpxdXJ5aXhtZnV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NTMzNjAsImV4cCI6MjA4NTEyOTM2MH0.BnVAwvmor0JnjmFn0t4t5lTZU_fIoE3FNl1RYOK1_Hk';

export async function auth() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet: any[]) {
          try { cookiesToSet.forEach(({ name, value, options }: any) => cookieStore.set(name, value, options)); } catch {}
        },
      },
    });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
        image: session.user.user_metadata?.avatar_url,
        role: session.user.user_metadata?.role || 'member',
        twitterHandle: session.user.user_metadata?.preferred_username,
      }
    };
  } catch {
    return null;
  }
}

export async function signIn() {}
export async function signOut() {}

// Stub handlers for API route compatibility
export const handlers = {
  GET: async () => new Response('{}', { status: 200 }),
  POST: async () => new Response('{}', { status: 200 }),
};
