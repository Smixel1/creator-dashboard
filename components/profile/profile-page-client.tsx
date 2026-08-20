"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "@/components/providers/locale-provider";
import { useValidationSchemas } from "@/hooks/use-validation-schemas";
import type { ProfileInput } from "@/lib/validations";
import type { ProfileStats, SessionUser } from "@/types";
import { useFormatters } from "@/hooks/use-formatters";
import { AvatarUpload } from "@/components/profile/avatar-upload";
import { InlineStatsRow } from "@/components/shared/inline-stats-row";
import { ReelCard } from "@/components/reels/reel-card";
import { SettingsRow } from "@/components/settings/settings-ui";
import type { ReelWithEngagement } from "@/types";

interface ProfilePageClientProps {
  user: SessionUser;
  stats: ProfileStats;
  recentReels: ReelWithEngagement[];
}

export function ProfilePageClient({ user, stats, recentReels }: ProfilePageClientProps) {
  const t = useTranslations();
  const { formatDate, formatNumber } = useFormatters();
  const { profileSchema } = useValidationSchemas();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolver = useMemo(() => zodResolver(profileSchema), [profileSchema]);

  const averageViews =
    stats.totalReels > 0
      ? Math.round(stats.totalViews / stats.totalReels)
      : 0;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver,
    defaultValues: {
      name: user.name,
      instagramUsername: user.instagramUsername ?? "",
    },
  });

  function handleCancel() {
    reset({
      name: user.name,
      instagramUsername: user.instagramUsername ?? "",
    });
    setEditing(false);
    setError(null);
    setSaved(false);
  }

  async function onSubmit(data: ProfileInput) {
    setError(null);
    setSaved(false);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json();
      setError(body.error ?? t("profile.updateError"));
      return;
    }

    setEditing(false);
    setSaved(true);
    window.location.reload();
  }

  return (
    <div className="content-canvas stack-section pb-4">
      <header className="pb-4 border-b border-border/25 animate-enter">
        <p className="section-eyebrow mb-1">{t("profile.authorLabel")}</p>
        <h1 className="editorial-heading text-2xl sm:text-3xl font-semibold">
          {t("profile.title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-xl">
          {t("profile.subtitle")}
        </p>
      </header>

      <section className="creator-panel flex flex-col items-center sm:flex-row gap-6 sm:gap-10 animate-enter-delay-1 text-center sm:text-left">
        <AvatarUpload name={user.name} avatarUrl={user.avatarUrl} />
        <div className="flex-1 space-y-3 min-w-0">
          <div>
            <h2 className="editorial-heading text-2xl sm:text-3xl font-semibold">
              {user.name}
            </h2>
            {user.instagramUsername && (
              <p className="text-sm text-muted-foreground mt-1">
                @{user.instagramUsername}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("profile.memberSince", { date: formatDate(user.createdAt) })}
          </p>
        </div>
      </section>

      <section className="open-section py-2">
        <p className="section-eyebrow mb-3">{t("profile.statsLabel")}</p>
        <InlineStatsRow
          size="compact"
          items={[
            { label: t("common.reels"), value: String(stats.totalReels) },
            {
              label: t("common.views"),
              value: formatNumber(stats.totalViews),
            },
            {
              label: t("common.averageViews"),
              value: formatNumber(averageViews),
            },
          ]}
        />
      </section>

      {recentReels.length > 0 && (
        <section className="open-section pt-6 border-t border-border/25">
          <div className="mb-4">
            <p className="section-eyebrow mb-1">{t("profile.recentContent")}</p>
            <p className="text-sm text-muted-foreground">
              {t("profile.recentContentDesc")}
            </p>
          </div>
          <div className="editorial-grid">
            {recentReels.map((reel) => (
              <ReelCard key={reel.id} reel={reel} showCaption />
            ))}
          </div>
        </section>
      )}

      <section className="open-section pt-6 border-t border-border/25 max-w-lg space-y-4">
        <h2 className="section-title">{t("profile.profileData")}</h2>
        {!editing ? (
          <div className="space-y-3">
            <SettingsRow label={t("common.name")} value={user.name} />
            <SettingsRow
              label={t("profile.publicUsernameLabel")}
              value={
                user.instagramUsername
                  ? `@${user.instagramUsername}`
                  : t("common.notSpecified")
              }
              hint={t("profile.publicUsernameHint")}
            />
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
              >
                {t("common.edit")}
              </Button>
              <Link
                href="/settings"
                className="inline-flex items-center justify-center h-8 px-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("profile.accountSettings")}
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("common.name")}</Label>
              <Input id="name" {...register("name")} className="h-9" />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagramUsername">
                {t("profile.publicUsernameLabel")}
              </Label>
              <Input
                id="instagramUsername"
                placeholder={t("profile.usernamePlaceholder")}
                className="h-9"
                {...register("instagramUsername")}
              />
              <p className="text-xs text-muted-foreground">
                {t("profile.publicUsernameHint")}
              </p>
              {errors.instagramUsername && (
                <p className="text-sm text-destructive">
                  {errors.instagramUsername.message}
                </p>
              )}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {saved && (
              <p className="text-sm text-brand-sage">{t("profile.updateSuccess")}</p>
            )}
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {isSubmitting ? t("common.saving") : t("common.save")}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
              >
                {t("common.cancel")}
              </Button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
