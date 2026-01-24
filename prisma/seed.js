require('dotenv').config();
const { PrismaClient } = require("@prisma/client");
const { PrismaNeon } = require("@prisma/adapter-neon");
const { Pool } = require("@neondatabase/serverless");
const ws = require("ws");

// Configure Neon to use websocket
const { neonConfig } = require('@neondatabase/serverless');
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Seeding database...");

    // 1. Create Admin User
    const adminEmail = "admin@example.com";
    const adminUsername = "admin";

    try {
        const admin = await prisma.users.upsert({
            where: { email: adminEmail },
            update: {},
            create: {
                username: adminUsername,
                email: adminEmail,
                password_hash: "admin", // Plain text as per project config
                role: "admin",
                image: "https://ui-avatars.com/api/?name=Admin&background=random",
            },
        });
        console.log("Admin user seeded:", admin.username);
    } catch (e) {
        console.error("Error seeding admin:", e);
    }

    // 2. Create Faculties
    const facultiesData = [
        { name_th: "คณะวิศวกรรมศาสตร์", name_en: "Faculty of Engineering", color_code: "#B22222" },
        { name_th: "คณะวิทยาศาสตร์", name_en: "Faculty of Science", color_code: "#FFD700" },
        { name_th: "คณะมนุษยศาสตร์และสังคมศาสตร์", name_en: "Faculty of Humanities and Social Sciences", color_code: "#FFFFFF" },
        { name_th: "คณะศึกษาศาสตร์", name_en: "Faculty of Education", color_code: "#FFA500" },
        { name_th: "คณะพยาบาลศาสตร์", name_en: "Faculty of Nursing", color_code: "#FF69B4" },
        { name_th: "คณะแพทยศาสตร์", name_en: "Faculty of Medicine", color_code: "#008000" },
        { name_th: "วิทยาลัยการปกครองท้องถิ่น", name_en: "College of Local Administration", color_code: "#800080" },
    ];

    for (const faculty of facultiesData) {
        try {
            const exists = await prisma.faculties.findFirst({
                where: { name_th: faculty.name_th }
            });

            if (!exists) {
                await prisma.faculties.create({ data: faculty });
            }
        } catch (e) {
            console.error("Error seeding faculty " + faculty.name_en, e);
        }
    }
    console.log("Faculties seeded");

    // 3. Create Basic Users (Optional)
    try {
        const user1 = await prisma.users.upsert({
            where: { email: "student1@example.com" },
            update: {},
            create: {
                username: "student1",
                email: "student1@example.com",
                password_hash: "1234",
                role: "user",
            }
        });
        console.log("Student seeded:", user1.username);
    } catch (e) {
        console.error("Error seeding student:", e);
    }


    // 4. Create Some Courses
    try {
        const facultyEng = await prisma.faculties.findFirst({ where: { name_en: "Faculty of Engineering" } });

        if (facultyEng) {
            await prisma.course.upsert({
                where: { code: "EN811301" },
                update: {},
                create: {
                    code: "EN811301",
                    nameTH: "การเขียนโปรแกรมคอมพิวเตอร์",
                    nameEN: "Computer Programming",
                    facultyId: facultyEng.faculty_id,
                    gradingType: "NORM",
                    category: "MAJOR",
                    tags: ["Programming", "Coding", "Basic"]
                }
            });

            await prisma.course.upsert({
                where: { code: "EN811302" },
                update: {},
                create: {
                    code: "EN811302",
                    nameTH: "แคลคูลัส 1",
                    nameEN: "Calculus 1",
                    facultyId: facultyEng.faculty_id,
                    gradingType: "CRITERION",
                    category: "MAJOR",
                    tags: ["Math", "Hard"]
                }
            });
            console.log("Courses seeded");
        }
    } catch (e) {
        console.error("Error seeding courses:", e);
    }

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
