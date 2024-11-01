// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Get the pathname of the request
    const { pathname } = request.nextUrl;

    // Check if the user is accessing the login page
    if (pathname.startsWith('/auth/login')) {
        // If they have a session, redirect to homepage
        const session = request.cookies.get('session');
        if (session) {
            return NextResponse.redirect(new URL('/', request.url));
        }
        return NextResponse.next();
    }

    // Check for protected routes
    if (pathname === '/' || pathname.startsWith('/dashboard')) {
        const session = request.cookies.get('session');
        if (!session) {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
    }

    return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    ],
};