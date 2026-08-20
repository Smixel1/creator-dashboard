import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  AUTH_COOKIE,
  getClearSessionCookieOptions,
  verifySessionToken,
} from "@/lib/auth-session";

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/privacy",
  "/terms",
  "/data-deletion",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/instagram/callback",
];

function redirectToLogin(request: NextRequest, clearCookie = false) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  if (clearCookie) {
    response.cookies.set(AUTH_COOKIE, "", getClearSessionCookieOptions());
  }
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/uploads/") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/icon")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) {
    return redirectToLogin(request);
  }

  try {
    await verifySessionToken(token);
    return NextResponse.next();
  } catch {
    return redirectToLogin(request, true);
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.png$|.*\\.svg$).*)"],
};
