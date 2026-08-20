import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const publicPaths = [
    "/login",
    "/register",
    "/forgot-password",
    "/privacy",
    "/terms",
    "/data-deletion",
  ];

  return publicPaths.map((path) => ({
    url: new URL(path, siteConfig.url).toString(),
    lastModified,
    changeFrequency: path.startsWith("/privacy") ? "monthly" : "weekly",
    priority: path === "/login" ? 0.9 : 0.5,
  }));
}
