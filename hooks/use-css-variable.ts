"use client";

import { useSyncExternalStore } from "react";

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "data-palette"],
  });

  return () => observer.disconnect();
}

function getCssVariable(name: string, fallback: string): string {
  if (typeof window === "undefined") {
    return fallback;
  }

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();

  return value || fallback;
}

/** Reads a CSS custom property from :root (updates on theme/palette change). */
export function useCssVariable(name: string, fallback = ""): string {
  return useSyncExternalStore(
    subscribe,
    () => getCssVariable(name, fallback),
    () => fallback
  );
}
