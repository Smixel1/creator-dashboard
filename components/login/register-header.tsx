"use client";

import { useTranslations } from "@/components/providers/locale-provider";

export function RegisterHeader() {
  const t = useTranslations();

  return (
    <div className="mb-8 space-y-2 text-center lg:text-left">
      <p className="section-eyebrow">{t("register.title")}</p>
      <h1 className="editorial-heading text-3xl font-semibold tracking-tight">
        {t("register.title")}
      </h1>
      <p className="text-sm text-muted-foreground">{t("register.desc")}</p>
    </div>
  );
}
