import type { Locale, Translator } from "@/lib/i18n";
import { DEFAULT_LOCALE } from "@/lib/i18n";

export function getLocaleTag(locale: Locale = DEFAULT_LOCALE): string {
  return locale === "en" ? "en-US" : "ru-RU";
}

export function formatNumber(
  value: number,
  locale: Locale = DEFAULT_LOCALE
): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return value.toLocaleString(getLocaleTag(locale));
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatEngagementRate(
  views: number,
  rate: number,
  insufficientLabel: string
): string {
  if (views === 0) return insufficientLabel;
  return formatPercent(rate);
}

export function calcEngagementRate(
  views: number,
  likes: number,
  comments: number
): number {
  if (views === 0) return 0;
  return ((likes + comments) / views) * 100;
}

export function formatDate(
  date: string | Date,
  locale: Locale = DEFAULT_LOCALE
): string {
  return new Intl.DateTimeFormat(getLocaleTag(locale), {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatChartAxisDate(
  isoDate: string,
  locale: Locale = DEFAULT_LOCALE
): string {
  return new Intl.DateTimeFormat(getLocaleTag(locale), {
    month: "short",
    day: "numeric",
  }).format(new Date(isoDate));
}

export function getGreeting(name: string, t: Translator): string {
  const firstName = name.split(" ")[0];
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return t("dashboard.greetingMorning", { name: firstName });
  }
  if (hour >= 12 && hour < 18) {
    return t("dashboard.greetingAfternoon", { name: firstName });
  }
  if (hour >= 18 && hour < 23) {
    return t("dashboard.greetingEvening", { name: firstName });
  }
  return t("dashboard.greetingNight", { name: firstName });
}

export function cnChange(value: number | undefined): string | null {
  if (value === undefined) return null;
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}
