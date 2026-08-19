import type { Locale } from "@/lib/i18n/types";
import { DEFAULT_LOCALE, LOCALES } from "@/lib/i18n/types";

export const LOCALE_COOKIE = "creator_locale";

export function parseLocale(value: string | null | undefined): Locale {
  if (value && LOCALES.includes(value as Locale)) {
    return value as Locale;
  }
  return DEFAULT_LOCALE;
}

export function getLocaleCookieOptions() {
  return {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  };
}
