import { NextResponse } from "next/server";
import db from "@/lib/db";
import { z } from "zod";

const VALID_REACTIONS = [
  "like",
  "love",
  "haha",
  "wow",
  "sad",
  "angry",
] as const;

const postSchema = z.object({
  reviewId: z.number().positive(),
  sessionId: z.string().min(1).max(255),
  reactionType: z.enum(VALID_REACTIONS),
});

const getSchema = z.object({
  reviewId: z.coerce.number().positive(),
  sessionId: z.string().min(1).max(255).optional(),
});

async function getReactionData(reviewId: number) {
  const result = await db.query(
    `SELECT reaction_type, COUNT(*)::int AS cnt
     FROM review_reactions
     WHERE review_id = $1
     GROUP BY reaction_type`,
    [reviewId]
  );

  const reactionCounts: Record<string, number> = {};
  let totalReactions = 0;
  for (const row of result.rows) {
    reactionCounts[row.reaction_type] = row.cnt;
    totalReactions += row.cnt;
  }

  return { reactionCounts, totalReactions };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = postSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { reviewId, sessionId, reactionType } = validated.data;

    // Check existing reaction
    const existing = await db.query(
      `SELECT reaction_id, reaction_type
       FROM review_reactions
       WHERE review_id = $1 AND session_id = $2`,
      [reviewId, sessionId]
    );

    let userReaction: string | null;

    if (existing.rows.length > 0) {
      const { reaction_id, reaction_type } = existing.rows[0];

      if (reaction_type === reactionType) {
        // Same reaction: un-react
        await db.query(
          "DELETE FROM review_reactions WHERE reaction_id = $1",
          [reaction_id]
        );
        userReaction = null;
      } else {
        // Different reaction: update
        await db.query(
          "UPDATE review_reactions SET reaction_type = $1 WHERE reaction_id = $2",
          [reactionType, reaction_id]
        );
        userReaction = reactionType;
      }
    } else {
      // New reaction
      await db.query(
        "INSERT INTO review_reactions (review_id, session_id, reaction_type) VALUES ($1, $2, $3)",
        [reviewId, sessionId, reactionType]
      );
      userReaction = reactionType;
    }

    const { reactionCounts, totalReactions } =
      await getReactionData(reviewId);

    return NextResponse.json({
      success: true,
      userReaction,
      reactionCounts,
      totalReactions,
    });
  } catch (error) {
    console.error(
      "Reactions API Error:",
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
    const validated = getSchema.safeParse({
      reviewId: searchParams.get("reviewId"),
      sessionId: searchParams.get("sessionId") || undefined,
    });
    if (!validated.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { reviewId, sessionId } = validated.data;
    const { reactionCounts, totalReactions } =
      await getReactionData(reviewId);

    let userReaction: string | null = null;
    if (sessionId) {
      const result = await db.query(
        `SELECT reaction_type
         FROM review_reactions
         WHERE review_id = $1 AND session_id = $2`,
        [reviewId, sessionId]
      );
      if (result.rows.length > 0) {
        userReaction = result.rows[0].reaction_type;
      }
    }

    return NextResponse.json({
      reactionCounts,
      totalReactions,
      userReaction,
    });
  } catch (error) {
    console.error(
      "Reactions GET API Error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
