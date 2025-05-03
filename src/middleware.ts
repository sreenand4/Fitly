import { NextResponse } from "next/server";

export async function middleware(request: any) {
    return NextResponse.next();
}

export const config = {
    matcher: ["/fittingroom/:path*"],
}; 