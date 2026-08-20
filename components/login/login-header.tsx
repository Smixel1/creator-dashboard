"use client";

import { useTranslations } from "@/components/providers/locale-provider";
import { AuthPageHeader } from "@/components/login/auth-page-header";

export function LoginHeader() {
  const t = useTranslations();

  return (
    <AuthPageHeader
      eyebrow={t("login.welcomeBack")}
      title={t("login.welcome")}
      description={t("login.signInDesc")}
      showMobileBrand
    />
  );
}
