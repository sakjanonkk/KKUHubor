import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = global as unknown as {
  prismaV4: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  console.log("[database.ts] DATABASE_URL exists:", !!connectionString);

  if (!connectionString) {
    throw new Error("DATABASE_URL is missing in environment variables");
  }

  console.log("[database.ts] Creating new PrismaClient with Neon adapter...");

  const adapter = new PrismaNeon({ connectionString });

  return new PrismaClient({
    adapter,
    log: ["warn", "error"],
  });
}

export const prisma = globalForPrisma.prismaV4 ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaV4 = prisma;
}
