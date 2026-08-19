"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  DEFAULT_PALETTE,
  normalizePalette,
  PALETTE_STORAGE_KEY,
  type PaletteValue,
} from "@/lib/palette";

interface PaletteContextValue {
  palette: PaletteValue;
  setPalette: (palette: PaletteValue) => void;
}

const PaletteContext = createContext<PaletteContextValue | null>(null);

const paletteListeners = new Set<() => void>();

function subscribePalette(onStoreChange: () => void) {
  paletteListeners.add(onStoreChange);
  return () => paletteListeners.delete(onStoreChange);
}

function emitPaletteChange() {
  paletteListeners.forEach((listener) => listener());
}

function readPaletteSnapshot(): PaletteValue {
  if (typeof window === "undefined") {
    return DEFAULT_PALETTE;
  }

  return normalizePalette(
    document.documentElement.getAttribute("data-palette") ??
      localStorage.getItem(PALETTE_STORAGE_KEY)
  );
}

function applyPalette(palette: PaletteValue) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.setAttribute("data-palette", palette);
}

function persistPalette(palette: PaletteValue) {
  applyPalette(palette);

  try {
    localStorage.setItem(PALETTE_STORAGE_KEY, palette);
  } catch {
    /* ignore quota / private mode */
  }

  emitPaletteChange();
}

interface PaletteProviderProps {
  children: ReactNode;
}

export function PaletteProvider({ children }: PaletteProviderProps) {
  const palette = useSyncExternalStore(
    subscribePalette,
    readPaletteSnapshot,
    () => DEFAULT_PALETTE
  );

  const setPalette = useCallback((next: PaletteValue) => {
    persistPalette(next);
  }, []);

  const value = useMemo(
    () => ({ palette, setPalette }),
    [palette, setPalette]
  );

  return (
    <PaletteContext.Provider value={value}>{children}</PaletteContext.Provider>
  );
}

export function usePalette() {
  const context = useContext(PaletteContext);
  if (!context) {
    throw new Error("usePalette must be used within PaletteProvider");
  }
  return context;
}
