"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  createTranslator,
  getDictionary,
  type DotTranslationKey,
  type Locale,
  type Messages,
} from "@/lib/i18n";

interface LocaleContextValue {
  locale: Locale;
  messages: Messages;
  t: (key: DotTranslationKey, params?: Record<string, string | number>) => string;
  setLocale: (locale: Locale) => Promise<void>;
  isChangingLocale: boolean;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

interface LocaleProviderProps {
  children: ReactNode;
  initialLocale: Locale;
}

export function LocaleProvider({
  children,
  initialLocale,
}: LocaleProviderProps) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [isChangingLocale, setIsChangingLocale] = useState(false);

  const messages = useMemo(() => getDictionary(locale), [locale]);
  const t = useMemo(() => createTranslator(locale), [locale]);

  useEffect(() => {
    document.documentElement.lang = locale === "en" ? "en" : "ru";
  }, [locale]);

  const setLocale = useCallback(
    async (nextLocale: Locale) => {
      if (nextLocale === locale) return;
      setIsChangingLocale(true);

      try {
        const res = await fetch("/api/settings/locale", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locale: nextLocale }),
          credentials: "same-origin",
        });

        if (!res.ok) {
          throw new Error("Failed to update locale");
        }

        setLocaleState(nextLocale);
        router.refresh();
      } finally {
        setIsChangingLocale(false);
      }
    },
    [locale, router]
  );

  const value = useMemo(
    () => ({ locale, messages, t, setLocale, isChangingLocale }),
    [locale, messages, t, setLocale, isChangingLocale]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return context;
}

export function useTranslations() {
  return useLocale().t;
}
