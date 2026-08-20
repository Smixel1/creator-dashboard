import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingPanelProps {
  message?: string;
  className?: string;
  compact?: boolean;
  icon?: ReactNode;
}

export function LoadingPanel({
  message,
  className,
  compact = false,
  icon,
}: LoadingPanelProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center rounded-2xl border bg-card/60",
        compact ? "px-4 py-8" : "px-6 py-14 sm:py-16",
        className
      )}
      style={{ borderColor: "var(--surface-border)" }}
      role="status"
      aria-live="polite"
    >
      {icon ?? (
        <Loader2
          className="h-6 w-6 text-brand-rose animate-spin mb-3"
          aria-hidden
        />
      )}
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
}
