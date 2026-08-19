export const PALETTE_STORAGE_KEY = "creator-palette";

export type PaletteValue = "coral" | "blue";

export const DEFAULT_PALETTE: PaletteValue = "coral";

export function normalizePalette(value: string | null | undefined): PaletteValue {
  return value === "blue" ? "blue" : "coral";
}
