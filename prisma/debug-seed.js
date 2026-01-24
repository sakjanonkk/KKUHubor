console.log("Debug Seed starting...");
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Defined" : "Undefined");

try {
    require('dotenv').config();
    console.log("Loaded dotenv");
    console.log("DATABASE_URL after load:", process.env.DATABASE_URL ? "Defined" : "Undefined");
} catch (e) {
    console.log("dotenv not found or failed to load");
}

try {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    console.log("Prisma client initialized");
    prisma.$connect().then(() => {
        console.log("Connected to DB");
        return prisma.$disconnect();
    }).catch(e => {
        console.error("Failed to connect:", e);
    });
} catch (e) {
    console.error("Error initializing prisma:", e);
}
