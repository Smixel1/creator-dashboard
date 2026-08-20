import { Suspense } from "react";
import { getSessionUser } from "@/lib/auth";
import { getProfileStats } from "@/services/reels/reel-service";
import { ProfilePageClient } from "@/components/profile/profile-page-client";

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) return null;

  const stats = await getProfileStats(user.id);

  return (
    <Suspense fallback={null}>
      <ProfilePageClient user={user} stats={stats} />
    </Suspense>
  );
}
