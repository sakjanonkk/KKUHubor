import { NextResponse } from "next/server";
import db from "@/lib/db";
import { z } from "zod";

// Input validation schemas
const postSchema = z.object({
  reviewId: z.number().positive("Review ID must be a positive number"),
  sessionId: z
    .string()
    .min(1, "Session ID is required")
    .max(255, "Session ID too long"),
  vote: z.enum(["helpful", "not_helpful"]),
});

const getSchema = z.object({
  reviewId: z.coerce
    .number()
    .positive("Review ID must be a positive number"),
  sessionId: z.string().min(1).max(255).optional(),
});

async function getHelpfulnessCounts(reviewId: number) {
  const countQuery = `
    SELECT
      COUNT(*) FILTER (WHERE vote = 'helpful')::int AS helpful_count,
      COUNT(*) FILTER (WHERE vote = 'not_helpful')::int AS not_helpful_count
    FROM review_helpfulness
    WHERE review_id = $1
  `;
  const result = await db.query(countQuery, [reviewId]);
  return {
    helpfulCount: result.rows[0].helpful_count ?? 0,
    notHelpfulCount: result.rows[0].not_helpful_count ?? 0,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate input with Zod
    const validated = postSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { reviewId, sessionId, vote } = validated.data;

    // Check if vote exists
    const checkQuery = `
      SELECT vote_id, vote
      FROM review_helpfulness
      WHERE review_id = $1 AND session_id = $2
    `;
    const existing = await db.query(checkQuery, [reviewId, sessionId]);

    let userVote: "helpful" | "not_helpful" | null;

    if (existing.rows.length > 0) {
      const existingVote = existing.rows[0].vote;
      const existingVoteId = existing.rows[0].vote_id;

      if (existingVote === vote) {
        // Same vote: un-vote (remove it)
        await db.query(
          "DELETE FROM review_helpfulness WHERE vote_id = $1",
          [existingVoteId]
        );
        userVote = null;
      } else {
        // Different vote: update to new vote
        await db.query(
          "UPDATE review_helpfulness SET vote = $1 WHERE vote_id = $2",
          [vote, existingVoteId]
        );
        userVote = vote;
      }
    } else {
      // No vote exists: insert new vote
      await db.query(
        "INSERT INTO review_helpfulness (review_id, session_id, vote) VALUES ($1, $2, $3)",
        [reviewId, sessionId, vote]
      );
      userVote = vote;
    }

    // Get updated counts
    const { helpfulCount, notHelpfulCount } =
      await getHelpfulnessCounts(reviewId);

    return NextResponse.json({
      success: true,
      userVote,
      helpfulCount,
      notHelpfulCount,
    });
  } catch (error) {
    console.error(
      "Helpfulness API Error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // Validate query params with Zod
    const validated = getSchema.safeParse({
      reviewId: searchParams.get("reviewId"),
      sessionId: searchParams.get("sessionId") || undefined,
    });
    if (!validated.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { reviewId, sessionId } = validated.data;

    // Get counts
    const { helpfulCount, notHelpfulCount } =
      await getHelpfulnessCounts(reviewId);

    // Get user's current vote if sessionId provided
    let userVote: "helpful" | "not_helpful" | null = null;
    if (sessionId) {
      const voteQuery = `
        SELECT vote
        FROM review_helpfulness
        WHERE review_id = $1 AND session_id = $2
      `;
      const voteResult = await db.query(voteQuery, [reviewId, sessionId]);
      if (voteResult.rows.length > 0) {
        userVote = voteResult.rows[0].vote;
      }
    }

    return NextResponse.json({
      helpfulCount,
      notHelpfulCount,
      userVote,
    });
  } catch (error) {
    console.error(
      "Helpfulness GET API Error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
