import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getAdminAllowlist, isAdminAllowlisted } from '@/lib/authz';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://xiyjgcoeljquryixmfut.supabase.co';

const SUPABASE_ANON =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpeWpnY29lbGpxdXJ5aXhtZnV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NTMzNjAsImV4cCI6MjA4NTEyOTM2MH0.BnVAwvmor0JnjmFn0t4t5lTZU_fIoE3FNl1RYOK1_Hk';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON, {
    cookies: {
      get(name: string) { return request.cookies.get(name)?.value; },
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

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  // Admin-only routes. Prefer env allowlist when configured; otherwise fall back to profile flags.
  const adminOnlyPrefixes = ['/admin', '/moderator', '/api/admin'];
  const isAdminOnly = adminOnlyPrefixes.some((p) => pathname.startsWith(p));
  if (user && isAdminOnly) {
    const allow = getAdminAllowlist();
    let isAdmin = false;

    if (allow.configured) {
      isAdmin = isAdminAllowlisted(user);
    } else {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin, role')
        .eq('id', user.id)
        .maybeSingle();
      if (!error) {
        isAdmin = Boolean(profile?.is_admin) || profile?.role === 'admin';
      }
    }

    if (!isAdmin) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const url = request.nextUrl.clone();
      url.pathname = '/feed';
      return NextResponse.redirect(url);
    }
  }

  // Routes that require login
  const protectedPrefixes = [
    '/feed', '/messages', '/notifications', '/profile',
    '/analytics', '/ai-tools', '/marketplace', '/dao',
    '/earn', '/leaderboard', '/admin', '/wallet', '/settings',
    '/spaces', '/games', '/music', '/search', '/onboarding',
    '/community-id',
    '/moderator',
  ];
  const isProtected = protectedPrefixes.some(p => pathname.startsWith(p));

  // Not logged in → login
  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }

  // Logged-in hitting login/signup → feed
  if (user && (pathname === '/auth/login' || pathname === '/auth/signup')) {
    const url = request.nextUrl.clone();
    url.pathname = '/feed';
    return NextResponse.redirect(url);
  }

  // Logged-in on protected route — check onboarding completion
  // Only check feed/messages/games/spaces/earn (not onboarding itself or profile)
  const needsOnboardingCheck = ['/feed', '/messages', '/games', '/spaces', '/earn', '/music', '/dao', '/leaderboard', '/wallet', '/community-id', '/settings', '/analytics', '/ai-tools', '/marketplace'];
  const shouldCheck = user && needsOnboardingCheck.some(p => pathname.startsWith(p));

  if (shouldCheck) {
    // Rules acceptance: every user should see the rules at least once after login.
    const { data: rulesRow, error: rulesError } = await supabase
      .from('member_rules_accepted')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('display_name, username')
      .eq('id', user.id)
      .maybeSingle();

    // If the DB schema is misconfigured (or any other error), never hard-block the user.
    if (error || rulesError) return response;

    const rulesAccepted = Boolean(rulesRow?.user_id);
    const incompleteProfile = !profile || !profile.display_name || !profile.username;
    const incomplete = !rulesAccepted || incompleteProfile;
    if (incomplete) {
      const url = request.nextUrl.clone();
      url.pathname = '/onboarding';
      return NextResponse.redirect(url);
    }
  }

  return response;
}
