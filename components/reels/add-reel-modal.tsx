"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "@/components/providers/locale-provider";
import { useValidationSchemas } from "@/hooks/use-validation-schemas";
import type { ReelUrlInput } from "@/lib/validations";

interface AddReelModalProps {
  trigger?: React.ReactElement;
  onSuccess?: () => void;
  /** When true, Apify import is unavailable (missing token or USE_APIFY=false). */
  isDemoMode?: boolean;
}

export function AddReelModal({
  trigger,
  onSuccess,
  isDemoMode = false,
}: AddReelModalProps) {
  const router = useRouter();
  const t = useTranslations();
  const { reelUrlSchema } = useValidationSchemas();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolver = useMemo(() => zodResolver(reelUrlSchema), [reelUrlSchema]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReelUrlInput>({
    resolver,
  });

  async function onSubmit(data: ReelUrlInput) {
    setError(null);

    try {
      const res = await fetch("/api/reels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        setError(body.error ?? t("reels.addError"));
        return;
      }

      reset();
      setOpen(false);
      onSuccess?.();
      router.refresh();
    } catch {
      setError(t("reels.addNetworkError"));
    }
  }

  const defaultTrigger = (
    <Button className="rounded-full gap-1.5" size="sm">
      <Plus className="h-4 w-4" />
      {t("common.addReels")}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger ?? defaultTrigger} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("reels.addModalTitle")}</DialogTitle>
          <DialogDescription>{t("reels.addModalDesc")}</DialogDescription>
        </DialogHeader>

        {isDemoMode && (
          <div className="rounded-lg border border-amber-200/60 bg-amber-50/80 dark:bg-amber-950/20 dark:border-amber-900/40 px-3 py-2.5 text-sm text-amber-900 dark:text-amber-200 flex gap-2">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p>{t("reels.apifyUnavailableNotice")}</p>
              <p className="text-xs opacity-80">{t("reels.apifyUnavailableHint")}</p>
            </div>
          </div>
        )}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit(onSubmit)(event);
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="instagramUrl">{t("reels.addModalLabel")}</Label>
            <Input
              id="instagramUrl"
              placeholder={t("reels.addModalPlaceholder")}
              disabled={isSubmitting}
              {...register("instagramUrl")}
            />
            {errors.instagramUrl && (
              <p className="text-sm text-destructive">
                {errors.instagramUrl.message}
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t("common.loading") : t("common.addReels")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
