import { Suspense } from "react";
import { getSessionUser } from "@/lib/auth";
import { getProfileStats, getUserReels } from "@/services/reels/reel-service";
import { ProfilePageClient } from "@/components/profile/profile-page-client";
import { PageLoadingSkeleton } from "@/components/shared/page-loading-skeleton";

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) return null;

  const [stats, reels] = await Promise.all([
    getProfileStats(user.id),
    getUserReels(user.id),
  ]);

  const recentReels = reels
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    .slice(0, 3);

  return (
    <Suspense fallback={<PageLoadingSkeleton variant="settings" />}>
      <ProfilePageClient user={user} stats={stats} recentReels={recentReels} />
    </Suspense>
  );
}
