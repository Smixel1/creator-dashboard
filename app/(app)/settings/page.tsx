import { getSessionUser } from "@/lib/auth";
import { isInstagramDemoMode } from "@/lib/instagram-config";
import { SettingsPageClient } from "@/components/settings/settings-page-client";

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  return (
    <SettingsPageClient
      user={user}
      isDemoMode={isInstagramDemoMode()}
      appVersion="0.1.0"
    />
  );
}
