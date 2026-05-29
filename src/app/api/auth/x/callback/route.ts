import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Client, OAuth2 } from '@xdevplatform/xdk';

function getSafeRedirect(redirectTo?: string): string {
  if (!redirectTo) return '/feed';
  if (redirectTo.startsWith('/') && !redirectTo.startsWith('//')) return redirectTo;
  return '/feed';
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || origin).replace(/\/+$/, '');
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(`${appUrl}/auth/login?error=x_denied`);
  }

  const storedState = request.cookies.get('x_oauth_state')?.value;
  const codeVerifier = request.cookies.get('x_code_verifier')?.value;
  const redirectTo = getSafeRedirect(request.cookies.get('x_oauth_redirect_to')?.value);

  if (!code || !state || state !== storedState || !codeVerifier) {
    return NextResponse.redirect(`${appUrl}/auth/login?error=x_invalid_state`);
  }

  const clientId = process.env.TWITTER_CLIENT_ID || process.env.X_CLIENT_ID;
  const clientSecret = process.env.TWITTER_CLIENT_SECRET || process.env.X_CLIENT_SECRET;
  const redirectUri = `${appUrl}/api/auth/x/callback`;

  if (!clientId || !clientSecret || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.redirect(`${appUrl}/auth/login?error=x_config_missing`);
  }

  try {
    const oauth2 = new OAuth2({
      clientId,
      clientSecret,
      redirectUri,
      scope: ['tweet.read', 'tweet.write', 'users.read', 'dm.read', 'dm.write', 'offline.access'],
    });

    const tokens = await oauth2.exchangeCode(code, codeVerifier);

    if (!tokens.access_token) {
      return NextResponse.redirect(`${appUrl}/auth/login?error=x_token_failed`);
    }

    const xClient = new Client({ accessToken: tokens.access_token });
    const userResponse = await xClient.users.getMe({
      'user.fields': ['name', 'username', 'profile_image_url'],
    });

    const xUser = userResponse?.data as any;
    if (!xUser?.id || !xUser.username) {
      return NextResponse.redirect(`${appUrl}/auth/login?error=x_user_failed`);
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const proxyEmail = `x_${xUser.id}@cruise-connect.app`;
    const displayName = xUser.name || xUser.username;
    const avatarRaw = xUser.profileImageUrl || xUser.profile_image_url || '';
    const avatarUrl = String(avatarRaw).replace('_normal', '_400x400');

    const { data: existingByEmail } = await (supabase.auth.admin as any).getUserByEmail(proxyEmail);
    let userId = existingByEmail?.user?.id;

    if (!userId) {
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email: proxyEmail,
        email_confirm: true,
        user_metadata: {
          full_name: displayName,
          username: xUser.username,
          avatar_url: avatarUrl,
          x_id: xUser.id,
          x_username: xUser.username,
          provider: 'x',
        },
      });

      if (createErr || !created?.user?.id) {
        console.error('Create user error:', createErr);
        return NextResponse.redirect(`${appUrl}/auth/login?error=x_create_failed`);
      }
      userId = created.user.id;
    }

    await supabase.from('profiles').upsert(
      {
        id: userId,
        username: xUser.username,
        display_name: displayName,
        avatar_url: avatarUrl,
        twitter_handle: `@${xUser.username}`,
        referral_code: `CCH-${userId.slice(0, 6).toUpperCase()}`,
      },
      { onConflict: 'id' }
    );

    const expiresAt = tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : null;
    await supabase.from('x_oauth_tokens').upsert(
      {
        user_id: userId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || null,
        token_type: tokens.token_type || 'bearer',
        scope: tokens.scope || null,
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

    const { data: sessionData, error: sessionErr } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: proxyEmail,
      options: { redirectTo: `${appUrl}${redirectTo}` },
    });

    if (sessionErr || !sessionData?.properties?.action_link) {
      console.error('Session generation error:', sessionErr);
      return NextResponse.redirect(`${appUrl}/auth/login?error=x_session_failed`);
    }

    const response = NextResponse.redirect(sessionData.properties.action_link);
    response.cookies.delete('x_code_verifier');
    response.cookies.delete('x_oauth_state');
    response.cookies.delete('x_oauth_redirect_to');
    return response;
  } catch (err) {
    console.error('X OAuth callback error:', err);
    return NextResponse.redirect(`${appUrl}/auth/login?error=x_unknown`);
  }
}
