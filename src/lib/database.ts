import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = global as unknown as {
  prismaV4: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  console.log("[database.ts] DATABASE_URL exists:", !!connectionString);

  if (!connectionString) {
    throw new Error("DATABASE_URL is missing in environment variables");
  }

  console.log("[database.ts] Creating new PrismaClient with pg adapter...");

  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({
    adapter,
    log: ["warn", "error"],
  });
}

export const prisma = globalForPrisma.prismaV4 ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaV4 = prisma;
}
