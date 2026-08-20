import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getReelById, getUserReels } from "@/services/reels/reel-service";
import { ReelDetailContent } from "@/components/reels/reel-detail-content";

export default async function ReelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user) return null;

  const { id } = await params;
  const [reel, allReels] = await Promise.all([
    getReelById(user.id, id),
    getUserReels(user.id),
  ]);

  if (!reel) notFound();

  const related = allReels
    .filter((r) => r.id !== reel.id)
    .sort((a, b) => {
      const aScore = a.hasViewsData !== false ? a.views : -1;
      const bScore = b.hasViewsData !== false ? b.views : -1;
      return bScore - aScore;
    })
    .slice(0, 4);

  return <ReelDetailContent reel={reel} related={related} />;
}
