import { getSessionUser } from "@/lib/auth";
import { isInstagramDemoMode } from "@/lib/instagram-config";
import { getAnalyticsOverview } from "@/services/reels/reel-service";
import { getGreeting } from "@/lib/format";
import { getServerTranslator } from "@/lib/i18n/server";
import { DashboardGreetingHeader } from "@/components/dashboard/dashboard-greeting-header";
import { CreatorSnapshot } from "@/components/dashboard/creator-snapshot";
import { DashboardFeaturedReel } from "@/components/dashboard/dashboard-featured-reel";
import { QuickInsight } from "@/components/dashboard/quick-insight";
import { DashboardRecentReels } from "@/components/dashboard/dashboard-recent-reels";
import { EmptyReelsState } from "@/components/reels/empty-state";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const { t } = await getServerTranslator();
  const analytics = await getAnalyticsOverview(user.id, "30d");
  const { stats, topPerforming, recentReels } = analytics;
  const isDemoMode = isInstagramDemoMode();
  const featuredReel = topPerforming[0];

  return (
    <div className="content-canvas stack-section-lg pb-4">
      <DashboardGreetingHeader
        greeting={getGreeting(user.name, t)}
        isDemoMode={isDemoMode}
      />

      {stats.totalReels === 0 ? (
        <EmptyReelsState isDemoMode={isDemoMode} />
      ) : (
        <>
          <CreatorSnapshot stats={stats} />
          {featuredReel && <DashboardFeaturedReel reel={featuredReel} />}
          <DashboardRecentReels
            reels={recentReels}
            topReelId={featuredReel?.id}
          />
          <QuickInsight stats={stats} topReel={featuredReel} />
        </>
      )}
    </div>
  );
}
