import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStatePanelProps {
  icon: ReactNode;
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  variant?: "dashed" | "soft";
  className?: string;
}

export function EmptyStatePanel({
  icon,
  eyebrow,
  title,
  description,
  action,
  variant = "dashed",
  className,
}: EmptyStatePanelProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl px-6 py-14 sm:py-16 text-center animate-enter",
        variant === "dashed"
          ? "border border-dashed border-border/40 bg-card/40"
          : "surface-panel",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/80 mb-4">
        {icon}
      </div>
      {eyebrow && <p className="section-eyebrow mb-2">{eyebrow}</p>}
      <h3 className="editorial-heading text-lg sm:text-xl font-semibold">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-2 max-w-md leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
