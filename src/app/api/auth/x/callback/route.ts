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

    // Use listUsers instead of getUserByEmail as per Genspark's advice
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    const existingUser = users?.find(u => u.email === proxyEmail);
    let userId = existingUser?.id;

    let isNewUser = false;
    if (!userId) {
      isNewUser = true;
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
          onboarding_done: false,
        },
      });

      if (createErr || !created?.user?.id) {
        console.error('Create user error:', createErr);
        return NextResponse.redirect(`${appUrl}/auth/login?error=x_create_failed`);
      }
      userId = created.user.id;
    } else {
      // For existing users, check if they finished onboarding
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_done')
        .eq('id', userId)
        .maybeSingle();
      
      if (!profile?.onboarding_done) {
        isNewUser = true;
      }
    }

    // Ensure profile exists with onboarding_done set correctly
    // This handles both new users and returning users who haven't completed onboarding
    try {
      await supabase.from('profiles').upsert(
        {
          id: userId,
          username: xUser.username,
          display_name: displayName,
          avatar_url: avatarUrl,
          x_username: xUser.username,
          x_display_name: displayName,
          x_avatar_url: avatarUrl,
          twitter_handle: `@${xUser.username}`,
          onboarding_done: false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
    } catch (profileErr) {
      console.warn('Profile upsert error (may be schema mismatch):', profileErr);
      // Fallback: try with minimal columns
      try {
        await supabase.from('profiles').upsert(
          {
            id: userId,
            onboarding_done: false,
          },
          { onConflict: 'id' }
        );
      } catch (fallbackErr) {
        console.error('Fallback profile upsert failed:', fallbackErr);
        // Continue anyway - the profile may have been auto-created by trigger
      }
    }

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

    // NEW: Use admin.createSession to establish a direct session instead of magic link
    const { data: sessionData, error: sessionErr } = await supabase.auth.admin.createSession({
      user_id: userId,
    });

    if (sessionErr || !sessionData?.session) {
      console.error('Session creation error:', sessionErr);
      // Fallback to magic link if direct session fails
      const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: proxyEmail,
        options: { redirectTo: `${appUrl}${isNewUser ? '/onboarding' : redirectTo}` },
      });

      if (linkErr || !linkData?.properties?.action_link) {
        console.error('Fallback magic link generation error:', linkErr);
        return NextResponse.redirect(`${appUrl}/auth/login?error=x_session_failed`);
      }

      const response = NextResponse.redirect(linkData.properties.action_link);
      response.cookies.delete('x_code_verifier');
      response.cookies.delete('x_oauth_state');
      response.cookies.delete('x_oauth_redirect_to');
      return response;
    }

    // Set the session cookies directly
    const response = NextResponse.redirect(
      `${appUrl}${isNewUser ? '/onboarding' : redirectTo}`
    );

    // Set Supabase session cookies
    const { access_token, refresh_token } = sessionData.session;
    response.cookies.set('sb-access-token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    });
    response.cookies.set('sb-refresh-token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    });

    response.cookies.delete('x_code_verifier');
    response.cookies.delete('x_oauth_state');
    response.cookies.delete('x_oauth_redirect_to');
    return response;
  } catch (err) {
    console.error('X OAuth callback error:', err);
    return NextResponse.redirect(`${appUrl}/auth/login?error=x_unknown`);
  }
}
