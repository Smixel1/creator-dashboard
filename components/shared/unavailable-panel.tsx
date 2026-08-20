import type { ReactNode } from "react";
import { CloudOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface UnavailablePanelProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function UnavailablePanel({
  title,
  description,
  action,
  className,
}: UnavailablePanelProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border bg-card/50 px-6 py-12 sm:py-14 text-center",
        className
      )}
      style={{ borderColor: "var(--surface-border)" }}
      role="status"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60 mb-4">
        <CloudOff className="h-5 w-5 text-muted-foreground" aria-hidden />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-2 max-w-md leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
