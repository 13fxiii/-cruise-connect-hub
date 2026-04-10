// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSafeRedirect(redirectTo?: string): string {
  if (!redirectTo) return '/feed';
  if (redirectTo.startsWith('/') && !redirectTo.startsWith('//')) return redirectTo;
  return '/feed';
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || origin).replace(/\/+$/, '');
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

  const clientId     = process.env.TWITTER_CLIENT_ID || process.env.X_CLIENT_ID;
  const clientSecret = process.env.TWITTER_CLIENT_SECRET || process.env.X_CLIENT_SECRET;
  const redirectUri  = `${appUrl}/api/auth/x/callback`;

  if (!clientId || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.redirect(`${appUrl}/auth/login?error=x_config_missing`);
  }

  try {
    // Exchange code for token
    const tokenHeaders: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    if (clientSecret) {
      tokenHeaders.Authorization = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;
    }

    const tokenBody = new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
      ...(clientSecret ? {} : { client_id: clientId }),
    });

    const tokenRes = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: tokenHeaders,
      body: tokenBody,
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('X token error:', tokenData);
      return NextResponse.redirect(`${appUrl}/auth/login?error=x_token_failed`);
    }

    // Get X user info
    const userRes = await fetch('https://api.twitter.com/2/users/me?user.fields=name,username,profile_image_url', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userRes.json();
    const xUser = userData.data;

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

    // Check if user exists (fast, no full-user scan)
    const { data: userByEmail, error: byEmailErr } = await supabase.auth.admin.getUserByEmail(proxyEmail);
    if (byEmailErr) {
      console.error('Get user by email error:', byEmailErr);
    }
    const existingUser = userByEmail?.user || null;

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

    }

    const profilePayload = {
      id: userId,
      username: xUser.username,
      display_name: displayName,
      avatar_url: xUser.profile_image_url?.replace('_normal', '_400x400') || '',
      twitter_handle: handle,
      referral_code: 'CCH-' + userId.substring(0, 6).toUpperCase(),
    };

    // Always keep profile data in sync with latest X AVI + handle.
    await supabase.from('profiles').upsert(profilePayload, { onConflict: 'id' });

    // Store X OAuth tokens for backend calls
    const expiresAt = tokenData.expires_in ? new Date(Date.now() + Number(tokenData.expires_in) * 1000).toISOString() : null;
    await supabase.from('x_oauth_tokens').upsert({
      user_id: userId,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || null,
      token_type: tokenData.token_type || 'bearer',
      scope: tokenData.scope || null,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    const finalRedirectTo = `${appUrl}${redirectTo}`;

    const { data: sessionData, error: sessionErr } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: proxyEmail,
      options: { redirectTo: finalRedirectTo },
    });

    if (sessionErr) {
      console.error('Session error:', sessionErr);
      return NextResponse.redirect(`${appUrl}/auth/login?error=x_session_failed`);
    }

    const confirmUrl = sessionData?.properties?.action_link;
    if (!confirmUrl) {
      return NextResponse.redirect(`${appUrl}/auth/login?error=x_session_failed`);
    }

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
