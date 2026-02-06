import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // ============================================================
  // 1. USERS
  // ============================================================
  const admin = await prisma.users.upsert({
    where: { email: "admin@kkuhubor.com" },
    update: {},
    create: {
      username: "admin",
      email: "admin@kkuhubor.com",
      password_hash: "admin",
      role: "admin",
      image: "https://ui-avatars.com/api/?name=Admin&background=6366f1&color=fff",
    },
  });

  const usersData = [
    { username: "somchai", email: "somchai@kku.ac.th", password_hash: "1234", role: "user" },
    { username: "somsri", email: "somsri@kku.ac.th", password_hash: "1234", role: "user" },
    { username: "prayut", email: "prayut@kku.ac.th", password_hash: "1234", role: "user" },
    { username: "naphat", email: "naphat@kku.ac.th", password_hash: "1234", role: "user" },
    { username: "kanya", email: "kanya@kku.ac.th", password_hash: "1234", role: "user" },
    { username: "wichai", email: "wichai@kku.ac.th", password_hash: "1234", role: "user" },
    { username: "pornpan", email: "pornpan@kku.ac.th", password_hash: "1234", role: "user" },
    { username: "thana", email: "thana@kku.ac.th", password_hash: "1234", role: "user" },
    { username: "suda", email: "suda@kku.ac.th", password_hash: "1234", role: "user" },
    { username: "arthit", email: "arthit@kku.ac.th", password_hash: "1234", role: "user" },
  ];

  const users = [admin];
  for (const u of usersData) {
    const user = await prisma.users.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
    users.push(user);
  }
  console.log(`✓ Users seeded: ${users.length}`);

  // ============================================================
  // 2. FACULTIES
  // ============================================================
  const facultiesData = [
    { name_th: "คณะวิศวกรรมศาสตร์", name_en: "Faculty of Engineering", color_code: "#B22222" },
    { name_th: "คณะวิทยาศาสตร์", name_en: "Faculty of Science", color_code: "#FFD700" },
    { name_th: "คณะมนุษยศาสตร์และสังคมศาสตร์", name_en: "Faculty of Humanities and Social Sciences", color_code: "#4169E1" },
    { name_th: "คณะศึกษาศาสตร์", name_en: "Faculty of Education", color_code: "#FFA500" },
    { name_th: "คณะพยาบาลศาสตร์", name_en: "Faculty of Nursing", color_code: "#FF69B4" },
    { name_th: "คณะแพทยศาสตร์", name_en: "Faculty of Medicine", color_code: "#008000" },
    { name_th: "วิทยาลัยการปกครองท้องถิ่น", name_en: "College of Local Administration", color_code: "#800080" },
    { name_th: "คณะเกษตรศาสตร์", name_en: "Faculty of Agriculture", color_code: "#228B22" },
    { name_th: "คณะเทคนิคการแพทย์", name_en: "Faculty of Associated Medical Sciences", color_code: "#20B2AA" },
    { name_th: "คณะเภสัชศาสตร์", name_en: "Faculty of Pharmaceutical Sciences", color_code: "#DA70D6" },
    { name_th: "คณะสถาปัตยกรรมศาสตร์", name_en: "Faculty of Architecture", color_code: "#CD853F" },
    { name_th: "คณะบริหารธุรกิจและการบัญชี", name_en: "Faculty of Business Administration and Accountancy", color_code: "#4682B4" },
    { name_th: "คณะนิติศาสตร์", name_en: "Faculty of Law", color_code: "#2F4F4F" },
    { name_th: "คณะเทคโนโลยี", name_en: "Faculty of Technology", color_code: "#FF6347" },
    { name_th: "คณะสัตวแพทยศาสตร์", name_en: "Faculty of Veterinary Medicine", color_code: "#8B4513" },
  ];

  const faculties: Record<string, number> = {};
  for (const f of facultiesData) {
    const exists = await prisma.faculties.findFirst({ where: { name_th: f.name_th } });
    if (exists) {
      faculties[f.name_en] = exists.faculty_id;
    } else {
      const created = await prisma.faculties.create({ data: f });
      faculties[f.name_en] = created.faculty_id;
    }
  }
  console.log(`✓ Faculties seeded: ${Object.keys(faculties).length}`);

  // ============================================================
  // 3. COURSES (30+ courses across faculties)
  // ============================================================
  const coursesData = [
    // วิศวกรรมศาสตร์
    { code: "EN811301", nameTH: "การเขียนโปรแกรมคอมพิวเตอร์", nameEN: "Computer Programming", faculty: "Faculty of Engineering", category: "MAJOR" as const, gradingType: "NORM" as const, tags: ["Programming", "Coding", "Python"] },
    { code: "EN811302", nameTH: "แคลคูลัส 1", nameEN: "Calculus 1", faculty: "Faculty of Engineering", category: "MAJOR" as const, gradingType: "CRITERION" as const, tags: ["Math", "Calculus"] },
    { code: "EN811201", nameTH: "วงจรไฟฟ้า", nameEN: "Electric Circuits", faculty: "Faculty of Engineering", category: "MAJOR" as const, gradingType: "NORM" as const, tags: ["Electrical", "Circuit"] },
    { code: "EN811102", nameTH: "ฟิสิกส์สำหรับวิศวกร", nameEN: "Physics for Engineers", faculty: "Faculty of Engineering", category: "MAJOR" as const, gradingType: "NORM" as const, tags: ["Physics", "Engineering"] },
    { code: "EN811401", nameTH: "โครงสร้างข้อมูลและอัลกอริทึม", nameEN: "Data Structures and Algorithms", faculty: "Faculty of Engineering", category: "MAJOR" as const, gradingType: "NORM" as const, tags: ["Programming", "Algorithm", "DSA"] },
    { code: "EN811402", nameTH: "ระบบปฏิบัติการ", nameEN: "Operating Systems", faculty: "Faculty of Engineering", category: "MAJOR" as const, gradingType: "NORM" as const, tags: ["OS", "Linux", "System"] },

    // วิทยาศาสตร์
    { code: "SC301101", nameTH: "เคมีทั่วไป", nameEN: "General Chemistry", faculty: "Faculty of Science", category: "MAJOR" as const, gradingType: "NORM" as const, tags: ["Chemistry", "Lab"] },
    { code: "SC301102", nameTH: "ชีววิทยาทั่วไป", nameEN: "General Biology", faculty: "Faculty of Science", category: "MAJOR" as const, gradingType: "NORM" as const, tags: ["Biology", "Lab"] },
    { code: "SC301201", nameTH: "สถิติเบื้องต้น", nameEN: "Introduction to Statistics", faculty: "Faculty of Science", category: "MAJOR" as const, gradingType: "CRITERION" as const, tags: ["Statistics", "Math"] },
    { code: "SC301301", nameTH: "คณิตศาสตร์เชิงเส้น", nameEN: "Linear Algebra", faculty: "Faculty of Science", category: "MAJOR" as const, gradingType: "NORM" as const, tags: ["Math", "Algebra"] },

    // มนุษยศาสตร์
    { code: "HS411101", nameTH: "ภาษาอังกฤษพื้นฐาน", nameEN: "Foundation English", faculty: "Faculty of Humanities and Social Sciences", category: "GENERAL" as const, gradingType: "NORM" as const, tags: ["English", "Language"] },
    { code: "HS411102", nameTH: "ภาษาอังกฤษเพื่อการสื่อสาร", nameEN: "English for Communication", faculty: "Faculty of Humanities and Social Sciences", category: "GENERAL" as const, gradingType: "NORM" as const, tags: ["English", "Communication"] },
    { code: "HS411201", nameTH: "ปรัชญาเบื้องต้น", nameEN: "Introduction to Philosophy", faculty: "Faculty of Humanities and Social Sciences", category: "GENERAL" as const, gradingType: "CRITERION" as const, tags: ["Philosophy", "Thinking"] },
    { code: "HS411301", nameTH: "จิตวิทยาทั่วไป", nameEN: "General Psychology", faculty: "Faculty of Humanities and Social Sciences", category: "GENERAL" as const, gradingType: "NORM" as const, tags: ["Psychology", "Social"] },
    { code: "HS411401", nameTH: "ภาษาจีนเบื้องต้น", nameEN: "Basic Chinese", faculty: "Faculty of Humanities and Social Sciences", category: "ELECTIVE" as const, gradingType: "NORM" as const, tags: ["Chinese", "Language"] },

    // ศึกษาศาสตร์
    { code: "ED201101", nameTH: "จิตวิทยาการศึกษา", nameEN: "Educational Psychology", faculty: "Faculty of Education", category: "MAJOR" as const, gradingType: "NORM" as const, tags: ["Psychology", "Education"] },
    { code: "ED201201", nameTH: "การพัฒนาหลักสูตร", nameEN: "Curriculum Development", faculty: "Faculty of Education", category: "MAJOR" as const, gradingType: "CRITERION" as const, tags: ["Curriculum", "Education"] },

    // พยาบาลศาสตร์
    { code: "NU501101", nameTH: "กายวิภาคศาสตร์", nameEN: "Human Anatomy", faculty: "Faculty of Nursing", category: "MAJOR" as const, gradingType: "NORM" as const, tags: ["Anatomy", "Medical"] },
    { code: "NU501201", nameTH: "การพยาบาลพื้นฐาน", nameEN: "Fundamentals of Nursing", faculty: "Faculty of Nursing", category: "MAJOR" as const, gradingType: "CRITERION" as const, tags: ["Nursing", "Basic"] },

    // แพทยศาสตร์
    { code: "MD601101", nameTH: "สรีรวิทยา", nameEN: "Physiology", faculty: "Faculty of Medicine", category: "MAJOR" as const, gradingType: "CRITERION" as const, tags: ["Medical", "Physiology"] },
    { code: "MD601201", nameTH: "พยาธิวิทยา", nameEN: "Pathology", faculty: "Faculty of Medicine", category: "MAJOR" as const, gradingType: "CRITERION" as const, tags: ["Medical", "Pathology"] },

    // บริหารธุรกิจ
    { code: "BA901101", nameTH: "หลักการบัญชี", nameEN: "Principles of Accounting", faculty: "Faculty of Business Administration and Accountancy", category: "MAJOR" as const, gradingType: "NORM" as const, tags: ["Accounting", "Business"] },
    { code: "BA901201", nameTH: "หลักการตลาด", nameEN: "Principles of Marketing", faculty: "Faculty of Business Administration and Accountancy", category: "MAJOR" as const, gradingType: "NORM" as const, tags: ["Marketing", "Business"] },
    { code: "BA901301", nameTH: "เศรษฐศาสตร์จุลภาค", nameEN: "Microeconomics", faculty: "Faculty of Business Administration and Accountancy", category: "MAJOR" as const, gradingType: "NORM" as const, tags: ["Economics", "Micro"] },

    // นิติศาสตร์
    { code: "LW701101", nameTH: "กฎหมายเบื้องต้น", nameEN: "Introduction to Law", faculty: "Faculty of Law", category: "MAJOR" as const, gradingType: "CRITERION" as const, tags: ["Law", "Basic"] },
    { code: "LW701201", nameTH: "กฎหมายอาญา", nameEN: "Criminal Law", faculty: "Faculty of Law", category: "MAJOR" as const, gradingType: "CRITERION" as const, tags: ["Law", "Criminal"] },

    // เกษตรศาสตร์
    { code: "AG101101", nameTH: "หลักเกษตรศาสตร์", nameEN: "Principles of Agriculture", faculty: "Faculty of Agriculture", category: "MAJOR" as const, gradingType: "NORM" as const, tags: ["Agriculture", "Farming"] },

    // สถาปัตยกรรมศาสตร์
    { code: "AR801101", nameTH: "การออกแบบเบื้องต้น", nameEN: "Introduction to Design", faculty: "Faculty of Architecture", category: "MAJOR" as const, gradingType: "NORM" as const, tags: ["Design", "Architecture"] },

    // GE รายวิชาศึกษาทั่วไป
    { code: "GE001001", nameTH: "ทักษะการเรียนรู้", nameEN: "Learning Skills", faculty: "Faculty of Education", category: "GENERAL" as const, gradingType: "CRITERION" as const, tags: ["GE", "Learning", "Easy"] },
    { code: "GE002001", nameTH: "การคิดเชิงวิเคราะห์", nameEN: "Analytical Thinking", faculty: "Faculty of Science", category: "GENERAL" as const, gradingType: "NORM" as const, tags: ["GE", "Thinking", "Critical"] },
    { code: "GE003001", nameTH: "ศิลปะการใช้ชีวิต", nameEN: "Art of Living", faculty: "Faculty of Humanities and Social Sciences", category: "GENERAL" as const, gradingType: "CRITERION" as const, tags: ["GE", "Life", "Easy"] },
    { code: "GE004001", nameTH: "สุขภาพเพื่อชีวิต", nameEN: "Health for Life", faculty: "Faculty of Medicine", category: "GENERAL" as const, gradingType: "CRITERION" as const, tags: ["GE", "Health", "Easy"] },
    { code: "GE005001", nameTH: "เทคโนโลยีสารสนเทศเบื้องต้น", nameEN: "Introduction to IT", faculty: "Faculty of Engineering", category: "GENERAL" as const, gradingType: "NORM" as const, tags: ["GE", "IT", "Computer"] },
    { code: "GE006001", nameTH: "ภาษาไทยเพื่อการสื่อสาร", nameEN: "Thai for Communication", faculty: "Faculty of Humanities and Social Sciences", category: "GENERAL" as const, gradingType: "CRITERION" as const, tags: ["GE", "Thai", "Language"] },

    // Free elective
    { code: "FE001001", nameTH: "ดนตรีวิจักษ์", nameEN: "Music Appreciation", faculty: "Faculty of Humanities and Social Sciences", category: "FREE_ELECTIVE" as const, gradingType: "CRITERION" as const, tags: ["Music", "Art", "Fun"] },
    { code: "FE002001", nameTH: "กีฬาเพื่อสุขภาพ", nameEN: "Sports for Health", faculty: "Faculty of Education", category: "FREE_ELECTIVE" as const, gradingType: "CRITERION" as const, tags: ["Sports", "Health", "Fun"] },
  ];

  const courseMap: Record<string, number> = {};
  for (const c of coursesData) {
    const course = await prisma.course.upsert({
      where: { code: c.code },
      update: {},
      create: {
        code: c.code,
        nameTH: c.nameTH,
        nameEN: c.nameEN,
        facultyId: faculties[c.faculty],
        category: c.category,
        gradingType: c.gradingType,
        tags: c.tags,
      },
    });
    courseMap[c.code] = course.id;
  }
  console.log(`✓ Courses seeded: ${Object.keys(courseMap).length}`);

  // ============================================================
  // 4. REVIEWS (lots of reviews with varied data)
  // ============================================================
  const reviewerNames = [
    "สมชาย", "สมศรี", "ประยุทธ์", "นภัทร", "กัญญา",
    "วิชัย", "พรพรรณ", "ธนา", "สุดา", "อาทิตย์",
    "มานะ", "วรรณา", "กิตติ", "จินดา", "ปิยะ",
    "รัตนา", "ชัยวัฒน์", "อรุณ", "ศิริพร", "Anonymous",
  ];

  const grades = ["A", "B+", "B", "C+", "C", "D+", "D", "F", "W", "S"];
  const semesters = ["1/2566", "2/2566", "1/2567", "2/2567", "1/2568", "2/2568"];

  const reviewContents: Record<string, string[]> = {
    positive: [
      "วิชานี้สนุกมากครับ อาจารย์สอนเข้าใจง่าย แนะนำเลย",
      "เนื้อหาดีมาก ได้ความรู้เยอะ อาจารย์ใจดี",
      "ชอบมากครับ เรียนแล้วเอาไปใช้ได้จริง",
      "อาจารย์สอนสนุก มีตัวอย่างให้ทำเยอะ ทำให้เข้าใจง่าย",
      "แนะนำมากๆ ครับ วิชานี้ง่ายและได้เกรดดี",
      "เป็นวิชาที่ดีมาก เนื้อหาไม่เยอะ สอบไม่ยาก",
      "ประทับใจมากค่ะ อาจารย์ตั้งใจสอน มี workshop ให้ทำ",
      "วิชานี้เป็นวิชาที่ชอบที่สุดในเทอมนี้เลย",
      "เรียนสนุกมาก มีกิจกรรมกลุ่มเยอะ ได้เพื่อนใหม่ด้วย",
      "คะแนนแบ่งเป็นส่วนๆ ดี ไม่ต้องกังวลเรื่องสอบมาก",
    ],
    neutral: [
      "วิชานี้ก็โอเคครับ ไม่ยากไม่ง่าย",
      "เนื้อหาปานกลาง ต้องอ่านหนังสือเพิ่มเอง",
      "อาจารย์สอนเรื่อยๆ ต้องขยันอ่านเพิ่มเติม",
      "เกรดดิ้งค่อนข้างยาก ต้องตั้งใจเรียน",
      "วิชานี้ต้องทำงานส่งเยอะ แต่ก็ได้ความรู้",
      "สอนตามตำราเป็นหลัก ถ้าอ่านมาก่อนจะเข้าใจง่ายขึ้น",
    ],
    negative: [
      "วิชานี้ยากมากครับ ต้องเตรียมตัวเยอะ",
      "เนื้อหาเยอะมาก อ่านไม่ทัน สอบยาก",
      "อาจารย์สอนเร็วมาก ตามไม่ทัน",
      "ไม่แนะนำถ้าไม่จำเป็น วิชานี้ยากมากจริงๆ",
    ],
  };

  const allReviewContents = [
    ...reviewContents.positive,
    ...reviewContents.neutral,
    ...reviewContents.negative,
  ];

  // Generate session IDs for reviews
  function makeSessionId() {
    return `seed-${Math.random().toString(36).substring(2, 15)}`;
  }

  const reviewIds: number[] = [];
  const courseCodes = Object.keys(courseMap);

  for (const code of courseCodes) {
    const courseId = courseMap[code];
    // 3-8 reviews per course
    const numReviews = 3 + Math.floor(Math.random() * 6);

    for (let i = 0; i < numReviews; i++) {
      const rating = Math.random() < 0.4 ? 5 : Math.random() < 0.5 ? 4 : Math.random() < 0.6 ? 3 : Math.random() < 0.8 ? 2 : 1;
      const reviewer = reviewerNames[Math.floor(Math.random() * reviewerNames.length)];
      const grade = grades[Math.floor(Math.random() * grades.length)];
      const semester = semesters[Math.floor(Math.random() * semesters.length)];
      const content = allReviewContents[Math.floor(Math.random() * allReviewContents.length)];
      const sessionId = makeSessionId();

      const review = await prisma.reviews.create({
        data: {
          course_id: courseId,
          reviewer_name: reviewer,
          rating,
          grade_received: grade,
          semester,
          content,
          status: "approved",
          session_id: sessionId,
        },
      });
      reviewIds.push(review.review_id);
    }
  }
  console.log(`✓ Reviews seeded: ${reviewIds.length}`);

  // ============================================================
  // 5. COMMENTS (on random reviews)
  // ============================================================
  const commentTexts = [
    "เห็นด้วยครับ วิชานี้ดีมาก",
    "ขอบคุณรีวิวนะคะ ช่วยได้เยอะเลย",
    "อาจารย์ท่านไหนสอนคะ?",
    "เทอมนี้ยังเหมือนเดิมไหมครับ",
    "ขอบคุณมากครับ กำลังจะลงเรียน",
    "โหวตให้เลย รีวิวดีมาก",
    "มีสรุปแชร์ไหมครับ 555",
    "ลงเทอมไหนดีครับ 1 หรือ 2",
    "ตรงกับที่เรียนมาเลย",
    "เกรดดิ้งตอนนี้เปลี่ยนไหมครับ",
    "เรียนด้วยคนครับ ยืนยันตามรีวิว",
    "อยากให้มีรีวิวแบบนี้ทุกวิชาเลย",
    "ถ้าเลือกได้จะไม่ลงวิชานี้ 555",
    "อาจารย์ใจดีจริงๆ ครับ",
    "ต้องซื้อหนังสือเพิ่มไหมครับ",
  ];

  const commentAuthorNames = [
    "สมชาย", "น้องมิ้นท์", "พี่แมว", "กัน", "เบลล์",
    "Anonymous", "นักศึกษา EN", "ผ่านมาเม้นท์", "แบม", "อาร์ม",
  ];

  let commentCount = 0;
  // Add 2-5 comments to ~60% of reviews
  for (const reviewId of reviewIds) {
    if (Math.random() > 0.6) continue;
    const numComments = 2 + Math.floor(Math.random() * 4);
    for (let i = 0; i < numComments; i++) {
      await prisma.comments.create({
        data: {
          review_id: reviewId,
          content: commentTexts[Math.floor(Math.random() * commentTexts.length)],
          author_name: commentAuthorNames[Math.floor(Math.random() * commentAuthorNames.length)],
        },
      });
      commentCount++;
    }
  }
  console.log(`✓ Comments seeded: ${commentCount}`);

  // ============================================================
  // 6. REVIEW LIKES (session-based likes)
  // ============================================================
  let likeCount = 0;
  // Like ~50% of reviews with random sessions
  for (const reviewId of reviewIds) {
    if (Math.random() > 0.5) continue;
    const numLikes = 1 + Math.floor(Math.random() * 5);
    for (let i = 0; i < numLikes; i++) {
      try {
        await prisma.review_likes.create({
          data: {
            session_id: makeSessionId(),
            review_id: reviewId,
          },
        });
        likeCount++;
      } catch {
        // Skip duplicate constraint errors
      }
    }
  }
  console.log(`✓ Review likes seeded: ${likeCount}`);

  // ============================================================
  // 7. REPORTS (a few reports on random reviews)
  // ============================================================
  const reportReasons = [
    "เนื้อหาไม่เหมาะสม",
    "ข้อมูลเป็นเท็จ",
    "สแปม",
    "ใช้คำหยาบคาย",
    "ไม่เกี่ยวข้องกับวิชา",
    "โฆษณา",
    "ข้อมูลส่วนตัวของผู้อื่น",
  ];

  let reportCount = 0;
  // Report ~10% of reviews
  for (const reviewId of reviewIds) {
    if (Math.random() > 0.1) continue;
    const status = Math.random() > 0.5 ? "pending" : "dismissed";
    await prisma.reports.create({
      data: {
        review_id: reviewId,
        reason: reportReasons[Math.floor(Math.random() * reportReasons.length)],
        status,
      },
    });
    reportCount++;
  }
  console.log(`✓ Reports seeded: ${reportCount}`);

  // ============================================================
  // 8. COURSE REQUESTS
  // ============================================================
  const courseRequestsData = [
    { courseCode: "EN811501", nameTH: "ปัญญาประดิษฐ์", nameEN: "Artificial Intelligence", faculty: "Faculty of Engineering", status: "pending" },
    { courseCode: "EN811502", nameTH: "การเรียนรู้ของเครื่อง", nameEN: "Machine Learning", faculty: "Faculty of Engineering", status: "pending" },
    { courseCode: "SC301401", nameTH: "ฟิสิกส์ควอนตัม", nameEN: "Quantum Physics", faculty: "Faculty of Science", status: "pending" },
    { courseCode: "BA901401", nameTH: "การเงินธุรกิจ", nameEN: "Business Finance", faculty: "Faculty of Business Administration and Accountancy", status: "approved" },
    { courseCode: "HS411501", nameTH: "ภาษาญี่ปุ่นเบื้องต้น", nameEN: "Basic Japanese", faculty: "Faculty of Humanities and Social Sciences", status: "pending" },
    { courseCode: "HS411502", nameTH: "ภาษาเกาหลีเบื้องต้น", nameEN: "Basic Korean", faculty: "Faculty of Humanities and Social Sciences", status: "rejected" },
    { courseCode: "AG101201", nameTH: "เทคโนโลยีหลังการเก็บเกี่ยว", nameEN: "Postharvest Technology", faculty: "Faculty of Agriculture", status: "pending" },
    { courseCode: "GE007001", nameTH: "ท่องเที่ยวเชิงวัฒนธรรม", nameEN: "Cultural Tourism", faculty: "Faculty of Humanities and Social Sciences", status: "pending" },
    { courseCode: "LW701301", nameTH: "กฎหมายธุรกิจ", nameEN: "Business Law", faculty: "Faculty of Law", status: "approved" },
    { courseCode: "MD601301", nameTH: "เภสัชวิทยา", nameEN: "Pharmacology", faculty: "Faculty of Medicine", status: "pending" },
  ];

  for (const req of courseRequestsData) {
    await prisma.request.create({
      data: {
        courseCode: req.courseCode,
        nameTH: req.nameTH,
        nameEN: req.nameEN,
        facultyId: faculties[req.faculty],
        status: req.status,
      },
    });
  }
  console.log(`✓ Course requests seeded: ${courseRequestsData.length}`);

  // ============================================================
  // 9. TAG REQUESTS
  // ============================================================
  const tagRequestsData = [
    { code: "EN811301", tagName: "Easy A", status: "pending" },
    { code: "EN811301", tagName: "Lab Heavy", status: "approved" },
    { code: "EN811302", tagName: "Hard", status: "approved" },
    { code: "SC301101", tagName: "Lab Required", status: "pending" },
    { code: "SC301101", tagName: "Fun", status: "pending" },
    { code: "HS411101", tagName: "GE ง่าย", status: "approved" },
    { code: "HS411102", tagName: "Speaking", status: "pending" },
    { code: "GE001001", tagName: "นั่งเรียนสบาย", status: "pending" },
    { code: "GE001001", tagName: "ไม่มีสอบ Final", status: "rejected" },
    { code: "GE003001", tagName: "เกรดดี", status: "approved" },
    { code: "GE004001", tagName: "สุขภาพ", status: "pending" },
    { code: "FE001001", tagName: "ดนตรี", status: "approved" },
    { code: "FE002001", tagName: "ออกกำลังกาย", status: "pending" },
    { code: "BA901101", tagName: "ต้องคำนวณเยอะ", status: "pending" },
    { code: "LW701101", tagName: "ท่องจำ", status: "approved" },
  ];

  let tagReqCount = 0;
  for (const tr of tagRequestsData) {
    if (courseMap[tr.code]) {
      await prisma.tagRequest.create({
        data: {
          courseId: courseMap[tr.code],
          tagName: tr.tagName,
          status: tr.status,
        },
      });
      tagReqCount++;
    }
  }
  console.log(`✓ Tag requests seeded: ${tagReqCount}`);

  // ============================================================
  // DONE
  // ============================================================
  console.log("\n🎉 Database seeded successfully!");
  console.log(`   Users: ${users.length}`);
  console.log(`   Faculties: ${Object.keys(faculties).length}`);
  console.log(`   Courses: ${Object.keys(courseMap).length}`);
  console.log(`   Reviews: ${reviewIds.length}`);
  console.log(`   Comments: ${commentCount}`);
  console.log(`   Likes: ${likeCount}`);
  console.log(`   Reports: ${reportCount}`);
  console.log(`   Course Requests: ${courseRequestsData.length}`);
  console.log(`   Tag Requests: ${tagReqCount}`);
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
