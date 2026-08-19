"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "@/components/providers/locale-provider";
import { useValidationSchemas } from "@/hooks/use-validation-schemas";
import type { ChangePasswordInput } from "@/lib/validations";

export function ChangePasswordForm() {
  const router = useRouter();
  const t = useTranslations();
  const { changePasswordSchema } = useValidationSchemas();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const resolver = useMemo(
    () => zodResolver(changePasswordSchema),
    [changePasswordSchema]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver,
  });

  async function onSubmit(data: ChangePasswordInput) {
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/settings/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(
          (body as { error?: string }).error ?? t("settings.passwordChangeFailed")
        );
        return;
      }

      reset();
      setSuccess(true);

      if ((body as { reauth?: boolean }).reauth) {
        window.setTimeout(() => {
          router.push("/login");
        }, 1800);
      }
    } catch {
      setError(t("settings.passwordChangeFailed"));
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit(onSubmit)(event);
      }}
      className="px-4 py-4 space-y-4 border-b border-border/20"
    >
      <div>
        <p className="text-sm font-medium text-foreground/90">
          {t("settings.changePassword")}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t("settings.changePasswordDesc")}
        </p>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="currentPassword">{t("settings.currentPassword")}</Label>
          <Input
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            disabled={isSubmitting || success}
            {...register("currentPassword")}
          />
          {errors.currentPassword && (
            <p className="text-xs text-destructive">
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="newPassword">{t("settings.newPassword")}</Label>
          <Input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            disabled={isSubmitting || success}
            {...register("newPassword")}
          />
          {errors.newPassword && (
            <p className="text-xs text-destructive">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">
            {t("settings.confirmPassword")}
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            disabled={isSubmitting || success}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-lg border border-brand-sage/30 bg-brand-sage/10 px-3 py-2 text-sm text-foreground flex items-start gap-2"
        >
          <CheckCircle2 className="h-4 w-4 text-brand-sage shrink-0 mt-0.5" />
          <span>{t("settings.passwordChanged")}</span>
        </div>
      )}

      <Button
        type="submit"
        size="sm"
        disabled={isSubmitting || success}
        className="rounded-full"
      >
        {isSubmitting ? t("common.loading") : t("settings.updatePassword")}
      </Button>
    </form>
  );
}
