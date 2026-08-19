"use client";

import type { CSSProperties } from "react";
import { BrandMark } from "@/components/shared/brand-mark";
import { useTranslations } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";

const lockupSizes = {
  sm: {
    gap: "gap-2",
    mark: "sm" as const,
    wordmark: "text-sm font-bold tracking-tight",
    descriptor: "text-[10px]",
    indent: "2.25rem",
  },
  md: {
    gap: "gap-2.5",
    mark: "md" as const,
    wordmark: "text-base font-bold tracking-tight",
    descriptor: "text-[10px]",
    indent: "2.625rem",
  },
  lg: {
    gap: "gap-3",
    mark: "lg" as const,
    wordmark: "text-base sm:text-lg font-bold tracking-tight",
    descriptor: "text-[11px]",
    indent: "3rem",
  },
} as const;

interface BrandLockupProps {
  size?: keyof typeof lockupSizes;
  /** Optional brand descriptor — off by default in nav/chrome. */
  showDescriptor?: boolean;
  className?: string;
}

/** Horizontal lockup: [Brand Mark] CreatorPulse */
export function BrandLockup({
  size = "md",
  showDescriptor = false,
  className,
}: BrandLockupProps) {
  const t = useTranslations();
  const name = t("brand.name");
  const descriptor = t("brand.lockupTagline");
  const { gap, mark, wordmark, descriptor: descriptorSize, indent } =
    lockupSizes[size];

  return (
    <div
      className={cn("inline-flex flex-col shrink-0 overflow-visible", className)}
      aria-label={showDescriptor ? `${name} ${descriptor}` : name}
    >
      <div className={cn("inline-flex items-center", gap)}>
        <BrandMark size={mark} />
        <span className={cn(wordmark, "text-foreground whitespace-nowrap")}>
          {name}
        </span>
      </div>
      {showDescriptor && (
        <p
          className={cn(
            descriptorSize,
            "mt-1 font-medium normal-case text-muted-foreground whitespace-nowrap"
          )}
          style={{ paddingLeft: indent } as CSSProperties}
        >
          {descriptor}
        </p>
      )}
    </div>
  );
}
