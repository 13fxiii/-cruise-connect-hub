// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code  = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Error from X
  if (error) {
    return NextResponse.redirect(`${origin}/auth/login?error=x_denied`);
  }

  // Validate state
  const storedState    = request.cookies.get('x_oauth_state')?.value;
  const codeVerifier   = request.cookies.get('x_code_verifier')?.value;

  if (!code || !state || state !== storedState || !codeVerifier) {
    return NextResponse.redirect(`${origin}/auth/login?error=x_invalid_state`);
  }

  const clientId     = process.env.TWITTER_CLIENT_ID     || 'OTZFOG85a29YZ1RwdTJteTIxQlI6MTpjaQ';
  const clientSecret = process.env.TWITTER_CLIENT_SECRET || '';
  const redirectUri  = `${origin}/api/auth/x/callback`;

  try {
    // Exchange code for token
    const tokenRes = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('X token error:', tokenData);
      return NextResponse.redirect(`${origin}/auth/login?error=x_token_failed`);
    }

    // Get X user info
    const userRes = await fetch('https://api.twitter.com/2/users/me?user.fields=name,username,profile_image_url', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userRes.json();
    const xUser = userData.data;

    if (!xUser?.id) {
      return NextResponse.redirect(`${origin}/auth/login?error=x_user_failed`);
    }

    // Use Supabase admin to create/get user
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Use X id as email proxy (no real email from X OAuth 2.0 without special permissions)
    const proxyEmail = `x_${xUser.id}@cruise-connect.app`;
    const displayName = xUser.name || xUser.username;
    const handle = `@${xUser.username}`;

    // Upsert user in Supabase auth
    let userId: string;

    // Check if user exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === proxyEmail);

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create new user
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
        return NextResponse.redirect(`${origin}/auth/login?error=x_create_failed`);
      }
      userId = newUser.user.id;

      // Upsert profile
      await supabase.from('profiles').upsert({
        id: userId,
        username: xUser.username,
        display_name: displayName,
        avatar_url: xUser.profile_image_url?.replace('_normal', '_400x400') || '',
        twitter_handle: handle,
        referral_code: 'CCH-' + userId.substring(0, 6).toUpperCase(),
      }, { onConflict: 'id' });
    }

    // Generate magic link session for user
    const { data: sessionData, error: sessionErr } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: proxyEmail,
    });

    if (sessionErr || !sessionData?.properties?.hashed_token) {
      console.error('Session error:', sessionErr);
      return NextResponse.redirect(`${origin}/auth/login?error=x_session_failed`);
    }

    // Redirect to Supabase confirm URL which sets session cookies
    const confirmUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/verify?token=${sessionData.properties.hashed_token}&type=magiclink&redirect_to=${origin}/feed`;

    // Clear PKCE cookies
    const response = NextResponse.redirect(confirmUrl);
    response.cookies.delete('x_code_verifier');
    response.cookies.delete('x_oauth_state');
    return response;

  } catch (err) {
    console.error('X OAuth callback error:', err);
    return NextResponse.redirect(`${origin}/auth/login?error=x_unknown`);
  }
}
