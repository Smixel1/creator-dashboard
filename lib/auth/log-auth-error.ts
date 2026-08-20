import { Prisma } from "@/lib/generated/prisma/client";

export function logAuthError(scope: string, error: unknown): void {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.error(`[${scope}] Prisma error`, {
      code: error.code,
      meta: error.meta,
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    console.error(`[${scope}] Prisma initialization error`, {
      name: error.name,
      message: error.message,
      errorCode: error.errorCode,
    });
    return;
  }

  if (error instanceof Error) {
    console.error(`[${scope}]`, {
      name: error.name,
      message: error.message,
    });
    return;
  }

  console.error(`[${scope}]`, error);
}

export function isAuthConfigReady(): boolean {
  return Boolean(process.env.AUTH_SECRET?.trim());
}
