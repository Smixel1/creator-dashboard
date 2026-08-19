import { en } from "./en";
import { ru } from "./ru";
import type { DotTranslationKey, Locale, Messages, Translator } from "./types";
import { DEFAULT_LOCALE } from "./types";

export type { DotTranslationKey, Locale, Messages, Translator } from "./types";
export { DEFAULT_LOCALE, LOCALES } from "./types";

const dictionaries: Record<Locale, Messages> = { ru, en };

export function getDictionary(locale: Locale): Messages {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

function resolvePath(obj: Record<string, unknown>, path: string): string | undefined {
  const value = path.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);

  return typeof value === "string" ? value : undefined;
}

export function createTranslator(locale: Locale): Translator {
  const dict = getDictionary(locale) as unknown as Record<string, unknown>;

  return function t(key: DotTranslationKey, params?: Record<string, string | number>) {
    let value = resolvePath(dict, key) ?? key;

    if (params) {
      for (const [paramKey, paramValue] of Object.entries(params)) {
        value = value.replace(
          new RegExp(`\\{${paramKey}\\}`, "g"),
          String(paramValue)
        );
      }
    }

    return value;
  };
}
