"use server";

import { prisma } from "@/lib/database";
import { CourseCategory, GradingType } from "@/lib/enums";

export type Course = {
  id: number;
  code: string;
  nameTH: string;
  nameEN: string | null;
  facultyId: number | null;
  facultyNameTH: string | null;
  facultyNameEN: string | null;
  facultyColor: string | null;
  tags: string[];
  totalLikes: number;
  reviewCount: number;
};

export type SortOption =
  | "reviews_desc"
  | "likes_desc"
  | "name_asc"
  | "name_desc"
  | "code_asc";

export interface GetCoursesParams {
  query?: string;
  category?: CourseCategory;
  gradingType?: GradingType;
  facultyId?: number;
  hasReviews?: boolean;
  sortBy?: SortOption;
  page?: number;
  pageSize?: number;
}

export interface GetCoursesResult {
  courses: Course[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export async function getCourses(
  queryStr?: string,
  category?: CourseCategory,
  gradingType?: GradingType,
  facultyId?: number,
  hasReviews?: boolean,
  sortBy?: SortOption,
  page: number = 1,
  pageSize: number = 12
): Promise<GetCoursesResult> {
  try {
    const whereClause: any = {};

    // Text search
    if (queryStr) {
      whereClause.OR = [
        { nameTH: { contains: queryStr, mode: "insensitive" } },
        { nameEN: { contains: queryStr, mode: "insensitive" } },
        { code: { contains: queryStr, mode: "insensitive" } },
      ];
    }

    // Category filter
    if (category) {
      whereClause.category = category;
    }

    // Grading type filter
    if (gradingType) {
      whereClause.gradingType = gradingType;
    }

    // Faculty filter
    if (facultyId) {
      whereClause.facultyId = facultyId;
    }

    // Has reviews filter
    if (hasReviews) {
      whereClause.reviews = { some: {} };
    }

    // Prisma findMany with relations
    const courses = await prisma.course.findMany({
      where: whereClause,
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

    // Transform and calculate aggregates
    let formattedCourses = courses.map((c: any) => {
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

    // Apply sorting
    const sortOption = sortBy || "reviews_desc";

    formattedCourses.sort((a: Course, b: Course) => {
      switch (sortOption) {
        case "reviews_desc":
          if (b.reviewCount !== a.reviewCount) {
            return b.reviewCount - a.reviewCount;
          }
          return a.code.localeCompare(b.code);

        case "likes_desc":
          if (b.totalLikes !== a.totalLikes) {
            return b.totalLikes - a.totalLikes;
          }
          return b.reviewCount - a.reviewCount;

        case "name_asc":
          return a.nameTH.localeCompare(b.nameTH, "th");

        case "name_desc":
          return b.nameTH.localeCompare(a.nameTH, "th");

        case "code_asc":
          return a.code.localeCompare(b.code);

        default:
          return b.reviewCount - a.reviewCount;
      }
    });

    // Apply pagination
    const totalCount = formattedCourses.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const currentPage = Math.min(Math.max(1, page), totalPages);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedCourses = formattedCourses.slice(startIndex, startIndex + pageSize);

    return {
      courses: paginatedCourses,
      totalCount,
      totalPages,
      currentPage,
    };
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    return { courses: [], totalCount: 0, totalPages: 1, currentPage: 1 };
  }
}
