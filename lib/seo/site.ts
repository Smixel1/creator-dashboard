import type { Metadata } from "next";

export const SITE_NAME = "CreatorPulse";

export function getSiteUrl(): URL {
  const raw =
    process.env.APP_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim();

  if (raw) {
    const withProtocol = raw.startsWith("http") ? raw : `https://${raw}`;
    return new URL(withProtocol);
  }

  return new URL("https://creator-dashboard-sm1l1.vercel.app");
}

export const siteConfig = {
  name: SITE_NAME,
  url: getSiteUrl(),
  twitterHandle: "@creatorpulse",
} as const;

export function buildPublicMetadata({
  title,
  description,
  path = "",
  noIndex = false,
}: {
  title: string;
  description: string;
  path?: string;
  noIndex?: boolean;
}): Metadata {
  const url = new URL(path, siteConfig.url);

  return {
    title,
    description,
    alternates: {
      canonical: url.pathname === "/" ? siteConfig.url.toString() : url.toString(),
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url: url.toString(),
      locale: "ru_RU",
      alternateLocale: ["en_US"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export const privateAppMetadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};
