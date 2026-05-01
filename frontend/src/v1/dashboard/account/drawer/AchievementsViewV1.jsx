import React from "react";
import { Award, ChevronLeft, Trophy } from "lucide-react";
import { getNextBadge } from "@/lib/badges/getNextBadge";

import BadgeCarouselV1 from "./badges/BadgeCarousel";

function clampPercent(value = 0) {
  const safe = Number(value || 0);
  if (!Number.isFinite(safe)) return 0;
  return Math.max(0, Math.min(100, safe));
}

function ProgressBar({ value = 0, max = 1, tone = "cyan" }) {
  const safeMax = Math.max(1, Number(max || 1));
  const safeValue = Math.max(0, Number(value || 0));
  const percent = clampPercent((safeValue / safeMax) * 100);

  const fill =
    tone === "amber"
      ? "bg-gradient-to-r from-amber-300 via-yellow-300 to-orange-300 shadow-[0_0_14px_rgba(251,191,36,0.2)]"
      : "bg-gradient-to-r from-cyan-400 via-teal-400 to-violet-400 shadow-[0_0_14px_rgba(34,211,238,0.22)]";

  return (
    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
      <div
        className={`h-full rounded-full transition-all duration-300 ${fill}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

function HeaderButton({ children, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="
        flex h-9 w-9 items-center justify-center
        rounded-full
        border border-amber-300/18
        bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.12),rgba(255,255,255,0.04))]
        text-amber-100/78
        shadow-[0_0_14px_rgba(251,191,36,0.08)]
        transition active:scale-[0.97]
      "
    >
      {children}
    </button>
  );
}

function TrophyCard({ trophyCount = 0, trophyBonusPercent = 0 }) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-amber-300/22 bg-[radial-gradient(circle_at_50%_0%,rgba(251,191,36,0.2),transparent_46%),radial-gradient(circle_at_88%_20%,rgba(245,158,11,0.12),transparent_38%),linear-gradient(180deg,rgba(38,28,10,0.96),rgba(10,9,6,0.98))] px-4 py-5 shadow-[0_16px_42px_rgba(0,0,0,0.38),0_0_18px_rgba(251,191,36,0.08)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.065),transparent_34%,rgba(251,191,36,0.06))]" />

      <div className="relative flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-amber-300/28 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.24),rgba(24,18,8,0.96))] text-amber-100 shadow-[0_0_24px_rgba(251,191,36,0.16)]">
          <Trophy size={20} strokeWidth={2.3} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-[16px] font-semibold tracking-[-0.03em] text-white/94">
            Trophy Progress
          </div>

          <div className="mt-1 text-[12px] font-medium text-amber-100/58">
            Permanent bonus +{Number(trophyBonusPercent || 0)}%
          </div>
        </div>

        <div className="text-[28px] font-semibold tracking-[-0.05em] text-amber-100">
          {Number(trophyCount || 0)}
        </div>
      </div>
    </div>
  );
}

function NextBadgeCard({ badge }) {
  const progress = Number(badge?.progress || 0);
  const goal = Math.max(1, Number(badge?.goal || 1));
  const percent = clampPercent((progress / goal) * 100);

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-cyan-300/18 bg-[radial-gradient(circle_at_18%_0%,rgba(34,211,238,0.14),transparent_42%),radial-gradient(circle_at_90%_20%,rgba(168,85,247,0.1),transparent_36%),linear-gradient(180deg,rgba(10,24,34,0.96),rgba(5,9,18,0.98))] p-3.5 shadow-[0_12px_28px_rgba(0,0,0,0.26)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.055),transparent_40%)]" />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border border-cyan-300/22 bg-cyan-400/10 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.12)]">
              <Award size={19} strokeWidth={2.3} />
            </div>

            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-100/62">
                Next Badge
              </div>

              <div className="mt-0.5 text-[17px] font-semibold tracking-[-0.03em] text-white/94">
                {badge?.label || "Starter"}
              </div>
            </div>
          </div>

          <div className="rounded-full border border-cyan-200/12 bg-cyan-300/[0.04] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-cyan-100/56">
            {badge?.category || "Consistency"}
          </div>
        </div>

        <ProgressBar value={progress} max={goal} />

        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="text-[11px] font-semibold text-white/52">
            {progress} / {goal}
          </div>

          <div className="text-[11px] font-semibold tracking-[-0.02em] text-cyan-100">
            {Math.round(percent)}%
          </div>
        </div>

        <div className="mt-2 rounded-[14px] border border-white/8 bg-black/20 px-3 py-2 text-[11px] font-medium leading-4 text-white/56">
          {badge?.hint ||
            "Keep completing real activity to unlock badge progress."}
        </div>
      </div>
    </div>
  );
}

function AchievementCard({ achievement }) {
  const name = achievement?.name || "";
  const level = achievement?.level || "";
  const progress = Number(achievement?.progress || 0);
  const target = Math.max(1, Number(achievement?.target || 1));
  const description = achievement?.description || "";

  return (
    <div className="rounded-[22px] border border-cyan-300/12 bg-[linear-gradient(180deg,rgba(12,24,34,0.94),rgba(6,10,18,0.98))] p-3 shadow-[0_12px_28px_rgba(0,0,0,0.28)]">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border border-cyan-300/18 bg-cyan-400/10 text-cyan-100">
          <Award size={18} strokeWidth={2.2} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold tracking-[-0.02em] text-white/92">
                {name}
              </div>

              {description ? (
                <div className="mt-0.5 line-clamp-2 text-xs leading-5 text-white/50">
                  {description}
                </div>
              ) : null}
            </div>

            {level ? (
              <div className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/55">
                {level}
              </div>
            ) : null}
          </div>

          <ProgressBar value={progress} max={target} />

          <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/38">
            {progress} / {target}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AchievementsViewV1({
  onBack,
  onOpenAchievementSettings,
  user,
  achievements = [],
  trophyCount = 0,
  trophyBonusPercent = 0,
}) {
  const hasAchievements = Array.isArray(achievements) && achievements.length > 0;
  const nextBadge = getNextBadge(user || {});

  return (
    <div className="flex h-full min-h-0 flex-col bg-[linear-gradient(180deg,rgba(6,12,18,0.98),rgba(4,8,14,1))] text-white">
      <div className="flex h-[56px] shrink-0 items-center justify-between border-b border-cyan-200/10 px-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold tracking-[-0.02em] text-white/78"
        >
          <ChevronLeft size={16} strokeWidth={2.4} />
          Back
        </button>

        <div className="text-[15px] font-semibold tracking-[-0.02em] text-white/92">
          Achievements
        </div>

        <HeaderButton
          label="Open achievement settings"
          onClick={onOpenAchievementSettings}
        >
          <Trophy size={15} strokeWidth={2.3} />
        </HeaderButton>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden px-3 py-3">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-28 w-52 -translate-x-1/2 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-24 w-24 rounded-full bg-cyan-400/10 blur-2xl" />
        </div>

        <div className="relative z-10 flex h-full min-h-0 flex-col gap-2.5 overflow-y-auto pr-1">
          <TrophyCard
            trophyCount={trophyCount}
            trophyBonusPercent={trophyBonusPercent}
          />

          <NextBadgeCard badge={nextBadge} />

          <BadgeCarouselV1 achievements={achievements} nextBadge={nextBadge} />

          {hasAchievements
            ? achievements.map((achievement, index) => (
                <AchievementCard
                  key={achievement?.id || achievement?.name || index}
                  achievement={achievement}
                />
              ))
            : null}
        </div>
      </div>
    </div>
  );
}