"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/components/providers/locale-provider";

interface RefreshReelButtonProps {
  reelId: string;
  disabled?: boolean;
}

export function RefreshReelButton({ reelId, disabled }: RefreshReelButtonProps) {
  const router = useRouter();
  const t = useTranslations();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleRefresh() {
    setIsRefreshing(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/reels/${reelId}/sync`, {
        method: "POST",
        credentials: "same-origin",
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage({
          type: "error",
          text: (body as { error?: string }).error ?? t("reels.refreshFailed"),
        });
        return;
      }

      setMessage({
        type: "success",
        text: t("reels.refreshSuccess"),
      });
      router.refresh();
    } catch {
      setMessage({
        type: "error",
        text: t("reels.refreshFailed"),
      });
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Button
        type="button"
        variant="outline"
        className="rounded-full gap-2"
        onClick={() => void handleRefresh()}
        disabled={disabled || isRefreshing}
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        {isRefreshing ? t("reels.refreshing") : t("reels.refreshData")}
      </Button>
      {message && (
        <p
          role={message.type === "error" ? "alert" : "status"}
          className={
            message.type === "error"
              ? "text-xs text-destructive"
              : "text-xs text-brand-sage"
          }
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
