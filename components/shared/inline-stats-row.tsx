"use client";

import { cnChange } from "@/lib/format";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";

export interface InlineStatItem {
  label: string;
  value: string;
  highlight?: boolean;
  change?: number;
}

interface InlineStatsRowProps {
  items: InlineStatItem[];
  className?: string;
  size?: "default" | "compact";
}

/** Open stat row — no card wrapper. Used on Dashboard & Profile. */
export function InlineStatsRow({
  items,
  className,
  size = "default",
}: InlineStatsRowProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-baseline gap-x-8 gap-y-4",
        size === "compact" && "gap-x-6 gap-y-3",
        className
      )}
    >
      {items.map((item) => {
        const positive = (item.change ?? 0) >= 0;
        const hasChange = item.change !== undefined;
        const changeLabel = hasChange ? cnChange(item.change) : null;

        return (
          <div key={item.label} className="flex flex-col gap-0.5 min-w-[4.5rem]">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span
                className={cn(
                  "font-semibold tabular-nums tracking-tight leading-none",
                  item.highlight
                    ? "editorial-heading text-2xl sm:text-3xl text-brand-rose"
                    : size === "compact"
                      ? "text-lg text-foreground"
                      : "text-xl sm:text-2xl text-foreground"
                )}
              >
                {item.value}
              </span>
              {changeLabel && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 text-xs font-medium",
                    positive ? "text-brand-sage" : "text-destructive"
                  )}
                >
                  {positive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {changeLabel}
                </span>
              )}
            </div>
            <span className="text-sm text-muted-foreground">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}
