import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const redirectToParam = searchParams.get('redirectTo');

  if (error) {
    const msg = encodeURIComponent(errorDescription || error);
    return NextResponse.redirect(`${origin}/auth/login?error=${msg}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/feed`);
  }

  const supabase = await createClient();
  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    const msg = encodeURIComponent(exchangeError.message);
    return NextResponse.redirect(`${origin}/auth/login?error=${msg}`);
  }

  if (!data?.user) {
    return NextResponse.redirect(`${origin}/feed`);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, username')
    .eq('id', data.user.id)
    .maybeSingle();

  const isNewUser = !profile || !profile.display_name || !profile.username;
  const safeRedirect =
    redirectToParam && redirectToParam.startsWith('/') && !redirectToParam.startsWith('//')
      ? redirectToParam
      : null;

  const destination = isNewUser ? `${origin}/onboarding` : `${origin}${safeRedirect || '/feed'}`;
  return NextResponse.redirect(destination);
}
