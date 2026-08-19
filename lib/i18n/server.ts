import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth";
import { createTranslator, getDictionary, type Locale } from "@/lib/i18n";
import { LOCALE_COOKIE, parseLocale } from "@/lib/locale-cookie";

export async function getServerLocale(): Promise<Locale> {
  const user = await getSessionUser();
  if (user?.locale) {
    return parseLocale(user.locale);
  }

  const cookieStore = await cookies();
  return parseLocale(cookieStore.get(LOCALE_COOKIE)?.value);
}

export async function getServerTranslator() {
  const locale = await getServerLocale();
  return {
    locale,
    t: createTranslator(locale),
    messages: getDictionary(locale),
  };
}
