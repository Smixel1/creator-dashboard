export const PALETTE_STORAGE_KEY = "creator-palette";

/** Inline blocking script injected during SSR (see PaletteProvider). */
export const PALETTE_INIT_SCRIPT = `(function(){try{var p=localStorage.getItem('${PALETTE_STORAGE_KEY}');document.documentElement.setAttribute('data-palette',p==='blue'?'blue':'coral')}catch(e){}})();`;

export type PaletteValue = "coral" | "blue";

export const DEFAULT_PALETTE: PaletteValue = "coral";

export function normalizePalette(value: string | null | undefined): PaletteValue {
  return value === "blue" ? "blue" : "coral";
}
