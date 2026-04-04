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
  const isPopup          = searchParams.get('popup') === '1';

  // Never log full query params in production (may contain sensitive auth codes).
  if (process.env.NODE_ENV !== 'production') {
    console.log('[auth/callback]', { hasCode: !!code, error, errorDescription, errorUri });
  }

  const popupResponse = (payload: { type: string; dest?: string; error?: string }) => {
    const safePayload = JSON.stringify(payload);
    const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Signing you in…</title>
    <style>
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; padding: 24px; background:#0a0a0a; color:#fff; }
      .muted { color: #a1a1aa; font-size: 12px; margin-top: 6px; }
      .card { max-width: 420px; margin: 0 auto; border: 1px solid #27272a; background:#09090b; border-radius: 16px; padding: 18px; }
      .title { font-weight: 900; font-size: 16px; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="title">Signing you in…</div>
      <div class="muted">You can close this window if it doesn’t close automatically.</div>
    </div>
    <script>
      (function () {
        const payload = ${safePayload};
        try {
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage(payload, window.location.origin);
            if (payload && payload.dest) {
              try { window.opener.location.href = payload.dest; } catch (e) {}
            }
          }
        } catch (e) {}
        try { window.close(); } catch (e) {}
        if (payload && payload.dest) {
          setTimeout(() => { window.location.href = payload.dest; }, 700);
        }
      })();
    </script>
  </body>
</html>`;

    return new NextResponse(html, {
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  };

  // X/Twitter OAuth error — usually means redirect URL mismatch in Supabase dashboard
  if (error) {
    const msg = encodeURIComponent(errorDescription || error);
    console.error('[auth/callback] OAuth error:', error, errorDescription);
    if (isPopup) {
      return popupResponse({
        type: 'cch-auth-error',
        error: decodeURIComponent(msg),
        dest: `${origin}/auth/login?error=${msg}`,
      });
    }
    return NextResponse.redirect(`${origin}/auth/login?error=${msg}`);
  }

  if (code) {
    const supabase = await createClient();
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('[auth/callback] Code exchange failed:', exchangeError.message);
      const msg = encodeURIComponent(exchangeError.message);
      if (isPopup) {
        return popupResponse({
          type: 'cch-auth-error',
          error: exchangeError.message,
          dest: `${origin}/auth/login?error=${msg}`,
        });
      }
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

      if (isPopup) {
        return popupResponse({ type: 'cch-auth-success', dest });
      }
      return NextResponse.redirect(dest);
    }
  }

  // No code, no error — bare callback hit
  return NextResponse.redirect(`${origin}/feed`);
}
