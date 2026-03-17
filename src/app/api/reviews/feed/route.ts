import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(20, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const sort = searchParams.get("sort") === "popular" ? "popular" : "latest";
    const offset = (page - 1) * limit;

    const orderClause =
      sort === "popular"
        ? "like_count DESC, r.created_at DESC"
        : "r.created_at DESC";

    const [reviewsResult, countResult] = await Promise.all([
      db.query(
        `SELECT
          r.review_id,
          r.course_id,
          r.content,
          r.created_at,
          r.reviewer_name,
          r.grade_received,
          r.semester,
          r.session_id,
          r.avatar_style,
          r.avatar_seed,
          c.course_code,
          c.name_en,
          c.name_th,
          (SELECT COUNT(*)::int FROM review_likes rl WHERE rl.review_id = r.review_id) as like_count,
          (SELECT COUNT(*)::int FROM comments cm WHERE cm.review_id = r.review_id) as comment_count
        FROM reviews r
        JOIN courses c ON r.course_id = c.course_id
        ORDER BY ${orderClause}
        LIMIT $1 OFFSET $2`,
        [limit, offset]
      ),
      db.query("SELECT COUNT(*)::int as total FROM reviews"),
    ]);

    const totalCount = countResult.rows[0].total;
    const totalPages = Math.ceil(totalCount / limit);

    const reviews = reviewsResult.rows.map((row: any) => ({
      id: row.review_id,
      courseId: row.course_id,
      content: row.content,
      createdAt: row.created_at,
      reviewerName: row.reviewer_name || "Anonymous",
      gradeReceived: row.grade_received,
      semester: row.semester,
      sessionId: row.session_id,
      avatarStyle: row.avatar_style,
      avatarSeed: row.avatar_seed,
      likeCount: row.like_count,
      commentCount: row.comment_count,
      course: {
        code: row.course_code,
        nameEN: row.name_en,
        nameTH: row.name_th,
      },
    }));

    return NextResponse.json({
      reviews,
      totalCount,
      totalPages,
      currentPage: page,
      hasMore: page < totalPages,
    });
  } catch (error) {
    console.error("Feed API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
