import type { ReactNode } from "react";
import type { Metadata } from "next";
import { buildPublicMetadata } from "@/lib/seo/site";

export const metadata: Metadata = buildPublicMetadata({
  title: "Sign in — CreatorPulse",
  description:
    "Sign in to CreatorPulse to track Instagram Reels performance with beautiful analytics.",
  path: "/login",
});

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}
