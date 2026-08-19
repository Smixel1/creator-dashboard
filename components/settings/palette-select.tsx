"use client";

import { useSyncExternalStore } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { usePalette } from "@/components/providers/palette-provider";
import { useTranslations } from "@/components/providers/locale-provider";
import {
  SettingsSelectRow,
  settingsSelectTriggerClass,
} from "@/components/settings/settings-select-row";
import type { PaletteValue } from "@/lib/palette";

const PALETTE_OPTIONS: {
  value: PaletteValue;
  labelKey: "settings.paletteCoral" | "settings.paletteBlue";
}[] = [
  { value: "coral", labelKey: "settings.paletteCoral" },
  { value: "blue", labelKey: "settings.paletteBlue" },
];

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function PaletteSelect() {
  const t = useTranslations();
  const { palette, setPalette } = usePalette();
  const mounted = useMounted();

  const label =
    PALETTE_OPTIONS.find((option) => option.value === palette)?.labelKey ??
    "settings.paletteCoral";

  return (
    <SettingsSelectRow
      label={t("settings.palette")}
      description={t("settings.paletteDesc")}
    >
      <Select
        value={mounted ? palette : "coral"}
        onValueChange={(value) => value && setPalette(value as PaletteValue)}
        disabled={!mounted}
      >
        <SelectTrigger
          className={settingsSelectTriggerClass}
          aria-label={t("settings.palette")}
        >
          {mounted ? t(label) : t("settings.paletteCoral")}
        </SelectTrigger>
        <SelectContent align="end">
          {PALETTE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {t(option.labelKey)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </SettingsSelectRow>
  );
}
