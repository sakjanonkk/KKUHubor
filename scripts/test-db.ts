import { prisma } from "../src/lib/database";

// Load environment variables (Node 20.6+)
try {
  process.loadEnvFile();
  console.log("✅ Environment loaded");
} catch (e) {
  console.warn("⚠️ Could not load .env file (maybe already loaded or missing)");
}

async function main() {
  console.log("🚀 Testing Prisma Connection with Adapter...");
  // console.log("Prisma object:", prisma); // Careful logging full object

  try {
    const count = await prisma.course.count();
    console.log(`✅ Connection Successful! Found ${count} courses.`);
  } catch (error) {
    console.error("❌ Connection Failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
