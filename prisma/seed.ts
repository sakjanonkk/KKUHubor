import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import coursesData from "./courses-data.json";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // ============================================================
  // 1. ADMIN USER (only admin, no demo users)
  // ============================================================
  await prisma.users.upsert({
    where: { email: "admin@kkuhubor.com" },
    update: {},
    create: {
      username: "admin",
      email: "admin@kkuhubor.com",
      password_hash: await bcrypt.hash("%3N23MgR7Gyt5p5", 10),
      role: "admin",
      image: "https://ui-avatars.com/api/?name=Admin&background=6366f1&color=fff",
    },
  });
  console.log(`✓ Admin user seeded`);

  // ============================================================
  // 2. FACULTIES (24 faculties matching real KKU data)
  // ============================================================
  const facultiesData = [
    { name_th: "คณะวิทยาศาสตร์", name_en: "Faculty of Science", color_code: "#FFD700" },
    { name_th: "คณะวิศวกรรมศาสตร์", name_en: "Faculty of Engineering", color_code: "#B22222" },
    { name_th: "คณะสหวิทยาการ", name_en: "Faculty of Interdisciplinary Studies", color_code: "#6A5ACD" },
    { name_th: "คณะมนุษยศาสตร์และสังคมศาสตร์", name_en: "Faculty of Humanities and Social Sciences", color_code: "#4169E1" },
    { name_th: "คณะแพทยศาสตร์", name_en: "Faculty of Medicine", color_code: "#008000" },
    { name_th: "คณะศิลปกรรมศาสตร์", name_en: "Faculty of Fine and Applied Arts", color_code: "#C71585" },
    { name_th: "คณะศึกษาศาสตร์", name_en: "Faculty of Education", color_code: "#FFA500" },
    { name_th: "คณะเภสัชศาสตร์", name_en: "Faculty of Pharmaceutical Sciences", color_code: "#DA70D6" },
    { name_th: "คณะเกษตรศาสตร์", name_en: "Faculty of Agriculture", color_code: "#228B22" },
    { name_th: "คณะบริหารธุรกิจและการบัญชี", name_en: "Faculty of Business Administration and Accountancy", color_code: "#4682B4" },
    { name_th: "วิทยาลัยการคอมพิวเตอร์", name_en: "College of Computing", color_code: "#00CED1" },
    { name_th: "วิทยาลัยนานาชาติ", name_en: "International College", color_code: "#FF8C00" },
    { name_th: "คณะเทคโนโลยี", name_en: "Faculty of Technology", color_code: "#FF6347" },
    { name_th: "คณะสถาปัตยกรรมศาสตร์", name_en: "Faculty of Architecture", color_code: "#CD853F" },
    { name_th: "คณะเทคนิคการแพทย์", name_en: "Faculty of Associated Medical Sciences", color_code: "#20B2AA" },
    { name_th: "คณะสัตวแพทยศาสตร์", name_en: "Faculty of Veterinary Medicine", color_code: "#8B4513" },
    { name_th: "คณะทันตแพทยศาสตร์", name_en: "Faculty of Dentistry", color_code: "#48D1CC" },
    { name_th: "คณะสาธารณสุขศาสตร์", name_en: "Faculty of Public Health", color_code: "#3CB371" },
    { name_th: "วิทยาลัยการปกครองท้องถิ่น", name_en: "College of Local Administration", color_code: "#800080" },
    { name_th: "คณะเศรษฐศาสตร์", name_en: "Faculty of Economics", color_code: "#DAA520" },
    { name_th: "คณะนิติศาสตร์", name_en: "Faculty of Law", color_code: "#2F4F4F" },
    { name_th: "คณะพยาบาลศาสตร์", name_en: "Faculty of Nursing", color_code: "#FF69B4" },
    { name_th: "สถาบันการสอนวิชาศึกษาทั่วไป", name_en: "Institute of General Education", color_code: "#708090" },
    { name_th: "สถาบันภาษา", name_en: "Language Institute", color_code: "#778899" },
  ];

  const faculties: Record<string, number> = {};
  for (const f of facultiesData) {
    const exists = await prisma.faculties.findFirst({ where: { name_th: f.name_th } });
    if (exists) {
      faculties[f.name_th] = exists.faculty_id;
    } else {
      const created = await prisma.faculties.create({ data: f });
      faculties[f.name_th] = created.faculty_id;
    }
  }
  console.log(`✓ Faculties seeded: ${Object.keys(faculties).length}`);

  // ============================================================
  // 3. COURSES (real KKU courses from Excel data)
  // ============================================================
  let skipped = 0;
  const coursesToCreate = coursesData
    .filter((c) => {
      if (!faculties[c.faculty]) {
        skipped++;
        return false;
      }
      return true;
    })
    .map((c) => ({
      code: c.code,
      nameTH: c.nameTH,
      nameEN: c.nameEN || undefined,
      facultyId: faculties[c.faculty],
    }));

  await prisma.course.createMany({
    data: coursesToCreate,
    skipDuplicates: true,
  });

  const totalCourses = await prisma.course.count();
  console.log(`✓ Courses seeded: ${totalCourses} (skipped ${skipped} with unknown faculty)`);

  // ============================================================
  // DONE
  // ============================================================
  console.log("\n🎉 Database seeded successfully!");
  console.log(`   Admin: 1`);
  console.log(`   Faculties: ${Object.keys(faculties).length}`);
  console.log(`   Courses: ${totalCourses}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
