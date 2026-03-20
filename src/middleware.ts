import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // NEVER run auth middleware on the OAuth callback route.
  // The PKCE code verifier is stored in cookies — if middleware calls
  // getUser() before exchangeCodeForSession() the verifier gets consumed
  // and the code exchange fails silently.
  if (pathname.startsWith('/auth/callback')) {
    return NextResponse.next();
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
