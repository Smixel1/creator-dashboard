"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/components/providers/locale-provider";

interface SyncReelsButtonProps {
  disabled?: boolean;
  isDemoMode?: boolean;
}

export function SyncReelsButton({
  disabled,
  isDemoMode = false,
}: SyncReelsButtonProps) {
  const router = useRouter();
  const t = useTranslations();
  const [isSyncing, setIsSyncing] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSync() {
    setIsSyncing(true);
    setMessage(null);

    try {
      const res = await fetch("/api/reels/sync", {
        method: "POST",
        credentials: "same-origin",
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage({
          type: "error",
          text: (body as { error?: string }).error ?? t("reels.syncFailed"),
        });
        return;
      }

      const data = body as {
        updated: number;
        failed: number;
        total: number;
        demoMode?: boolean;
      };

      if (data.failed > 0) {
        setMessage({
          type: "error",
          text: t("reels.syncPartial", {
            updated: data.updated,
            failed: data.failed,
          }),
        });
      } else {
        setMessage({
          type: "success",
          text: isDemoMode || data.demoMode
            ? t("reels.syncSuccessDemo", { count: data.updated })
            : t("reels.syncSuccess", { count: data.updated }),
        });
      }

      router.refresh();
    } catch {
      setMessage({
        type: "error",
        text: t("reels.syncFailed"),
      });
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-full gap-1.5"
        onClick={() => void handleSync()}
        disabled={disabled || isSyncing}
      >
        <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
        {isSyncing ? t("reels.syncing") : t("reels.syncReels")}
      </Button>
      {message && (
        <p
          role={message.type === "error" ? "alert" : "status"}
          className={
            message.type === "error"
              ? "text-xs text-destructive max-w-[220px] text-right"
              : "text-xs text-brand-sage max-w-[220px] text-right"
          }
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
