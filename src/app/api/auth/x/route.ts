// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { OAuth2, generateCodeVerifier, generateCodeChallenge } from '@xdevplatform/xdk';
import crypto from 'crypto';

function getSafeRedirect(redirectTo?: string): string {
  if (!redirectTo) return '/feed';
  if (redirectTo.startsWith('/') && !redirectTo.startsWith('//')) return redirectTo;
  return '/feed';
}

export async function GET(request: NextRequest) {
  const clientId = process.env.TWITTER_CLIENT_ID || process.env.X_CLIENT_ID;
  const clientId = process.env.TWITTER_CLIENT_ID;
  const clientSecret = process.env.TWITTER_CLIENT_SECRET;
  const origin = request.nextUrl.origin;
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || origin).replace(/\/+$/, '');
  const redirectUri = `${appUrl}/api/auth/x/callback`;
  const redirectTo = getSafeRedirect(request.nextUrl.searchParams.get('redirectTo') || undefined);

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${appUrl}/auth/login?error=x_config_missing`);
  }

  // Use XDK OAuth2
  const oauth2Config = {
    clientId,
    clientSecret,
    redirectUri,
    scope: ['tweet.read', 'users.read', 'offline.access'],
  };

  const oauth2 = new OAuth2(oauth2Config);

  const state = crypto.randomBytes(16).toString('hex');
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  oauth2.setPkceParameters(codeVerifier, codeChallenge);

  // Build X OAuth 2.0 URL
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    // Includes permissions needed for posting, polls, and DMs from the app.
    scope: 'tweet.read tweet.write users.read dm.read dm.write offline.access',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  const authUrl = `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
  const authUrl = await oauth2.getAuthorizationUrl(state);

  // Store verifier + state + redirect target in cookie (short-lived)
  const response = NextResponse.redirect(authUrl);
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  };
  response.cookies.set('x_code_verifier', codeVerifier, cookieOptions);
  response.cookies.set('x_oauth_state', state, cookieOptions);
  response.cookies.set('x_oauth_redirect_to', redirectTo, cookieOptions);

  return response;
}
