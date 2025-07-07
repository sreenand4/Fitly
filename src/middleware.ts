import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    // Allow access to all routes
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/user/:path*',
        '/retailer/:path*',
        '/fittingroom/:path*',
        '/upload/:path*',
        '/auth'
    ]
};