import React from "react";
import { ChevronLeft, Award, Trophy } from "lucide-react";

function ProgressBar({ value = 0, max = 1 }) {
  const safeMax = Math.max(1, Number(max || 1));
  const safeValue = Math.max(0, Number(value || 0));
  const percent = Math.min(100, Math.round((safeValue / safeMax) * 100));

  return (
    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
      <div
        className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-violet-400 shadow-[0_0_14px_rgba(34,211,238,0.18)] transition-all duration-300"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-[20px] border border-white/8 bg-white/[0.02] px-4 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/50">
        <Award size={22} />
      </div>

      <div className="mt-4 text-sm font-semibold text-white/80">
        Achievements Locked
      </div>

      <div className="mt-1 text-xs leading-5 text-white/50">
        Badge progress appears after the system unlocks identity tracking.
      </div>
    </div>
  );
}

function TrophyCard({ trophyCount = 0, trophyBonusPercent = 0 }) {
  return (
    <div className="rounded-[20px] border border-amber-300/12 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.10),transparent_48%),linear-gradient(180deg,rgba(22,18,10,0.92),rgba(9,10,12,0.96))] p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-amber-300/18 bg-amber-300/[0.07] text-amber-200/80">
          <Trophy size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold tracking-[-0.02em] text-white">
            Trophy Progress
          </div>
          <div className="mt-0.5 text-xs text-white/48">
            Permanent bonus: +{Number(trophyBonusPercent || 0)}%
          </div>
        </div>

        <div className="text-[22px] font-semibold tracking-[-0.05em] text-amber-100">
          {Number(trophyCount || 0)}
        </div>
      </div>
    </div>
  );
}

function AchievementCard({ achievement }) {
  const name = achievement?.name || "";
  const level = achievement?.level || "";
  const progress = achievement?.progress || 0;
  const target = achievement?.target || 1;
  const description = achievement?.description || "";

  return (
    <div className="rounded-[18px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,24,34,0.9),rgba(8,14,20,0.95))] p-3 shadow-[0_8px_24px_rgba(0,0,0,0.28)]">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.04] text-cyan-200/70">
          <Award size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">
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

          <div className="mt-2 text-[10px] uppercase tracking-[0.14em] text-white/35">
            {progress} / {target}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AchievementsViewV1({
  onBack,
  achievements = [],
  trophyCount = 0,
  trophyBonusPercent = 0,
}) {
  const hasAchievements = Array.isArray(achievements) && achievements.length > 0;

  return (
    <div className="flex h-full min-h-0 flex-col bg-[linear-gradient(180deg,rgba(8,14,20,0.98),rgba(4,8,14,1))] text-white">
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-white/72"
        >
          <ChevronLeft size={16} strokeWidth={2} />
          Back
        </button>

        <div className="text-sm font-semibold tracking-[-0.02em] text-white/88">
          Achievements
        </div>

        <div className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-3">
          <TrophyCard
            trophyCount={trophyCount}
            trophyBonusPercent={trophyBonusPercent}
          />

          {hasAchievements ? (
            achievements.map((achievement, index) => (
              <AchievementCard
                key={achievement?.id || achievement?.name || index}
                achievement={achievement}
              />
            ))
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}