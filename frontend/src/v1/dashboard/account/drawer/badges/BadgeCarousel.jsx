import React from "react";
import {
  Award,
  BadgeCheck,
  Dumbbell,
  Footprints,
  GraduationCap,
  HandHeart,
  Medal,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

const BADGES = [
  {
    id: "starter",
    label: "Starter",
    icon: BadgeCheck,
    tone: "cyan",
  },
  {
    id: "finisher",
    label: "Finisher",
    icon: Trophy,
    tone: "gold",
  },
  {
    id: "shaker",
    label: "Shaker",
    icon: Footprints,
    tone: "cyan",
  },
  {
    id: "mover",
    label: "Mover",
    icon: Dumbbell,
    tone: "violet",
  },
  {
    id: "contributor",
    label: "Contributor",
    icon: HandHeart,
    tone: "blue",
  },
  {
    id: "builder",
    label: "Builder",
    icon: Sparkles,
    tone: "violet",
  },
  {
    id: "earner",
    label: "Earner",
    icon: Medal,
    tone: "gold",
  },
  {
    id: "supporter",
    label: "Supporter",
    icon: Users,
    tone: "blue",
  },
  {
    id: "learner",
    label: "Learner",
    icon: GraduationCap,
    tone: "cyan",
  },
];

function getToneClasses(tone = "cyan", active = false) {
  if (!active) {
    return {
      card: "border-white/10 bg-white/[0.035]",
      icon: "border-white/10 bg-white/[0.04] text-white/42",
      text: "text-white/48",
    };
  }

  if (tone === "gold") {
    return {
      card: "border-amber-300/22 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.14),transparent_48%),linear-gradient(180deg,rgba(40,30,12,0.88),rgba(12,10,8,0.96))]",
      icon: "border-amber-300/24 bg-amber-300/10 text-amber-100",
      text: "text-amber-100/82",
    };
  }

  if (tone === "violet") {
    return {
      card: "border-violet-300/20 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.14),transparent_48%),linear-gradient(180deg,rgba(28,16,48,0.88),rgba(8,8,18,0.96))]",
      icon: "border-violet-300/24 bg-violet-400/10 text-violet-100",
      text: "text-violet-100/82",
    };
  }

  if (tone === "blue") {
    return {
      card: "border-blue-300/18 bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.12),transparent_48%),linear-gradient(180deg,rgba(18,34,58,0.82),rgba(8,14,26,0.96))]",
      icon: "border-blue-300/20 bg-blue-400/10 text-blue-100",
      text: "text-blue-100/78",
    };
  }

  return {
    card: "border-cyan-300/18 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_48%),linear-gradient(180deg,rgba(12,32,42,0.86),rgba(6,12,20,0.96))]",
    icon: "border-cyan-300/22 bg-cyan-400/10 text-cyan-100",
    text: "text-cyan-100/80",
  };
}

function resolveBadgeState(badge, achievements = [], nextBadge) {
  const matchedAchievement = achievements.find((achievement) => {
    const achievementId = String(achievement?.id || "").toLowerCase();
    const achievementName = String(achievement?.name || "").toLowerCase();
    const badgeId = String(badge.id || "").toLowerCase();
    const badgeLabel = String(badge.label || "").toLowerCase();

    return achievementId === badgeId || achievementName === badgeLabel;
  });

  if (matchedAchievement) {
    return "earned";
  }

  const nextBadgeLabel = String(nextBadge?.label || "").toLowerCase();
  const badgeLabel = String(badge.label || "").toLowerCase();

  if (nextBadgeLabel && nextBadgeLabel === badgeLabel) {
    return "active";
  }

  return "locked";
}

function BadgeTile({ badge, state }) {
  const Icon = badge.icon || Award;
  const active = state === "earned" || state === "active";
  const tone = getToneClasses(badge.tone, active);

  return (
    <div
      className={[
        "flex min-w-[92px] flex-col items-center justify-center rounded-[20px] border px-3 py-3",
        "shadow-[0_10px_24px_rgba(0,0,0,0.2)]",
        tone.card,
        state === "locked" ? "opacity-70" : "",
      ].join(" ")}
    >
      <div
        className={[
          "flex h-10 w-10 items-center justify-center rounded-[14px] border",
          tone.icon,
        ].join(" ")}
      >
        <Icon size={18} strokeWidth={2.2} />
      </div>

      <div
        className={[
          "mt-2 text-center text-[11px] font-semibold tracking-[-0.02em]",
          tone.text,
        ].join(" ")}
      >
        {badge.label}
      </div>

      <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/34">
        {state === "earned" ? "Earned" : state === "active" ? "Active" : "Locked"}
      </div>
    </div>
  );
}

export default function BadgeCarouselV1({
  achievements = [],
  nextBadge,
}) {
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-cyan-300/12 bg-[linear-gradient(180deg,rgba(8,16,26,0.94),rgba(5,9,18,0.98))] p-3 shadow-[0_12px_28px_rgba(0,0,0,0.26)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-100/62">
            Badge Path
          </div>

          <div className="mt-0.5 text-[15px] font-semibold tracking-[-0.02em] text-white/92">
            Identity Progress
          </div>
        </div>

        <Award size={17} strokeWidth={2.3} className="text-cyan-100/58" />
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-1 pr-1">
        {BADGES.map((badge) => (
          <BadgeTile
            key={badge.id}
            badge={badge}
            state={resolveBadgeState(badge, achievements, nextBadge)}
          />
        ))}
      </div>
    </div>
  );
}