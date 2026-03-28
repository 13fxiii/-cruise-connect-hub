// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code             = searchParams.get('code');
  const error            = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const errorUri         = searchParams.get('error_uri');
  const redirectToParam  = searchParams.get('redirectTo');

  // Never log full query params in production (may contain sensitive auth codes).
  if (process.env.NODE_ENV !== 'production') {
    console.log('[auth/callback]', { hasCode: !!code, error, errorDescription, errorUri });
  }

  // X/Twitter OAuth error — usually means redirect URL mismatch in Supabase dashboard
  if (error) {
    const msg = encodeURIComponent(errorDescription || error);
    console.error('[auth/callback] OAuth error:', error, errorDescription);
    return NextResponse.redirect(`${origin}/auth/login?error=${msg}`);
  }

  if (code) {
    const supabase = await createClient();
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('[auth/callback] Code exchange failed:', exchangeError.message);
      const msg = encodeURIComponent(exchangeError.message);
      return NextResponse.redirect(`${origin}/auth/login?error=${msg}`);
    }

    if (data?.user) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[auth/callback] Success, user:', data.user.id);
      }

      // Check if new user (no display_name = hasn't done onboarding)
      // Use maybeSingle — .single() throws PGRST116 if no row exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, username')
        .eq('id', data.user.id)
        .maybeSingle();

      const isNewUser = !profile || !profile.display_name || !profile.username;

      // Optional post-login redirect (must be a safe internal path).
      let safeRedirect: string | null = null;
      if (redirectToParam && redirectToParam.startsWith('/') && !redirectToParam.startsWith('//')) {
        safeRedirect = redirectToParam;
      }

      const dest = isNewUser
        ? `${origin}/onboarding`
        : `${origin}${safeRedirect || '/feed'}`;

      if (process.env.NODE_ENV !== 'production') {
        console.log('[auth/callback] Redirecting to:', dest, '(isNewUser:', isNewUser, ')');
      }

      return NextResponse.redirect(dest);
    }
  }

  // No code, no error — bare callback hit
  return NextResponse.redirect(`${origin}/feed`);
}
