import { NextResponse } from "next/server";
import {
  AUTH_COOKIE,
  getClearSessionCookieOptions,
} from "@/lib/auth-session";
import { destroySession } from "@/lib/auth";

export async function POST() {
  await destroySession();
  const response = NextResponse.json({ success: true });
  response.cookies.set(AUTH_COOKIE, "", getClearSessionCookieOptions());
  return response;
}
