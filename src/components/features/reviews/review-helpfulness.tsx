"use client";

import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { getOrCreateSessionId } from "@/lib/session";

interface ReviewHelpfulnessProps {
  reviewId: number;
  initialHelpfulCount?: number;
  initialNotHelpfulCount?: number;
}

export function ReviewHelpfulness({
  reviewId,
  initialHelpfulCount = 0,
  initialNotHelpfulCount = 0,
}: ReviewHelpfulnessProps) {
  const [helpfulCount, setHelpfulCount] = useState(initialHelpfulCount);
  const [notHelpfulCount, setNotHelpfulCount] = useState(initialNotHelpfulCount);
  const [userVote, setUserVote] = useState<"helpful" | "not_helpful" | null>(null);
  const t = useTranslations("Review");

  useEffect(() => {
    const sessionId = getOrCreateSessionId();
    if (!sessionId) return;

    fetch(`/api/helpfulness?reviewId=${reviewId}&sessionId=${sessionId}`)
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data) {
          setHelpfulCount(data.helpfulCount);
          setNotHelpfulCount(data.notHelpfulCount);
          setUserVote(data.userVote ?? null);
        }
      })
      .catch(() => {
        // Silently fail — keep initial counts
      });
  }, [reviewId]);

  const handleVote = async (voteType: "helpful" | "not_helpful") => {
    const sessionId = getOrCreateSessionId();

    // Save previous state for revert
    const prevHelpfulCount = helpfulCount;
    const prevNotHelpfulCount = notHelpfulCount;
    const prevUserVote = userVote;

    // Optimistic update
    if (userVote === voteType) {
      // Un-vote: clicking the same vote again
      setUserVote(null);
      if (voteType === "helpful") {
        setHelpfulCount((c) => c - 1);
      } else {
        setNotHelpfulCount((c) => c - 1);
      }
    } else {
      // Switch vote or new vote
      if (userVote === "helpful") {
        setHelpfulCount((c) => c - 1);
      } else if (userVote === "not_helpful") {
        setNotHelpfulCount((c) => c - 1);
      }

      setUserVote(voteType);
      if (voteType === "helpful") {
        setHelpfulCount((c) => c + 1);
      } else {
        setNotHelpfulCount((c) => c + 1);
      }
    }

    try {
      const res = await fetch("/api/helpfulness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, sessionId, vote: voteType }),
      });

      if (res.ok) {
        const data = await res.json();
        setHelpfulCount(data.helpfulCount);
        setNotHelpfulCount(data.notHelpfulCount);
        setUserVote(data.userVote ?? null);
      } else {
        // Revert on failure
        setHelpfulCount(prevHelpfulCount);
        setNotHelpfulCount(prevNotHelpfulCount);
        setUserVote(prevUserVote);
        toast.error(t("helpfulError"));
      }
    } catch {
      // Revert on failure
      setHelpfulCount(prevHelpfulCount);
      setNotHelpfulCount(prevNotHelpfulCount);
      setUserVote(prevUserVote);
      toast.error(t("helpfulError"));
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-10 px-3 md:h-8 md:px-2 gap-1.5",
          userVote === "helpful" && "text-emerald-500 hover:text-emerald-600"
        )}
        onClick={() => handleVote("helpful")}
      >
        <ThumbsUp
          className={cn("h-4 w-4", userVote === "helpful" && "fill-current")}
        />
        <span className="text-xs font-semibold">{helpfulCount}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-10 px-3 md:h-8 md:px-2 gap-1.5",
          userVote === "not_helpful" && "text-red-500 hover:text-red-600"
        )}
        onClick={() => handleVote("not_helpful")}
      >
        <ThumbsDown
          className={cn(
            "h-4 w-4",
            userVote === "not_helpful" && "fill-current"
          )}
        />
        <span className="text-xs font-semibold">{notHelpfulCount}</span>
      </Button>
    </div>
  );
}
