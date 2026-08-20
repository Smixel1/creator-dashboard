import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { parseLocale, LOCALE_COOKIE } from "@/lib/locale-cookie";
import type { SessionUser } from "@/types";
import {
  AUTH_COOKIE,
  createSessionToken,
  getSessionCookieOptions,
  verifySessionToken,
} from "@/lib/auth-session";

export {
  AUTH_COOKIE,
  createSessionToken,
  getSessionCookieOptions,
} from "@/lib/auth-session";

export async function createSession(userId: string) {
  const token = await createSessionToken(userId);
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, token, getSessionCookieOptions());
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
}

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await verifySessionToken(token);
    return (payload.userId as string) ?? null;
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      instagramUsername: true,
      createdAt: true,
    },
  });

  if (!user) return null;

  const cookieStore = await cookies();
  const locale = parseLocale(cookieStore.get(LOCALE_COOKIE)?.value);

  return {
    ...user,
    locale,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

