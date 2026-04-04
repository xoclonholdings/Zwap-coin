import React, { useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import BadgeItem from "./BadgeItem";
import { BADGES } from "./badgeData";

function normalizeBadgeState(badge, earnedBadgeIds = [], badgeProgress = {}) {
  const earned = earnedBadgeIds.includes(badge.id);
  const rawProgress = badgeProgress?.[badge.id] ?? badgeProgress?.[badge.progressKey] ?? 0;
  const progress = earned ? 1 : Math.max(0, Math.min(1, Number(rawProgress) || 0));

  return {
    ...badge,
    earned,
    progress,
  };
}

export default function BadgeStrip({
  earnedBadgeIds = [],
  badgeProgress = {},
  title = "Badges",
}) {
  const scrollRef = useRef(null);

  const badges = useMemo(() => {
    return BADGES.map((badge) =>
      normalizeBadgeState(badge, earnedBadgeIds, badgeProgress)
    );
  }, [earnedBadgeIds, badgeProgress]);

  const scrollByAmount = (direction = 1) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction * 220,
      behavior: "smooth",
    });
  };

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-400">
          {title}
        </h3>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollByAmount(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-gray-400 transition hover:bg-white/[0.06] hover:text-white"
            aria-label="Scroll badges left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => scrollByAmount(1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-gray-400 transition hover:bg-white/[0.06] hover:text-white"
            aria-label="Scroll badges right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {badges.map((badge) => (
          <BadgeItem
            key={badge.id}
            badge={badge}
            progress={badge.progress}
            earned={badge.earned}
          />
        ))}
      </div>
    </div>
  );
}