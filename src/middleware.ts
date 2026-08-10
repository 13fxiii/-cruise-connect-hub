import { type NextRequest, NextResponse } from 'next/server';

// BCH authentication is handled by AppDeploy's auth client/server middleware.
// Keep Next.js middleware lightweight so legacy Supabase session refresh logic
// cannot consume OAuth cookies or interfere with AppDeploy persistent sessions.
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
