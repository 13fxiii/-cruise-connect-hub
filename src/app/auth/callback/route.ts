// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code             = searchParams.get('code');
  const error            = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    const msg = encodeURIComponent(errorDescription || error);
    return NextResponse.redirect(`${origin}/auth/login?error=${msg}`);
  }

  if (code) {
    const supabase = await createClient();
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError && data?.user) {
      // Check if this user has completed onboarding (has a display_name set)
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, username')
        .eq('id', data.user.id)
        .single();

      // New user = no profile or no display_name → send to onboarding
      const isNewUser = !profile || !profile.display_name;
      const dest = isNewUser ? `${origin}/onboarding` : `${origin}/feed`;
      return NextResponse.redirect(dest);
    }

    const msg = encodeURIComponent(exchangeError?.message || 'Auth error');
    return NextResponse.redirect(`${origin}/auth/login?error=${msg}`);
  }

  return NextResponse.redirect(`${origin}/feed`);
}
