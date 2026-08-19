import { getSessionUser } from "@/lib/auth";
import { isInstagramDemoMode } from "@/lib/instagram-config";
import { getInstagramConnectionPublic } from "@/services/instagram/connection-service";
import { getUserReels } from "@/services/reels/reel-service";
import { ReelsPageClient } from "@/components/reels/reels-page-client";

export default async function ReelsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const [reels, instagram] = await Promise.all([
    getUserReels(user.id),
    getInstagramConnectionPublic(user.id),
  ]);

  return (
    <ReelsPageClient
      reels={reels}
      isDemoMode={isInstagramDemoMode()}
      instagramConnected={instagram.status === "connected"}
    />
  );
}
