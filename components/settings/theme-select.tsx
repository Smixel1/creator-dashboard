"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useTranslations } from "@/components/providers/locale-provider";
import {
  SettingsSelectRow,
  settingsSelectTriggerClass,
} from "@/components/settings/settings-select-row";

type ThemeValue = "light" | "dark";

const THEME_OPTIONS: {
  value: ThemeValue;
  labelKey: "settings.themeLight" | "settings.themeDark";
}[] = [
  { value: "light", labelKey: "settings.themeLight" },
  { value: "dark", labelKey: "settings.themeDark" },
];

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

function normalizeTheme(theme: string | undefined): ThemeValue {
  return theme === "dark" ? "dark" : "light";
}

export function ThemeSelect() {
  const t = useTranslations();
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  const current = normalizeTheme(theme);
  const label =
    THEME_OPTIONS.find((option) => option.value === current)?.labelKey ??
    "settings.themeLight";

  return (
    <SettingsSelectRow
      label={t("settings.theme")}
      description={t("settings.themeDesc")}
    >
      <Select
        value={mounted ? current : "light"}
        onValueChange={(value) => value && setTheme(value)}
        disabled={!mounted}
      >
        <SelectTrigger
          className={settingsSelectTriggerClass}
          aria-label={t("settings.theme")}
        >
          {mounted ? t(label) : t("settings.themeLight")}
        </SelectTrigger>
        <SelectContent align="end">
          {THEME_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {t(option.labelKey)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </SettingsSelectRow>
  );
}
