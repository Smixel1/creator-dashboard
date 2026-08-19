"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/components/providers/locale-provider";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const t = useTranslations();

  useEffect(() => {
    console.error("[app-error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-xl font-semibold">{t("errors.pageLoad")}</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t("errors.pageLoadDesc")}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <Button type="button" onClick={() => reset()}>
            {t("common.retry")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard")}
          >
            {t("errors.toDashboard")}
          </Button>
        </div>
      </div>
    </div>
  );
}
