console.log("Seed script starting...");
try {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    console.log("Prisma client initialized");
} catch (e) {
    console.error("Error initializing prisma:", e);
}
