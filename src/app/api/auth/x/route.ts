import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { generateCodeChallenge, generateCodeVerifier } from '@xdevplatform/xdk';

function getSafeRedirect(redirectTo?: string): string {
  if (!redirectTo) return '/feed';
  if (redirectTo.startsWith('/') && !redirectTo.startsWith('//')) return redirectTo;
  return '/feed';
}

export async function GET(request: NextRequest) {
  const clientId = process.env.TWITTER_CLIENT_ID || process.env.X_CLIENT_ID;
  const clientSecret = process.env.TWITTER_CLIENT_SECRET || process.env.X_CLIENT_SECRET;
  const origin = request.nextUrl.origin;
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || origin).replace(/\/+$/, '');
  const redirectUri = `${appUrl}/api/auth/x/callback`;
  const redirectTo = getSafeRedirect(request.nextUrl.searchParams.get('redirectTo') || undefined);

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${appUrl}/auth/login?error=x_config_missing`);
  }

  const state = crypto.randomBytes(16).toString('hex');
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'tweet.read tweet.write users.read dm.read dm.write offline.access',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  const authUrl = `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
  const response = NextResponse.redirect(authUrl);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 600,
    path: '/',
  };

  response.cookies.set('x_code_verifier', codeVerifier, cookieOptions);
  response.cookies.set('x_oauth_state', state, cookieOptions);
  response.cookies.set('x_oauth_redirect_to', redirectTo, cookieOptions);

  return response;
}
