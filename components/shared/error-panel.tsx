import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorPanelProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function ErrorPanel({
  title,
  description,
  action,
  className,
}: ErrorPanelProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border px-5 py-4 bg-card/80",
        className
      )}
      style={{ borderColor: "var(--surface-border)" }}
      role="alert"
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
          <AlertCircle className="h-4 w-4 text-destructive" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{title}</p>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
