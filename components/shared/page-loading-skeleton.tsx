import { Skeleton } from "@/components/ui/skeleton";

interface PageLoadingSkeletonProps {
  variant?: "dashboard" | "grid" | "detail" | "settings" | "analytics";
}

export function PageLoadingSkeleton({
  variant = "dashboard",
}: PageLoadingSkeletonProps) {
  if (variant === "grid") {
    return (
      <div className="content-canvas stack-section pb-4 animate-enter">
        <div className="space-y-3 pb-4 border-b border-border/25">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1 max-w-xs" />
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="editorial-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (variant === "detail") {
    return (
      <div className="content-canvas stack-section-lg pb-6 animate-enter">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="aspect-[9/16] max-h-[520px] w-full max-w-md rounded-2xl" />
        <Skeleton className="h-16 w-40" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (variant === "settings") {
    return (
      <div className="content-canvas max-w-2xl stack-section-lg pb-6 animate-enter">
        <div className="space-y-2 pb-4 border-b border-border/25">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-40" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (variant === "analytics") {
    return (
      <div className="content-canvas stack-section-lg pb-4 animate-enter">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4 pb-4 border-b border-border/25">
          <div className="space-y-2">
            <Skeleton className="h-8 w-44" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-72 max-w-full" />
        </div>
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="content-canvas stack-section-lg pb-4 animate-enter">
      <div className="space-y-3 pb-4 border-b border-border/25">
        <Skeleton className="h-9 w-64 max-w-full" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <Skeleton className="h-28 w-full rounded-xl" />
      <Skeleton className="aspect-[16/9] w-full max-w-2xl rounded-2xl" />
      <div className="editorial-grid-featured">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton
            key={i}
            className={i === 0 ? "aspect-[4/5] rounded-xl" : "aspect-[3/4] rounded-xl"}
          />
        ))}
      </div>
    </div>
  );
}
