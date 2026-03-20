import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xiyjgcoeljquryixmfut.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpeWpnY29lbGpxdXJ5aXhtZnV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NTMzNjAsImV4cCI6MjA4NTEyOTM2MH0.BnVAwvmor0JnjmFn0t4t5lTZU_fIoE3FNl1RYOK1_Hk',
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — must be called to keep session alive
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Protected routes → redirect to login
  const protectedPrefixes = ['/feed', '/messages', '/notifications', '/profile',
    '/analytics', '/ai-tools', '/marketplace', '/dao', '/earn', '/leaderboard',
    '/admin', '/wallet', '/spaces', '/games', '/music', '/search', '/onboarding'];
  const isProtected = protectedPrefixes.some(p => pathname.startsWith(p));

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }

  // Logged-in users hitting /auth/login or /auth/signup → go to feed
  if (user && (pathname === '/auth/login' || pathname === '/auth/signup')) {
    const url = request.nextUrl.clone();
    url.pathname = '/feed';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
