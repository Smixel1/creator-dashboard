import { siteConfig } from "@/lib/seo/site";

export function getWebsiteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: siteConfig.name,
        url: siteConfig.url.toString(),
        description:
          "Premium Instagram Reels analytics for creators and influencers.",
      },
      {
        "@type": "WebApplication",
        name: siteConfig.name,
        url: siteConfig.url.toString(),
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "Organization",
        name: siteConfig.name,
        url: siteConfig.url.toString(),
      },
    ],
  };
}
