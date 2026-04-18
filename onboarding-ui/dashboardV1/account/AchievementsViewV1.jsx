import React from "react";
import { ChevronLeft, Trophy, Star } from "lucide-react";

function AchievementCard({
  name,
  level = 0,
  progress = 0,
  target = 1,
  description,
}) {
  const percent = Math.max(
    0,
    Math.min(100, Math.round((progress / Math.max(target, 1)) * 100))
  );

  const levelLabel =
    level <= 0 ? "Locked" : level === 1 ? "Level I" : level === 2 ? "Level II" : "Level III";

  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_12px_28px_rgba(0,0,0,0.22)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-semibold tracking-[-0.03em] text-white">
            {name}
          </div>

          {description ? (
            <div className="mt-1 text-sm leading-relaxed text-white/54">
              {description}
            </div>
          ) : null}
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-400/15 bg-amber-400/[0.08]">
          <Star size={16} strokeWidth={2} className="text-amber-200/80" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="text-[11px] uppercase tracking-[0.16em] text-white/38">
          {levelLabel}
        </div>

        <div className="text-xs text-white/46">
          {progress} / {target}
        </div>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,rgba(250,204,21,0.9),rgba(251,191,36,0.45))]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function TrophyCard({
  trophyCount = 0,
  trophyBonusPercent = 0,
}) {
  return (
    <div className="rounded-[24px] border border-amber-400/12 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.10),transparent_45%),linear-gradient(180deg,rgba(20,16,8,0.96),rgba(12,10,6,0.98))] p-5 shadow-[0_14px_36px_rgba(0,0,0,0.30)]">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-amber-400/18 bg-amber-400/[0.08]">
          <Trophy size={22} strokeWidth={2} className="text-amber-200/80" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-[16px] font-semibold tracking-[-0.03em] text-white">
            Trophy Progress
          </div>

          <div className="mt-1 text-sm text-white/54">
            Permanent reward bonus increases as trophies are earned.
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-[16px] border border-white/8 bg-black/20 px-4 py-3">
          <div className="text-[10px] uppercase tracking-[0.16em] text-white/38">
            Trophies
          </div>
          <div className="mt-1 text-[18px] font-semibold tracking-[-0.03em] text-white">
            {trophyCount}
          </div>
        </div>

        <div className="rounded-[16px] border border-white/8 bg-black/20 px-4 py-3">
          <div className="text-[10px] uppercase tracking-[0.16em] text-white/38">
            Bonus
          </div>
          <div className="mt-1 text-[18px] font-semibold tracking-[-0.03em] text-amber-200">
            +{trophyBonusPercent}%
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AchievementsViewV1({
  onBack,
  trophyCount = 0,
  trophyBonusPercent = 0,
  achievements = [],
}) {
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

        <div className="w-9" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          <TrophyCard
            trophyCount={trophyCount}
            trophyBonusPercent={trophyBonusPercent}
          />

          <div className="space-y-3">
            {achievements.map((achievement, index) => (
              <AchievementCard
                key={achievement.id || `${achievement.name}-${index}`}
                name={achievement.name}
                level={achievement.level}
                progress={achievement.progress}
                target={achievement.target}
                description={achievement.description}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}