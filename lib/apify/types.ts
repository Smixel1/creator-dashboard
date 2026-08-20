/** Normalized Apify reel payload used inside the server pipeline. */
export interface ApifyNormalizedReel {
  instagramUrl: string;
  shortCode?: string;
  ownerUsername?: string;
  caption?: string;
  thumbnailUrl: string | null;
  publishedAt: Date;
  views: number | null;
  likes: number | null;
  comments: number | null;
  externalId?: string;
  fetchedAt: Date;
}
