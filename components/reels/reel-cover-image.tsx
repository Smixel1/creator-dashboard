import { Film } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReelCoverImageProps {
  src: string | null;
  alt: string;
  className?: string;
  placeholderClassName?: string;
}

export function ReelCoverImage({
  src,
  alt,
  className,
  placeholderClassName,
}: ReelCoverImageProps) {
  if (!src?.trim()) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-muted/50 text-muted-foreground",
          placeholderClassName ?? className
        )}
        aria-label={alt}
      >
        <Film className="h-8 w-8 opacity-35" aria-hidden />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} />
  );
}
