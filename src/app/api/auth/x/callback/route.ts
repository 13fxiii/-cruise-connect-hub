// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { OAuth2 } from '@xdevplatform/xdk';

function getSafeRedirect(redirectTo?: string): string {
  if (!redirectTo) return '/feed';
  if (redirectTo.startsWith('/') && !redirectTo.startsWith('//')) return redirectTo;
  return '/feed';
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin;
  const code  = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Error from X
  if (error) {
    return NextResponse.redirect(`${appUrl}/auth/login?error=x_denied`);
  }

  // Validate state
  const storedState  = request.cookies.get('x_oauth_state')?.value;
  const codeVerifier = request.cookies.get('x_code_verifier')?.value;
  const redirectTo   = getSafeRedirect(request.cookies.get('x_oauth_redirect_to')?.value);

  if (!code || !state || state !== storedState || !codeVerifier) {
    return NextResponse.redirect(`${appUrl}/auth/login?error=x_invalid_state`);
  }

  const clientId     = process.env.TWITTER_CLIENT_ID;
  const clientSecret = process.env.TWITTER_CLIENT_SECRET;
  const redirectUri  = `${appUrl}/api/auth/x/callback`;

  if (!clientId || !clientSecret || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.redirect(`${appUrl}/auth/login?error=x_config_missing`);
  }

  try {
    // Use XDK OAuth2 for token exchange
    const oauth2Config = {
      clientId,
      clientSecret,
      redirectUri,
      scope: ['tweet.read', 'users.read', 'offline.access'],
    };

    const oauth2 = new OAuth2(oauth2Config);
    const tokens = await oauth2.exchangeCode(code, codeVerifier);

    if (!tokens.access_token) {
      console.error('X token error: No access token');
      return NextResponse.redirect(`${appUrl}/auth/login?error=x_token_failed`);
    }

    // Get X user info using XDK
    const { Client } = await import('@xdevplatform/xdk');
    const client = new Client({ accessToken: tokens.access_token });
    const userResponse = await client.users.getMe({
      'user.fields': ['name', 'username', 'profile_image_url']
    });
    const xUser = userResponse.data;

    if (!xUser?.id) {
      return NextResponse.redirect(`${appUrl}/auth/login?error=x_user_failed`);
    }

    // Use Supabase admin to create/get user
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const proxyEmail = `x_${xUser.id}@cruise-connect.app`;
    const displayName = xUser.name || xUser.username;
    const handle = `@${xUser.username}`;
    let userId: string;

    // Check if user exists
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      console.error('List users error:', listError);
    }
    const existingUser = existingUsers?.users?.find(u => u.email === proxyEmail);

    if (existingUser) {
      userId = existingUser.id;
    } else {
      const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
        email: proxyEmail,
        email_confirm: true,
        user_metadata: {
          full_name: displayName,
          username: xUser.username,
          avatar_url: xUser.profile_image_url?.replace('_normal', '_400x400'),
          x_id: xUser.id,
          x_username: xUser.username,
          provider: 'x',
        },
      });
      if (createErr || !newUser?.user) {
        console.error('Create user error:', createErr);
        return NextResponse.redirect(`${appUrl}/auth/login?error=x_create_failed`);
      }
      userId = newUser.user.id;

      await supabase.from('profiles').upsert({
        id: userId,
        username: xUser.username,
        display_name: displayName,
        avatar_url: xUser.profile_image_url?.replace('_normal', '_400x400') || '',
        twitter_handle: handle,
        referral_code: 'CCH-' + userId.substring(0, 6).toUpperCase(),
      }, { onConflict: 'id' });
    }

    // Store X OAuth tokens for backend calls
    const expiresAt = tokens.expires_at ? new Date(tokens.expires_at * 1000).toISOString() : null;
    await supabase.from('x_oauth_tokens').upsert({
      user_id: userId,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || null,
      token_type: tokens.token_type || 'bearer',
      scope: tokens.scope || null,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    const { data: sessionData, error: sessionErr } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: proxyEmail,
    });

    if (sessionErr || !sessionData?.properties?.hashed_token) {
      console.error('Session error:', sessionErr);
      return NextResponse.redirect(`${appUrl}/auth/login?error=x_session_failed`);
    }

    const confirmUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/verify?token=${sessionData.properties.hashed_token}&type=magiclink&redirect_to=${appUrl}${redirectTo}`;

    const response = NextResponse.redirect(confirmUrl);
    response.cookies.delete('x_code_verifier');
    response.cookies.delete('x_oauth_state');
    response.cookies.delete('x_oauth_redirect_to');
    return response;

  } catch (err) {
    console.error('X OAuth callback error:', err);
    return NextResponse.redirect(`${appUrl}/auth/login?error=x_unknown`);
  }
}
