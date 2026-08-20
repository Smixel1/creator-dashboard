import Link from "next/link";
import { BrandLockup } from "@/components/shared/brand-lockup";

export default function NotFound() {
  return (
    <div className="min-h-screen page-shell flex flex-col items-center justify-center px-6 text-center">
      <BrandLockup size="md" className="mb-8" />
      <p className="section-eyebrow mb-2">404</p>
      <h1 className="editorial-heading text-3xl font-semibold mb-3">
        Page not found
      </h1>
      <p className="text-sm text-muted-foreground max-w-sm mb-8">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/login"
        className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-[var(--brand-coral-hover)] transition-colors"
      >
        Go to sign in
      </Link>
    </div>
  );
}
