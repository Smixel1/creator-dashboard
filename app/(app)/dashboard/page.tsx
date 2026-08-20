import { getSessionUser } from "@/lib/auth";
import { isInstagramDemoMode } from "@/lib/instagram-config";
import { getAnalyticsOverview } from "@/services/reels/reel-service";
import { getGreeting } from "@/lib/format";
import { getServerTranslator } from "@/lib/i18n/server";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { CreatorSnapshot } from "@/components/dashboard/creator-snapshot";
import { QuickInsight } from "@/components/dashboard/quick-insight";
import { DashboardRecentReels } from "@/components/dashboard/dashboard-recent-reels";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { EmptyReelsState } from "@/components/reels/empty-state";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const { t } = await getServerTranslator();
  const analytics = await getAnalyticsOverview(user.id, "30d");
  const { stats, topPerforming, recentReels } = analytics;

  return (
    <div className="content-canvas stack-section-lg pb-4">
      <DashboardHero greeting={getGreeting(user.name, t)} />

      <CreatorSnapshot user={user} stats={stats} />

      {stats.totalReels === 0 ? (
        <EmptyReelsState isDemoMode={isInstagramDemoMode()} />
      ) : (
        <>
          <DashboardRecentReels
            reels={recentReels}
            topReelId={topPerforming[0]?.id}
          />
          <QuickInsight stats={stats} topReel={topPerforming[0]} />
          <RecentActivity reels={recentReels.slice(0, 5)} />
        </>
      )}
    </div>
  );
}
