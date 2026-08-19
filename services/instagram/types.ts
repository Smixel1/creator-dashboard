import type { NormalizedReelData } from "@/types";

export interface InstagramService {
  fetchReel(url: string): Promise<NormalizedReelData>;
}
