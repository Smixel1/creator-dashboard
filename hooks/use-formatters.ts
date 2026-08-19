"use client";

import type { Locale } from "@/lib/i18n";
import { useLocale } from "@/components/providers/locale-provider";
import {
  formatDate as formatDateBase,
  formatNumber as formatNumberBase,
} from "@/lib/format";

export function useFormatters() {
  const { locale } = useLocale();

  return {
    locale,
    formatNumber: (value: number) => formatNumberBase(value, locale),
    formatDate: (date: string | Date) => formatDateBase(date, locale),
  };
}

export function useLocaleValue(): Locale {
  return useLocale().locale;
}
