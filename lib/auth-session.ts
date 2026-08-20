import { jwtVerify, SignJWT } from "jose";
import { NextResponse } from "next/server";
import {
  getLocaleCookieOptions,
  LOCALE_COOKIE,
} from "@/lib/locale-cookie";

export const AUTH_COOKIE = "creator_session";
export const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days

export function getAuthSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
}

export async function verifySessionToken(token: string) {
  return jwtVerify(token, getAuthSecret());
}

export async function createSessionToken(userId: string): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getAuthSecret());
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: SESSION_DURATION,
    path: "/",
  };
}

export function getClearSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 0,
    path: "/",
  };
}

export async function createAuthenticatedResponse(
  userId: string,
  locale: string
): Promise<NextResponse> {
  const token = await createSessionToken(userId);
  const response = NextResponse.json({ success: true });
  response.cookies.set(AUTH_COOKIE, token, getSessionCookieOptions());
  response.cookies.set(LOCALE_COOKIE, locale, getLocaleCookieOptions());
  return response;
}
