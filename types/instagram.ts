export type InstagramConnectionStatus =
  | "not_connected"
  | "connected"
  | "expired";

export interface InstagramConnectionPublic {
  status: InstagramConnectionStatus;
  configured: boolean;
  username?: string;
  profilePictureUrl?: string;
  accountType?: string;
  followersCount?: number;
  lastSyncedAt?: string;
}
