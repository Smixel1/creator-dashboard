"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useLocale, useTranslations } from "@/components/providers/locale-provider";
import {
  SettingsSelectRow,
  settingsSelectTriggerClass,
} from "@/components/settings/settings-select-row";
import type { Locale } from "@/lib/i18n";

const LOCALE_OPTIONS: {
  value: Locale;
  labelKey: "settings.languageRu" | "settings.languageEn";
}[] = [
  { value: "ru", labelKey: "settings.languageRu" },
  { value: "en", labelKey: "settings.languageEn" },
];

export function LanguageSelect() {
  const t = useTranslations();
  const { locale, setLocale, isChangingLocale } = useLocale();

  return (
    <SettingsSelectRow label={t("settings.language")}>
      <Select
        value={locale}
        onValueChange={(value) => value && setLocale(value as Locale)}
        disabled={isChangingLocale}
      >
        <SelectTrigger
          className={settingsSelectTriggerClass}
          aria-label={t("settings.language")}
        >
          {locale === "en" ? t("settings.languageEn") : t("settings.languageRu")}
        </SelectTrigger>
        <SelectContent align="end">
          {LOCALE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {t(option.labelKey)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </SettingsSelectRow>
  );
}
