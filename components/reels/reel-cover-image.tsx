import Image from "next/image";
import { Film } from "lucide-react";
import { cn } from "@/lib/utils";

const OPTIMIZED_HOSTS = [
  "images.unsplash.com",
  "cdninstagram.com",
  "fbcdn.net",
  "public.blob.vercel-storage.com",
];

function canOptimizeRemoteImage(src: string): boolean {
  try {
    const { hostname } = new URL(src);
    return OPTIMIZED_HOSTS.some(
      (host) => hostname === host || hostname.endsWith(`.${host}`)
    );
  } catch {
    return false;
  }
}

interface ReelCoverImageProps {
  src: string | null;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  priority?: boolean;
  sizes?: string;
}

export function ReelCoverImage({
  src,
  alt,
  className,
  placeholderClassName,
  priority = false,
  sizes = "(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw",
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

  if (canOptimizeRemoteImage(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-cover", className)}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={className}
    />
  );
}
