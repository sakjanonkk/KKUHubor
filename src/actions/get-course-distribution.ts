"use server";

import { prisma } from "@/lib/database";

export async function getCourseLikeStats(courseId: number): Promise<{
  totalReviews: number;
  totalReactions: number;
}> {
  if (!courseId) {
    return { totalReviews: 0, totalReactions: 0 };
  }

  try {
    const reviews = await prisma.reviews.findMany({
      where: { course_id: courseId },
      include: {
        _count: { select: { review_reactions: true } },
      },
    });

    const totalReactions = reviews.reduce(
      (sum, r) => sum + r._count.review_reactions,
      0
    );

    return { totalReviews: reviews.length, totalReactions };
  } catch (error) {
    console.error("Failed to fetch like stats", error);
    return { totalReviews: 0, totalReactions: 0 };
  }
}
