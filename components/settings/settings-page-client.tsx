"use client";

import { LanguageSelect } from "@/components/settings/language-select";
import { ThemeSelect } from "@/components/settings/theme-select";
import { PaletteSelect } from "@/components/settings/palette-select";
import { ChangePasswordForm } from "@/components/settings/change-password-form";
import { SettingsSection } from "@/components/settings/settings-section";
import { SettingsRow } from "@/components/settings/settings-ui";
import { useLogout } from "@/hooks/use-logout";
import { useTranslations } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import type { SessionUser } from "@/types";

interface SettingsPageClientProps {
  user: SessionUser;
  isDemoMode: boolean;
  appVersion: string;
}

export function SettingsPageClient({
  user,
  isDemoMode,
  appVersion,
}: SettingsPageClientProps) {
  const t = useTranslations();
  const { logout, isLoggingOut } = useLogout();

  return (
    <div className="content-canvas max-w-2xl stack-section pb-4">
      <header className="pb-4 border-b border-border/25">
        <p className="section-eyebrow mb-1">{t("settings.params")}</p>
        <h1 className="editorial-heading text-2xl sm:text-3xl font-semibold">
          {t("settings.title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-lg">
          {t("settings.subtitleApify")}
        </p>
      </header>

      <SettingsSection title={t("settings.account")}>
        <SettingsRow label={t("common.email")} value={user.email} />
        <SettingsRow
          label={t("settings.profile")}
          value={user.name}
          hint={t("settings.editInProfile")}
          href="/profile"
          actionLabel={t("settings.openProfile")}
        />
        <ChangePasswordForm />
      </SettingsSection>

      <SettingsSection title={t("settings.appearance")}>
        <div className="divide-y divide-border/20">
          <LanguageSelect />
          <PaletteSelect />
          <ThemeSelect />
        </div>
      </SettingsSection>

      <SettingsSection title={t("settings.reelsData")}>
        <SettingsRow
          label={t("settings.dataSource")}
          value={
            isDemoMode ? t("settings.demoMode") : t("settings.apifyActive")
          }
          hint={
            isDemoMode ? t("settings.demoModeHint") : t("settings.apifyActiveHint")
          }
        />
      </SettingsSection>

      <SettingsSection title={t("settings.about")}>
        <SettingsRow
          label={t("settings.version")}
          value={appVersion}
          hint={t("settings.changelogHint")}
        />
      </SettingsSection>

      <SettingsSection
        title={t("settings.dangerZone")}
        variant="danger"
      >
        <div className="px-4 py-4">
          <p className="text-sm text-muted-foreground mb-3">
            {t("settings.logoutDesc")}
          </p>
          <Button
            variant="destructive"
            size="sm"
            onClick={logout}
            disabled={isLoggingOut}
            className="rounded-full"
          >
            {isLoggingOut ? t("nav.loggingOut") : t("nav.logout")}
          </Button>
        </div>
      </SettingsSection>
    </div>
  );
}
