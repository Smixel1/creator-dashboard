import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ContentCardProps {
  children: ReactNode;
  interactive?: boolean;
  className?: string;
}

export function ContentCard({
  children,
  interactive = false,
  className,
}: ContentCardProps) {
  return (
    <div
      className={cn(
        interactive ? "content-card-interactive" : "content-card",
        className
      )}
    >
      {children}
    </div>
  );
}
