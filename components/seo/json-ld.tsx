import { getWebsiteStructuredData } from "@/lib/seo/structured-data";

export function WebsiteJsonLd() {
  const data = getWebsiteStructuredData();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
