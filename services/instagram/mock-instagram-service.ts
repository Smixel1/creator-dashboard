import type { NormalizedReelData } from "@/types";
import type { InstagramService } from "./types";
import { normalizeInstagramReelUrl } from "./normalize-url";
const MOCK_TITLES = [
  "Утренний ритуал, который изменил мою жизнь ☀️",
  "5 советов по летним образам",
  "За кадром последней съёмки",
  "Быстрый рецепт: полезный боул за 15 минут",
  "Тревел-влог: скрытые места Лиссабона",
  "Уход за кожей для сияющего результата",
  "Обновление домашнего офиса с минимальным бюджетом",
  "Фитнес-челлендж — результаты 30-го дня",
  "Распаковка любимого оборудования автора",
  "Выходные: забота о себе",
  "Как я планирую контент на месяц",
  "Обзор кофеен в моём районе",
  "Минималистичный гардероб: must-have",
  "День из жизни автора",
  "Советы по съёмке Reels",
];

const MOCK_COVERS = [
  "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=800&fit=crop",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=800&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=800&fit=crop",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=800&fit=crop",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=800&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=800&fit=crop",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=800&fit=crop",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600&h=800&fit=crop",
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export class MockInstagramService implements InstagramService {
  async fetchReel(url: string): Promise<NormalizedReelData> {
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const hash = hashString(url);
    const titleIndex = hash % MOCK_TITLES.length;
    const coverIndex = hash % MOCK_COVERS.length;

    const views = 15_000 + (hash % 500_000);
    const likes = Math.floor(views * (0.04 + (hash % 50) / 1000));
    const comments = Math.floor(likes * (0.05 + (hash % 30) / 1000));

    const daysAgo = hash % 60;
    const publishedAt = new Date();
    publishedAt.setDate(publishedAt.getDate() - daysAgo);

    const normalizedUrl = normalizeInstagramReelUrl(url);

    return {
      title: MOCK_TITLES[titleIndex],
      coverUrl: MOCK_COVERS[coverIndex],
      views,
      likes,
      comments,
      publishedAt,
      instagramUrl: normalizedUrl,
      source: "mock",
    };
  }
}

export function generateStatHistory(
  baseViews: number,
  baseLikes: number,
  baseComments: number,
  days: number
) {
  const stats = [];
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const progress = 1 - i / days;
    const recordedAt = new Date(now);
    recordedAt.setDate(recordedAt.getDate() - i);

    stats.push({
      views: Math.floor(baseViews * (0.3 + progress * 0.7)),
      likes: Math.floor(baseLikes * (0.3 + progress * 0.7)),
      comments: Math.floor(baseComments * (0.3 + progress * 0.7)),
      recordedAt,
    });
  }

  return stats;
}
