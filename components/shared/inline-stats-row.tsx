"use client";

import { cnChange } from "@/lib/format";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";

export interface InlineStatItem {
  label: string;
  value: string;
  change?: number;
  tone?: "default" | "views" | "engagement";
}

interface InlineStatsRowProps {
  items: InlineStatItem[];
  /** `compact` for profile / secondary surfaces */
  size?: "default" | "compact";
  className?: string;
}

export function InlineStatsRow({
  items,
  size = "default",
  className,
}: InlineStatsRowProps) {
  const cols =
    items.length === 5
      ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
      : items.length <= 2
        ? "grid-cols-2"
        : items.length === 3
          ? "grid-cols-3"
          : "grid-cols-2 sm:grid-cols-4";

  return (
    <div className={cn("grid gap-3", cols, className)}>
      {items.map((item) => {
        const positive = (item.change ?? 0) >= 0;
        const hasChange = item.change !== undefined;
        const changeLabel = hasChange ? cnChange(item.change) : null;

        return (
          <div
            key={item.label}
            className={cn(
              "metric-tile",
              size === "compact" && "px-3 py-2.5 sm:px-3 sm:py-2.5",
            )}
          >
            <p className="metric-label mb-2">{item.label}</p>
            <p
              className={cn(
                size === "compact" ? "metric-value-sm" : "metric-value",
                item.tone === "views" && "metric-value-views",
                item.tone === "engagement" && "metric-value-engagement",
              )}
            >
              {item.value}
            </p>
            {changeLabel ? (
              <span
                className={cn(
                  "mt-1.5 inline-flex items-center gap-0.5 text-[11px] font-medium tabular-nums",
                  positive ? "text-brand-sage" : "text-destructive",
                )}
              >
                {positive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {changeLabel}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
