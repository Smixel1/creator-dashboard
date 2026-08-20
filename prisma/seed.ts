import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import { generateStatHistory } from "../services/instagram/mock-instagram-service";

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  return new pg.Pool({
    connectionString,
    ssl: connectionString.includes("sslmode=require")
      ? { rejectUnauthorized: false }
      : undefined,
  });
}

const pool = createPool();
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const REEL_DATA = [
  {
    title: "Утренний ритуал, который изменил мою жизнь ☀️",
    coverUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop",
    views: 124_500,
    likes: 8_420,
    comments: 312,
    daysAgo: 2,
  },
  {
    title: "5 советов по летним образам",
    coverUrl:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=800&fit=crop",
    views: 89_200,
    likes: 5_640,
    comments: 198,
    daysAgo: 5,
  },
  {
    title: "За кадром последней съёмки",
    coverUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=800&fit=crop",
    views: 256_800,
    likes: 18_900,
    comments: 542,
    daysAgo: 8,
  },
  {
    title: "Быстрый рецепт: полезный боул за 15 минут",
    coverUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=800&fit=crop",
    views: 67_300,
    likes: 4_210,
    comments: 156,
    daysAgo: 12,
  },
  {
    title: "Тревел-влог: скрытые места Лиссабона",
    coverUrl:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600&h=800&fit=crop",
    views: 312_400,
    likes: 24_100,
    comments: 891,
    daysAgo: 15,
  },
  {
    title: "Уход за кожей для сияющего результата",
    coverUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=800&fit=crop",
    views: 198_600,
    likes: 14_800,
    comments: 423,
    daysAgo: 18,
  },
  {
    title: "Обновление домашнего офиса с минимальным бюджетом",
    coverUrl:
      "https://images.unsplash.com/photo-1618221195710-dd6b41fa6046?w=600&h=800&fit=crop",
    views: 45_900,
    likes: 2_890,
    comments: 87,
    daysAgo: 22,
  },
  {
    title: "Фитнес-челлендж — результаты 30-го дня",
    coverUrl:
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=800&fit=crop",
    views: 178_200,
    likes: 12_400,
    comments: 367,
    daysAgo: 25,
  },
  {
    title: "Распаковка любимого оборудования автора",
    coverUrl:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=800&fit=crop",
    views: 92_100,
    likes: 6_780,
    comments: 234,
    daysAgo: 28,
  },
  {
    title: "Выходные: забота о себе",
    coverUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=800&fit=crop",
    views: 134_700,
    likes: 9_560,
    comments: 278,
    daysAgo: 32,
  },
  {
    title: "Как я планирую контент на месяц",
    coverUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop",
    views: 56_400,
    likes: 3_420,
    comments: 112,
    daysAgo: 35,
  },
  {
    title: "Обзор кофеен в моём районе",
    coverUrl:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&h=800&fit=crop",
    views: 73_800,
    likes: 5_120,
    comments: 189,
    daysAgo: 40,
  },
];

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);
  const demoPasswordHash = await bcrypt.hash("demo123456", 12);

  await prisma.reelStat.deleteMany();
  await prisma.reel.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: {
      name: "Demo Creator",
      email: "demo@creatorpulse.local",
      passwordHash: demoPasswordHash,
      instagramUsername: "demo.creator",
    },
  });

  const anna = await prisma.user.create({
    data: {
      name: "Anna Petrova",
      email: "anna@creator.io",
      passwordHash,
      avatarUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
      instagramUsername: "anna.creates",
    },
  });

  await prisma.user.create({
    data: {
      name: "Maria Santos",
      email: "maria@creator.io",
      passwordHash,
      avatarUrl:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
      instagramUsername: "maria.lifestyle",
    },
  });

  await prisma.user.create({
    data: {
      name: "Alex Chen",
      email: "alex@creator.io",
      passwordHash,
      avatarUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
      instagramUsername: "alex.visuals",
    },
  });

  for (let i = 0; i < REEL_DATA.length; i++) {
    const reel = REEL_DATA[i];
    const publishedAt = new Date();
    publishedAt.setDate(publishedAt.getDate() - reel.daysAgo);

    const created = await prisma.reel.create({
      data: {
        userId: anna.id,
        instagramUrl: `https://instagram.com/reel/seed_${i + 1}`,
        title: reel.title,
        coverUrl: reel.coverUrl,
        views: reel.views,
        likes: reel.likes,
        comments: reel.comments,
        publishedAt,
      },
    });

    const history = generateStatHistory(
      reel.views,
      reel.likes,
      reel.comments,
      30
    );

    await prisma.reelStat.createMany({
      data: history.map((s) => ({
        reelId: created.id,
        views: s.views,
        likes: s.likes,
        comments: s.comments,
        recordedAt: s.recordedAt,
      })),
    });
  }

  console.log("Seed completed.");
  console.log("Dev test account: demo@creatorpulse.local / demo123456");
  console.log("Legacy demo account: anna@creator.io / password123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
