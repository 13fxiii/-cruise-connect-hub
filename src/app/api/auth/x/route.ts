// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Generate PKCE code verifier + challenge
function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString('base64url');
}

function generateCodeChallenge(verifier: string): string {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

function getSafeRedirect(redirectTo?: string): string {
  if (!redirectTo) return '/feed';
  if (redirectTo.startsWith('/') && !redirectTo.startsWith('//')) return redirectTo;
  return '/feed';
}

export async function GET(request: NextRequest) {
  const clientId = process.env.TWITTER_CLIENT_ID;
  const origin = request.nextUrl.origin;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin;
  const redirectUri = `${appUrl}/api/auth/x/callback`;
  const redirectTo = getSafeRedirect(request.nextUrl.searchParams.get('redirectTo') || undefined);

  if (!clientId) {
    return NextResponse.redirect(`${appUrl}/auth/login?error=x_config_missing`);
  }

  // PKCE
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = crypto.randomBytes(16).toString('hex');

  // Build X OAuth 2.0 URL
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'tweet.read users.read offline.access',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  const authUrl = `https://twitter.com/i/oauth2/authorize?${params.toString()}`;

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
