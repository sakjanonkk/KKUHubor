import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  console.log("[database.ts] DATABASE_URL exists:", !!connectionString);

  if (!connectionString) {
    throw new Error("DATABASE_URL is missing in environment variables");
  }

  console.log("[database.ts] Creating new PrismaClient...");

  return new PrismaClient({
    log: ["warn", "error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
