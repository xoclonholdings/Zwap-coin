import React, { useState } from "react";
import { ChevronLeft, Check, Trophy, Lock, Lightbulb, BarChart3 } from "lucide-react";

function ToggleRow({
  icon,
  title,
  description,
  enabled = false,
  onToggle,
}) {
  return (
    <div className="relative overflow-hidden rounded-[22px] border border-amber-300/16 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.11),transparent_44%),linear-gradient(180deg,rgba(32,24,12,0.94),rgba(8,9,12,0.98))] p-3.5 shadow-[0_12px_28px_rgba(0,0,0,0.28)]">
      <div className="relative flex items-center gap-3">
        <div
          className={[
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border",
            enabled
              ? "border-amber-300/26 bg-amber-300/12 text-amber-100 shadow-[0_0_18px_rgba(251,191,36,0.12)]"
              : "border-white/10 bg-white/[0.04] text-white/48",
          ].join(" ")}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold tracking-[-0.02em] text-white/92">
            {title}
          </div>

          <div className="mt-1 text-[11px] font-medium leading-4 text-white/48">
            {description}
          </div>
        </div>

        <button
          type="button"
          onClick={onToggle}
          className={[
            "relative h-7 w-12 shrink-0 rounded-full border transition active:scale-[0.98]",
            enabled
              ? "border-amber-300/30 bg-amber-300/35 shadow-[0_0_16px_rgba(251,191,36,0.16)]"
              : "border-white/12 bg-white/[0.05]",
          ].join(" ")}
          aria-label={`Toggle ${title}`}
        >
          <span
            className={[
              "absolute top-1 h-5 w-5 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.25)] transition",
              enabled ? "left-6" : "left-1",
            ].join(" ")}
          />
        </button>
      </div>
    </div>
  );
}

export default function EditAchievementsView({
  onBack,
  onSave,
  showLockedBadges = true,
  showTrophyProgress = true,
  showBadgeHints = true,
}) {
  const [localShowLockedBadges, setLocalShowLockedBadges] =
    useState(showLockedBadges);
  const [localShowTrophyProgress, setLocalShowTrophyProgress] =
    useState(showTrophyProgress);
  const [localShowBadgeHints, setLocalShowBadgeHints] =
    useState(showBadgeHints);

  const handleSave = () => {
    onSave?.({
      showLockedBadges: localShowLockedBadges,
      showTrophyProgress: localShowTrophyProgress,
      showBadgeHints: localShowBadgeHints,
    });

    onBack?.();
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[linear-gradient(180deg,rgba(6,12,18,0.98),rgba(4,8,14,1))] text-white">
      <div className="flex h-[56px] shrink-0 items-center justify-between border-b border-amber-200/10 px-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold tracking-[-0.02em] text-white/78"
        >
          <ChevronLeft size={16} strokeWidth={2.4} />
          Back
        </button>

        <div className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.02em] text-white/92">
          <Trophy size={16} strokeWidth={2.3} className="text-amber-100/78" />
          Achievements
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-300/20 bg-amber-300/10 text-amber-100 shadow-[0_0_18px_rgba(251,191,36,0.14)] transition active:scale-[0.97]"
          aria-label="Save achievement settings"
        >
          <Check size={16} strokeWidth={2.4} />
        </button>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden px-3 py-3">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-28 w-52 -translate-x-1/2 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-24 w-24 rounded-full bg-cyan-400/10 blur-2xl" />
        </div>

        <div className="relative z-10 flex h-full min-h-0 flex-col gap-2.5">
          <ToggleRow
            icon={<Lock size={18} strokeWidth={2.2} />}
            title="Locked Badges"
            description="Show badge paths that are not visible yet."
            enabled={localShowLockedBadges}
            onToggle={() => setLocalShowLockedBadges((current) => !current)}
          />

          <ToggleRow
            icon={<BarChart3 size={18} strokeWidth={2.2} />}
            title="Trophy Progress"
            description="Show trophy count and permanent bonus progress."
            enabled={localShowTrophyProgress}
            onToggle={() => setLocalShowTrophyProgress((current) => !current)}
          />

          <ToggleRow
            icon={<Lightbulb size={18} strokeWidth={2.2} />}
            title="Badge Hints"
            description="Show guidance for the next badge milestone."
            enabled={localShowBadgeHints}
            onToggle={() => setLocalShowBadgeHints((current) => !current)}
          />
        </div>
      </div>
    </div>
  );
}