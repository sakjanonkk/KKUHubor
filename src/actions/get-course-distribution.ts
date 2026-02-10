"use server";

import { prisma } from "@/lib/database";

export async function getCourseLikeStats(courseId: number): Promise<{
  totalLikes: number;
  totalReviews: number;
}> {
  if (!courseId) {
    return { totalLikes: 0, totalReviews: 0 };
  }

  try {
    const reviews = await prisma.reviews.findMany({
      where: { course_id: courseId },
      include: {
        _count: { select: { review_likes: true } },
      },
    });

    const totalLikes = reviews.reduce(
      (sum, r) => sum + r._count.review_likes,
      0
    );

    return { totalLikes, totalReviews: reviews.length };
  } catch (error) {
    console.error("Failed to fetch like stats", error);
    return { totalLikes: 0, totalReviews: 0 };
  }
}
