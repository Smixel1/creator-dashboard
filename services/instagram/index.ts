import { isApifyConfigured } from "@/lib/instagram-config";
import type { InstagramService } from "./types";
import { MockInstagramService } from "./mock-instagram-service";
import { ApifyInstagramService } from "./apify-instagram-service";

export function getInstagramService(): InstagramService {
  if (isApifyConfigured()) {
    return new ApifyInstagramService();
  }

  return new MockInstagramService();
}

export type { InstagramService };
export {
  InstagramFetchError,
  isInstagramFetchError,
  type InstagramErrorCode,
} from "./errors";
export { normalizeInstagramReelUrl, instagramUrlsMatch } from "./normalize-url";
export { getInstagramErrorMessage } from "./error-messages";
