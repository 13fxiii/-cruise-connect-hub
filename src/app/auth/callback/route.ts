// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code             = searchParams.get('code');
  const error            = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // OAuth returned an error
  if (error) {
    const msg = encodeURIComponent(errorDescription || error);
    return NextResponse.redirect(`${origin}/auth/login?error=${msg}`);
  }

  // Exchange PKCE code for session
  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      // Success — send to feed (or wherever they were going)
      const next = searchParams.get('next') || '/feed';
      const dest = next.startsWith('/') ? `${origin}${next}` : `${origin}/feed`;
      return NextResponse.redirect(dest);
    }

    const msg = encodeURIComponent(exchangeError.message);
    return NextResponse.redirect(`${origin}/auth/login?error=${msg}`);
  }

  // No code or error — just go to feed
  return NextResponse.redirect(`${origin}/feed`);
}
