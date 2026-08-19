"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsRowProps {
  label: string;
  value: string;
  hint?: string;
  href?: string;
  actionLabel?: string;
}

export function SettingsRow({
  label,
  value,
  hint,
  href,
  actionLabel,
}: SettingsRowProps) {
  const content = (
    <div
      className={cn(
        "settings-row px-4 py-3.5 border-b border-border/20 last:border-0",
        href && "group hover:bg-muted/30 transition-colors"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
          <p className="text-sm font-medium break-words">{value}</p>
          {hint && (
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {hint}
            </p>
          )}
        </div>
        {href && (
          <span className="inline-flex items-center gap-0.5 text-xs font-medium text-brand-rose shrink-0 mt-1 group-hover:text-[var(--brand-coral-hover)] transition-colors">
            {actionLabel}
            <ChevronRight className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
