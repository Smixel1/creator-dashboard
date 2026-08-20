import { getSessionUser } from "@/lib/auth";
import { isInstagramDemoMode } from "@/lib/instagram-config";
import { getUserReels } from "@/services/reels/reel-service";
import { ReelsPageClient } from "@/components/reels/reels-page-client";

export default async function ReelsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const reels = await getUserReels(user.id);

  return (
    <ReelsPageClient reels={reels} isDemoMode={isInstagramDemoMode()} />
  );
}
