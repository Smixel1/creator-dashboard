import { getSessionUser } from "@/lib/auth";
import { getAnalyticsOverview } from "@/services/reels/reel-service";
import { AnalyticsPageContent } from "@/components/analytics/analytics-page-content";

export default async function AnalyticsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const analytics = await getAnalyticsOverview(user.id, "30d");

  return <AnalyticsPageContent initialAnalytics={analytics} />;
}
