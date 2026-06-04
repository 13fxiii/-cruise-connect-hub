import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // NEVER run auth middleware on the OAuth callback routes.
  // The PKCE code verifier is stored in cookies — if middleware calls
  // getUser() before exchangeCodeForSession() the verifier gets consumed
  // and the code exchange fails silently.
  // This includes both standard Supabase callback and custom X OAuth callback
  if (pathname.startsWith('/auth/callback') || pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
