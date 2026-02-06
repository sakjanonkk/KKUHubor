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
  avgRating: number;
  reviewCount: number;
  ratingDistribution: number[];
};

export type SortOption =
  | "reviews_desc"
  | "rating_desc"
  | "rating_asc"
  | "name_asc"
  | "name_desc"
  | "code_asc";

export interface GetCoursesParams {
  query?: string;
  category?: CourseCategory;
  gradingType?: GradingType;
  facultyId?: number;
  minRating?: number;
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
  minRating?: number,
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

    // Has reviews filter - move to Prisma where clause
    if (hasReviews) {
      whereClause.reviews = { some: {} };
    }

    // Min rating filter (handled in post-processing since it needs aggregation)

    // Prisma findMany with relations
    const courses = await prisma.course.findMany({
      where: whereClause,
      include: {
        faculty: true,
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    // Transform and calculate aggregates
    let formattedCourses = courses.map((c: any) => {
      const reviewCount = c.reviews.length;
      const totalRating = c.reviews.reduce(
        (acc: number, r: any) => acc + (r.rating || 0),
        0
      );
      const avgRating =
        reviewCount > 0 ? Number((totalRating / reviewCount).toFixed(1)) : 0;

      // Calculate rating distribution [1-star, 2-star, 3-star, 4-star, 5-star]
      const ratingDistribution = [0, 0, 0, 0, 0];
      c.reviews.forEach((r: any) => {
        if (r.rating >= 1 && r.rating <= 5) {
          ratingDistribution[r.rating - 1]++;
        }
      });

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
        avgRating,
        reviewCount,
        ratingDistribution,
      };
    });

    // Apply post-processing filter for minRating (needs aggregation)
    if (minRating && minRating > 0) {
      formattedCourses = formattedCourses.filter(
        (c: Course) => c.avgRating >= minRating
      );
    }

    // Apply sorting
    const sortOption = sortBy || "reviews_desc";

    formattedCourses.sort((a: Course, b: Course) => {
      switch (sortOption) {
        case "reviews_desc":
          if (b.reviewCount !== a.reviewCount) {
            return b.reviewCount - a.reviewCount;
          }
          return a.code.localeCompare(b.code);

        case "rating_desc":
          if (b.avgRating !== a.avgRating) {
            return b.avgRating - a.avgRating;
          }
          return b.reviewCount - a.reviewCount;

        case "rating_asc":
          // Put courses with no reviews at the end
          if (a.reviewCount === 0 && b.reviewCount > 0) return 1;
          if (b.reviewCount === 0 && a.reviewCount > 0) return -1;
          if (a.avgRating !== b.avgRating) {
            return a.avgRating - b.avgRating;
          }
          return a.reviewCount - b.reviewCount;

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
