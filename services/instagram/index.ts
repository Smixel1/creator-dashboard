import { isApifyConfigured } from "@/lib/apify/config";
import type { InstagramService } from "./types";
import { InstagramFetchError } from "./errors";
import { ApifyInstagramService } from "./apify-instagram-service";

const unavailableService: InstagramService = {
  async fetchReel() {
    throw new InstagramFetchError("NOT_CONFIGURED");
  },
};

export function getInstagramService(): InstagramService {
  if (isApifyConfigured()) {
    return new ApifyInstagramService();
  }

  return unavailableService;
}

export type { InstagramService };
export {
  InstagramFetchError,
  isInstagramFetchError,
  type InstagramErrorCode,
} from "./errors";
export { normalizeInstagramReelUrl, instagramUrlsMatch } from "./normalize-url";
export { getInstagramErrorMessage } from "./error-messages";
export { fetchReelByInstagramUrl } from "@/lib/apify/fetch-reel-by-url";
