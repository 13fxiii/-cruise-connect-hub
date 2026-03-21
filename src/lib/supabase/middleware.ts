import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL  || 'https://xiyjgcoeljquryixmfut.supabase.co';
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpeWpnY29lbGpxdXJ5aXhtZnV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NTMzNjAsImV4cCI6MjA4NTEyOTM2MH0.BnVAwvmor0JnjmFn0t4t5lTZU_fIoE3FNl1RYOK1_Hk';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: Record<string, unknown>) {
        request.cookies.set(name, value);
        response = NextResponse.next({ request });
        response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]);
      },
      remove(name: string, options: Record<string, unknown>) {
        request.cookies.set(name, '');
        response = NextResponse.next({ request });
        response.cookies.set(name, '', options as Parameters<typeof response.cookies.set>[2]);
      },
    },
  });

  // Refresh the session so it doesn't expire
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Protected routes — bounce to login
  const protectedPrefixes = [
    '/feed', '/messages', '/notifications', '/profile',
    '/analytics', '/ai-tools', '/marketplace', '/dao',
    '/earn', '/leaderboard', '/admin', '/wallet', '/settings',
    '/spaces', '/games', '/music', '/search', '/onboarding',
  ];
  const isProtected = protectedPrefixes.some(p => pathname.startsWith(p));

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }

  // Logged-in users hitting login/signup → go to feed
  if (user && (pathname === '/auth/login' || pathname === '/auth/signup')) {
    const url = request.nextUrl.clone();
    url.pathname = '/feed';
    return NextResponse.redirect(url);
  }

  return response;
}
