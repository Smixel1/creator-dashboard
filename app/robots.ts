import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/login", "/register", "/forgot-password", "/privacy", "/terms", "/data-deletion"],
        disallow: [
          "/dashboard",
          "/reels",
          "/analytics",
          "/profile",
          "/settings",
          "/api/",
        ],
      },
    ],
    sitemap: new URL("/sitemap.xml", siteConfig.url).toString(),
  };
}
