import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication (client handles redirect)
const protectedPaths = ['/dashboard', '/post-job', '/freelance/post'];

/** Minimal middleware — passes through; auth gate is in the client layout. */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get('authToken')?.value;
  // Client-side auth uses localStorage; middleware can't read it.
  // Allow through — dashboard layout handles redirect if unauthenticated.
  if (!token) return NextResponse.next();

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/post-job', '/freelance/post'],
};
