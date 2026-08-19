import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: pg.Pool | undefined;
};

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  return new pg.Pool({
    connectionString,
    ssl: connectionString.includes("sslmode=require")
      ? { rejectUnauthorized: false }
      : undefined,
  });
}

function createPrismaClient() {
  const pool = globalForPrisma.pool ?? createPool();
  const adapter = new PrismaPg(pool);

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pool = pool;
  }

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function hasInstagramModels(
  client: PrismaClient
): client is PrismaClient & {
  instagramConnection: PrismaClient["user"];
  instagramFollowerSnapshot: PrismaClient["user"];
} {
  const candidate = client as PrismaClient & {
    instagramConnection?: unknown;
    instagramFollowerSnapshot?: unknown;
  };

  return (
    candidate.instagramConnection != null &&
    candidate.instagramFollowerSnapshot != null
  );
}

/**
 * Next.js dev keeps `globalThis` between HMR reloads. After `prisma generate`
 * adds new models, the cached client instance still exposes the old datamodel.
 */
function getPrismaClient(): PrismaClient {
  const cached = globalForPrisma.prisma;

  if (cached && hasInstagramModels(cached)) {
    return cached;
  }

  if (cached) {
    void cached.$disconnect();
    globalForPrisma.prisma = undefined;
  }

  const client = createPrismaClient();

  if (!hasInstagramModels(client)) {
    throw new Error(
      "Generated Prisma Client is missing Instagram models. Run `npx prisma generate` and restart the dev server."
    );
  }

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }

  return client;
}

export const prisma = getPrismaClient();
