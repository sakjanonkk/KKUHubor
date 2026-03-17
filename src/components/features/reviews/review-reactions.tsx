"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { getOrCreateSessionId } from "@/lib/session";

const REACTIONS = [
  { type: "like", emoji: "\u{1F44D}" },
  { type: "love", emoji: "\u2764\uFE0F" },
  { type: "haha", emoji: "\u{1F602}" },
  { type: "wow", emoji: "\u{1F62E}" },
  { type: "sad", emoji: "\u{1F622}" },
  { type: "angry", emoji: "\u{1F621}" },
] as const;

type ReactionType = (typeof REACTIONS)[number]["type"];

const REACTION_COLORS: Record<ReactionType, string> = {
  like: "text-blue-500 hover:text-blue-600",
  love: "text-red-500 hover:text-red-600",
  haha: "text-amber-500 hover:text-amber-600",
  wow: "text-amber-500 hover:text-amber-600",
  sad: "text-amber-500 hover:text-amber-600",
  angry: "text-orange-600 hover:text-orange-700",
};

interface ReviewReactionsProps {
  reviewId: number;
  initialTotalReactions?: number;
  initialReactionCounts?: Record<string, number>;
}

export function ReviewReactions({
  reviewId,
  initialTotalReactions = 0,
  initialReactionCounts = {},
}: ReviewReactionsProps) {
  const [counts, setCounts] = useState<Record<string, number>>(initialReactionCounts);
  const [total, setTotal] = useState(initialTotalReactions);
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const leaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const longPressTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isLongPress = useRef(false);
  const touchHandled = useRef(false);

  const t = useTranslations("Review");

  useEffect(() => {
    const sid = getOrCreateSessionId();
    if (!sid) return;

    fetch(`/api/reactions?reviewId=${reviewId}&sessionId=${sid}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setCounts(data.reactionCounts ?? {});
          setTotal(data.totalReactions ?? 0);
          setUserReaction(data.userReaction ?? null);
        }
      })
      .catch(() => {});
  }, [reviewId]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    return () => {
      clearTimeout(hoverTimer.current);
      clearTimeout(leaveTimer.current);
      clearTimeout(longPressTimer.current);
    };
  }, []);

  const handleReact = useCallback(
    async (type: ReactionType) => {
      if (submitting) return;
      setSubmitting(true);
      setShowPicker(false);

      const sid = getOrCreateSessionId();
      const prev = { counts: { ...counts }, total, userReaction };

      // Optimistic update
      const newCounts = { ...counts };
      let newTotal = total;
      let newUserReaction: ReactionType | null;

      if (userReaction === type) {
        newCounts[type] = Math.max(0, (newCounts[type] || 0) - 1);
        if (newCounts[type] === 0) delete newCounts[type];
        newTotal--;
        newUserReaction = null;
      } else {
        if (userReaction) {
          newCounts[userReaction] = Math.max(
            0,
            (newCounts[userReaction] || 0) - 1
          );
          if (newCounts[userReaction] === 0) delete newCounts[userReaction];
        } else {
          newTotal++;
        }
        newCounts[type] = (newCounts[type] || 0) + 1;
        newUserReaction = type;
      }

      setCounts(newCounts);
      setTotal(Math.max(0, newTotal));
      setUserReaction(newUserReaction);

      try {
        const res = await fetch("/api/reactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reviewId,
            sessionId: sid,
            reactionType: type,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setCounts(data.reactionCounts ?? {});
          setTotal(data.totalReactions ?? 0);
          setUserReaction(data.userReaction ?? null);
        } else {
          setCounts(prev.counts);
          setTotal(prev.total);
          setUserReaction(prev.userReaction);
          toast.error(t("reactionError"));
        }
      } catch {
        setCounts(prev.counts);
        setTotal(prev.total);
        setUserReaction(prev.userReaction);
        toast.error(t("reactionError"));
      } finally {
        setSubmitting(false);
      }
    },
    [counts, total, userReaction, reviewId, submitting, t]
  );

  // Top emoji badges (up to 3 most common)
  const topEmojis = Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([type]) => REACTIONS.find((r) => r.type === type)?.emoji)
    .filter(Boolean);

  // Desktop hover
  const onMouseEnter = () => {
    clearTimeout(leaveTimer.current);
    hoverTimer.current = setTimeout(() => setShowPicker(true), 400);
  };

  const onMouseLeave = () => {
    clearTimeout(hoverTimer.current);
    leaveTimer.current = setTimeout(() => setShowPicker(false), 400);
  };

  // Mobile long press
  const onTouchStart = () => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      setShowPicker(true);
    }, 500);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    clearTimeout(longPressTimer.current);
    touchHandled.current = true;
    setTimeout(() => {
      touchHandled.current = false;
    }, 300);

    if (isLongPress.current) {
      e.preventDefault();
      return;
    }

    // Short tap = quick like toggle
    e.preventDefault();
    handleReact((userReaction as ReactionType) || "like");
  };

  // Desktop click
  const handleButtonClick = () => {
    if (touchHandled.current) return;
    if (!showPicker) {
      handleReact((userReaction as ReactionType) || "like");
    }
  };

  const reactionColor = userReaction ? REACTION_COLORS[userReaction] : "";

  return (
    <div
      ref={containerRef}
      className="relative inline-flex"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Reaction Picker Popup */}
      {showPicker && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50"
          onMouseEnter={() => clearTimeout(leaveTimer.current)}
          onMouseLeave={onMouseLeave}
        >
          <div className="bg-background/95 backdrop-blur-sm border border-border rounded-full shadow-xl px-1.5 py-1 flex items-center gap-0.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
            {REACTIONS.map((reaction, i) => (
              <button
                key={reaction.type}
                className={cn(
                  "h-10 w-10 flex items-center justify-center rounded-full transition-all duration-150 select-none",
                  "hover:scale-[1.35] hover:-translate-y-1.5 hover:bg-muted",
                  "active:scale-110",
                  "text-[22px] cursor-pointer",
                  "animate-in zoom-in-50 fade-in fill-mode-both",
                  userReaction === reaction.type && "bg-primary/10 scale-110"
                )}
                style={{ animationDelay: `${i * 40}ms` }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleReact(reaction.type);
                }}
              >
                {reaction.emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Button */}
      <Button
        variant="ghost"
        size="sm"
        className={cn("h-10 px-3 md:h-8 md:px-2 gap-1.5", reactionColor)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onClick={handleButtonClick}
      >
        {total > 0 && topEmojis.length > 0 ? (
          <span className="flex items-center text-base leading-none -space-x-0.5">
            {topEmojis.map((emoji, i) => (
              <span key={i}>{emoji}</span>
            ))}
          </span>
        ) : (
          <span className="text-base leading-none">{"\u{1F44D}"}</span>
        )}
        <span className="text-xs font-semibold">{total}</span>
      </Button>
    </div>
  );
}
