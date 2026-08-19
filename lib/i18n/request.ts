import { cookies } from "next/headers";
import { createTranslator, type Locale } from "@/lib/i18n";
import { LOCALE_COOKIE, parseLocale } from "@/lib/locale-cookie";

export async function getRequestLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return parseLocale(cookieStore.get(LOCALE_COOKIE)?.value);
}

export async function getRequestTranslator() {
  const locale = await getRequestLocale();
  return { locale, t: createTranslator(locale) };
}
