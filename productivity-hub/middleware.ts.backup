import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    const isLoggedIn = !!token;
    const isOnDashboard = request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/apps');

    if (isOnDashboard && !isLoggedIn) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (request.nextUrl.pathname === '/login' && isLoggedIn) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/apps/:path*', '/login'],
};
