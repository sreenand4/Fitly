import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    // Get the current path
    const path = request.nextUrl.pathname;

    // Get user type from cookies
    const userType = request.cookies.get('userType')?.value;

    // Public routes that don't need authentication
    if (path === '/' || path === '/auth') {
        return NextResponse.next();
    }

    // If no user type is set, redirect to auth
    if (!userType) {
        return NextResponse.redirect(new URL('/auth', request.url));
    }

    // Handle retailer routes
    if (path.startsWith('/retailer/')) {
        if (userType !== 'retailer') {
            return NextResponse.redirect(new URL('/user/dashboard', request.url));
        }
    }

    // Handle user routes
    if (path.startsWith('/user/')) {
        if (userType === 'retailer') {
            return NextResponse.redirect(new URL('/retailer/dashboard', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/user/:path*',
        '/retailer/:path*',
        '/fittingroom/:path*',
        '/auth'
    ]
};