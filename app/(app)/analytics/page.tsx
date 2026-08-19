import { getSessionUser } from "@/lib/auth";
import { getAnalyticsWithFollowers } from "@/services/analytics/creator-followers";
import { AnalyticsPageContent } from "@/components/analytics/analytics-page-content";

export default async function AnalyticsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const analytics = await getAnalyticsWithFollowers(user.id, "30d");

  return <AnalyticsPageContent initialAnalytics={analytics} />;
}
