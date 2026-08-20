import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE,
  getClearSessionCookieOptions,
} from "@/lib/auth-session";
import { destroySession, getSessionUser, getSessionUserId } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  const userId = await getSessionUserId();

  const response = NextResponse.redirect(new URL("/login", request.url));

  if (!user && userId) {
    await destroySession();
    response.cookies.set(AUTH_COOKIE, "", getClearSessionCookieOptions());
  }

  return response;
}
