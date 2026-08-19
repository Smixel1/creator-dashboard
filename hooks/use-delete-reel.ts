"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/components/providers/locale-provider";

export function useDeleteReel() {
  const router = useRouter();
  const t = useTranslations();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const deleteReel = useCallback(
    async (id: string): Promise<boolean> => {
      setDeletingId(id);
      setError(null);

      try {
        const res = await fetch(`/api/reels/${id}`, { method: "DELETE" });
        const body = await res.json().catch(() => ({}));

        if (!res.ok) {
          setError(
            (body as { error?: string }).error ?? t("reels.deleteError")
          );
          return false;
        }

        router.refresh();
        return true;
      } catch {
        setError(t("reels.deleteNetworkError"));
        return false;
      } finally {
        setDeletingId(null);
      }
    },
    [router, t]
  );

  const clearError = useCallback(() => setError(null), []);

  return { deleteReel, deletingId, error, clearError, isDeleting: deletingId !== null };
}
