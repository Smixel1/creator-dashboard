import type { InstagramService } from "./types";
import { fetchReelByInstagramUrl } from "@/lib/apify/fetch-reel-by-url";

export class ApifyInstagramService implements InstagramService {
  fetchReel(url: string) {
    return fetchReelByInstagramUrl(url);
  }
}
