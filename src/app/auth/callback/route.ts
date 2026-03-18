import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code  = searchParams.get('code');
  const next  = searchParams.get('next') || '/feed';
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // OAuth error — send back to login with message
  if (error) {
    const msg = encodeURIComponent(errorDescription || error);
    return NextResponse.redirect(`${origin}/auth/login?error=${msg}`);
  }

  // PKCE code exchange
  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (!exchangeError) {
      // Successful — go to the intended destination
      const destination = next.startsWith('/') ? `${origin}${next}` : next;
      return NextResponse.redirect(destination);
    }
    const msg = encodeURIComponent(exchangeError.message);
    return NextResponse.redirect(`${origin}/auth/login?error=${msg}`);
  }

  // No code — just go to feed
  return NextResponse.redirect(`${origin}/feed`);
}
