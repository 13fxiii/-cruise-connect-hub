// Pure Supabase SSR auth - no NextAuth dependency
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";

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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name,
        image: user.user_metadata?.avatar_url,
        role: user.user_metadata?.role || 'member',
        twitterHandle: user.user_metadata?.preferred_username,
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
