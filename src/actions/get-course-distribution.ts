"use server";

import { prisma } from "@/lib/database";

export type RatingDistribution = {
  rating: number;
  count: number;
  percentage: number;
};

export async function getCourseDistribution(courseId: number): Promise<{
  distribution: RatingDistribution[];
  totalReviews: number;
  averageRating: number;
}> {
  if (!courseId) {
    return { distribution: [], totalReviews: 0, averageRating: 0 };
  }

  try {
    const groupedRatings = await prisma.review.groupBy({
      by: ["rating"],
      where: {
        course_id: courseId,
        rating: { not: null },
      },
      _count: {
        rating: true,
      },
    });

    const totalReviews = groupedRatings.reduce(
      (acc: number, curr: any) => acc + (curr._count.rating || 0),
      0
    );

    const weightedSum = groupedRatings.reduce(
      (acc: number, curr: any) =>
        acc + (curr.rating || 0) * (curr._count.rating || 0),
      0
    );

    const averageRating =
      totalReviews > 0 ? Number((weightedSum / totalReviews).toFixed(1)) : 0;

    // Ensure all 1-5 stars are represented
    const distribution: RatingDistribution[] = Array.from(
      { length: 5 },
      (_, i) => {
        const rating = 5 - i; // 5, 4, 3, 2, 1
        const found = groupedRatings.find((r: any) => r.rating === rating);
        const count = found?._count.rating || 0;
        const percentage =
          totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

        return {
          rating,
          count,
          percentage,
        };
      }
    );

    return {
      distribution,
      totalReviews,
      averageRating,
    };
  } catch (error) {
    console.error("Failed to fetch distribution", error);
    return { distribution: [], totalReviews: 0, averageRating: 0 };
  }
}
