import type { ReactNode } from "react";
import type { Metadata } from "next";
import { buildPublicMetadata } from "@/lib/seo/site";

export const metadata: Metadata = buildPublicMetadata({
  title: "Create account — CreatorPulse",
  description:
    "Create your CreatorPulse account and start tracking Instagram Reels analytics.",
  path: "/register",
});

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return children;
}
