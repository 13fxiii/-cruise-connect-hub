// Pure Supabase SSR auth - X/Twitter OAuth via Supabase
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function auth() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) return null;

    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet: any[]) {
          try { cookiesToSet.forEach(({ name, value, options }: any) => cookieStore.set(name, value, options)); } catch {}
        },
      },
    });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const meta = user.user_metadata || {};
    const normalized = {
      id: user.id,
      email: user.email,
      name: meta.full_name || meta.name || meta.preferred_username,
      image: meta.avatar_url || meta.profile_image_url,
      role: meta.role || 'member',
      twitterHandle: meta.preferred_username || meta.screen_name,
      twitterId: meta.provider_id || meta.sub,
      twitterFollowers: meta.public_metrics?.followers_count,
    };
    return { ...normalized, user: { ...normalized } };
  } catch {
    return null;
  }
}

export async function signIn() {}
export async function signOut() {}

export const handlers = {
  GET: async () => new Response('{}', { status: 200 }),
  POST: async () => new Response('{}', { status: 200 }),
};
