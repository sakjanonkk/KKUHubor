import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { codes } = body;

    if (!codes || !Array.isArray(codes) || codes.length === 0) {
      return NextResponse.json(
        { error: "codes array is required" },
        { status: 400 }
      );
    }

    // Limit to 50 codes to prevent abuse
    const limitedCodes = codes.slice(0, 50);

    const courses = await prisma.course.findMany({
      where: {
        code: {
          in: limitedCodes,
        },
      },
      include: {
        faculty: true,
        reviews: {
          include: {
            _count: {
              select: { review_likes: true },
            },
          },
        },
      },
    });

    // Transform to match the UI's expected shape
    const formattedCourses = courses.map((c: any) => {
      const reviewCount = c.reviews.length;
      const totalLikes = c.reviews.reduce(
        (acc: number, r: any) => acc + (r._count?.review_likes || 0),
        0
      );

      return {
        id: c.id,
        code: c.code,
        nameTH: c.nameTH,
        nameEN: c.nameEN,
        facultyId: c.facultyId,
        facultyNameTH: c.faculty?.name_th || null,
        facultyNameEN: c.faculty?.name_en || null,
        facultyColor: c.faculty?.color_code || null,
        tags: c.tags,
        totalLikes,
        reviewCount,
      };
    });

    return NextResponse.json(formattedCourses);
  } catch (error) {
    console.error("Failed to fetch courses by codes:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
