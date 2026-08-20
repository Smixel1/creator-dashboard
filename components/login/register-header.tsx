"use client";

import { useTranslations } from "@/components/providers/locale-provider";
import { AuthPageHeader } from "@/components/login/auth-page-header";

export function RegisterHeader() {
  const t = useTranslations();

  return (
    <AuthPageHeader
      eyebrow={t("register.title")}
      title={t("register.title")}
      description={t("register.desc")}
    />
  );
}
