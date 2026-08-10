import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Client, OAuth2 } from '@xdevplatform/xdk';

function getSafeRedirect(redirectTo?: string): string {
  if (!redirectTo) return '/feed';
  if (redirectTo.startsWith('/') && !redirectTo.startsWith('//')) return redirectTo;
  return '/feed';
}

function getOAuthCookie(request: NextRequest, name: string) {
  return request.cookies.get(`__Host-${name}`)?.value;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const appUrl = (configuredAppUrl || origin).replace(/\/+$/, '');
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) return NextResponse.redirect(`${appUrl}/auth/login?error=x_denied`);

  const storedState = getOAuthCookie(request, 'x_oauth_state');
  const codeVerifier = getOAuthCookie(request, 'x_code_verifier');
  const redirectTo = getSafeRedirect(getOAuthCookie(request, 'x_oauth_redirect_to'));

  if (!code || !state || !storedState || state !== storedState || !codeVerifier) return NextResponse.redirect(`${appUrl}/auth/login?error=x_invalid_state`);

  const clientId = process.env.TWITTER_CLIENT_ID || process.env.X_CLIENT_ID;
  const clientSecret = process.env.TWITTER_CLIENT_SECRET || process.env.X_CLIENT_SECRET;
  const redirectUri = `${appUrl}/api/auth/x/callback`;

  if (!clientId || !clientSecret || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.redirect(`${appUrl}/auth/login?error=x_config_missing`);

  try {
    const oauth2 = new OAuth2({ clientId, clientSecret, redirectUri, scope: ['tweet.read', 'tweet.write', 'users.read', 'dm.read', 'dm.write', 'offline.access'] });
    const tokens = await oauth2.exchangeCode(code, codeVerifier);
    if (!tokens.access_token) return NextResponse.redirect(`${appUrl}/auth/login?error=x_token_failed`);

    const xClient = new Client({ accessToken: tokens.access_token });
    const userResponse = await xClient.users.getMe({ 'user.fields': ['name', 'username', 'profile_image_url'] });
    const xUser = userResponse?.data as any;
    if (!xUser?.id || !xUser.username) return NextResponse.redirect(`${appUrl}/auth/login?error=x_user_failed`);

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
    const proxyEmail = `x_${xUser.id}@cruise-connect.app`;
    const displayName = xUser.name || xUser.username;
    const avatarRaw = xUser.profileImageUrl || xUser.profile_image_url || '';
    const avatarUrl = String(avatarRaw).replace('_normal', '_400x400');

    const { data: { users } } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const existingUser = users?.find(u => u.email === proxyEmail);
    let userId = existingUser?.id;
    let isNewUser = false;
    if (!userId) {
      isNewUser = true;
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({ email: proxyEmail, email_confirm: true, user_metadata: { full_name: displayName, username: xUser.username, avatar_url: avatarUrl, x_id: xUser.id, x_username: xUser.username, provider: 'x', onboarding_done: false } });
      if (createErr || !created?.user?.id) { console.error('Create user error:', createErr); return NextResponse.redirect(`${appUrl}/auth/login?error=x_create_failed`); }
      userId = created.user.id;
    }

    const { data: profile } = await supabase.from('profiles').select('onboarding_done').eq('id', userId).maybeSingle();
    if (!profile?.onboarding_done) isNewUser = true;

    await supabase.from('profiles').upsert({ id: userId, username: xUser.username, display_name: displayName, avatar_url: avatarUrl, x_username: xUser.username, x_display_name: displayName, x_avatar_url: avatarUrl, twitter_handle: `@${xUser.username}`, onboarding_done: false, updated_at: new Date().toISOString() }, { onConflict: 'id' });

    const expiresAt = tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : null;
    await supabase.from('x_oauth_tokens').upsert({ user_id: userId, access_token: tokens.access_token, refresh_token: tokens.refresh_token || null, token_type: tokens.token_type || 'bearer', scope: tokens.scope || null, expires_at: expiresAt, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });

    const { data: sessionData, error: sessionErr } = await supabase.auth.admin.createSession({ user_id: userId });
    if (sessionErr || !sessionData?.session) return NextResponse.redirect(`${appUrl}/auth/login?error=x_session_failed`);

    const response = NextResponse.redirect(`${appUrl}${isNewUser ? '/onboarding' : redirectTo}`);
    const { access_token, refresh_token } = sessionData.session;
    const sessionCookie = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, maxAge: 60 * 60 * 24 * 30, path: '/' };
    response.cookies.set('__Host-sb-access-token', access_token, sessionCookie);
    response.cookies.set('__Host-sb-refresh-token', refresh_token, sessionCookie);
    response.cookies.delete('__Host-x_code_verifier');
    response.cookies.delete('__Host-x_oauth_state');
    response.cookies.delete('__Host-x_oauth_redirect_to');
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (err) {
    console.error('X OAuth callback error:', err);
    return NextResponse.redirect(`${appUrl}/auth/login?error=x_unknown`);
  }
}
