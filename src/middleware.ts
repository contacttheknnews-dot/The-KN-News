import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Must match src/lib/auth.ts — AUTH_SECRET is required in every environment;
// a public fallback would let anyone forge an admin session token.
if (!process.env.AUTH_SECRET) {
  throw new Error(
    "AUTH_SECRET is not set. Generate one with `openssl rand -base64 32` and add it to your environment."
  );
}
const secret = new TextEncoder().encode(process.env.AUTH_SECRET);

// Protect every /admin route except the login page.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin") || pathname === "/admin/login") {
    return NextResponse.next();
  }
  const token = request.cookies.get("kn_session")?.value;
  if (token) {
    try {
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch {
      // fall through to redirect
    }
  }
  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
