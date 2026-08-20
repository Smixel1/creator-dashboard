"use client";

import { useTranslations } from "@/components/providers/locale-provider";
import type { ReelAnalyticsOverview } from "@/types";

interface AnalyticsSourceBreakdownProps {
  contentSource: ReelAnalyticsOverview["contentSource"];
  totalReels: number;
}

export function AnalyticsSourceBreakdown({
  contentSource,
  totalReels,
}: AnalyticsSourceBreakdownProps) {
  const t = useTranslations();

  if (totalReels === 0) return null;

  const labelKey =
    contentSource === "instagram"
      ? "analytics.sourceInstagram"
      : contentSource === "mixed"
        ? "analytics.sourceMixed"
        : "analytics.sourceImported";

  return (
    <section className="open-section pt-2">
      <p className="section-eyebrow mb-2">{t("analytics.sourceTitle")}</p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="product-badge">{t(labelKey)}</span>
        <span className="text-sm text-muted-foreground">
          {t("analytics.sourceReelsCount", { count: totalReels })}
        </span>
      </div>
    </section>
  );
}
