export type ReelSortField = "publishedAt" | "views" | "likes" | "comments";
export type SortOrder = "asc" | "desc";
export type AnalyticsPeriod = "7d" | "30d" | "90d" | "all";

export interface ReelMetrics {
  views: number;
  likes: number;
  comments: number;
}

export type ReelDataSource = "instagram" | "mock" | "manual";

export interface NormalizedReelData {
  title: string;
  coverUrl: string;
  views: number | null;
  likes: number | null;
  comments: number | null;
  publishedAt: Date;
  instagramUrl: string;
  shortCode?: string;
  externalId?: string;
  source?: ReelDataSource;
  username?: string;
  mediaType?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  caption?: string;
  shares?: number | null;
  reach?: number | null;
}

export interface DashboardStats {
  totalReels: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  averageViews: number;
  averageLikes: number;
  averageComments: number;
  engagementRate: number;
  hasEngagementData: boolean;
  totalReelsChange?: number;
  totalViewsChange?: number;
  totalLikesChange?: number;
  totalCommentsChange?: number;
  averageViewsChange?: number;
  averageLikesChange?: number;
  averageCommentsChange?: number;
  engagementRateChange?: number;
}

export interface FollowersMetrics {
  current: number;
  previous: number;
  growth: number;
  growthPercent: number;
  source?: "instagram" | "mock";
  hasHistoricalData?: boolean;
  /** False when Instagram is connected but follower count is unavailable. */
  hasData?: boolean;
}

export interface ChartDataPoint {
  date: string;
  isoDate?: string;
  views: number;
  likes?: number;
  comments?: number;
  engagement?: number;
  followers?: number;
}

export interface ReelAnalyticsOverview {
  period: AnalyticsPeriod;
  stats: DashboardStats;
  viewsOverTime: ChartDataPoint[];
  topPerforming: ReelWithEngagement[];
  recentReels: ReelWithEngagement[];
  contentSource: "instagram" | "mock" | "mixed";
}

export interface AnalyticsOverview extends ReelAnalyticsOverview {
  followers: FollowersMetrics;
  followersOverTime: ChartDataPoint[];
  followersSource: "instagram" | "mock";
  followersHasHistoricalData: boolean;
}

export interface ReelWithEngagement {
  id: string;
  title: string;
  coverUrl: string;
  instagramUrl: string;
  views: number;
  likes: number;
  comments: number;
  publishedAt: string;
  engagementRate: number;
  hasViewsData?: boolean;
  source?: ReelDataSource;
}

export interface ReelDetail extends ReelWithEngagement {
  stats: ChartDataPoint[];
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  instagramUsername: string | null;
  locale: string;
  createdAt: string;
}

export interface ProfileStats {
  totalReels: number;
  totalViews: number;
}
