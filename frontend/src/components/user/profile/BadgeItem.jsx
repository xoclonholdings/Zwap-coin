import React from "react";
import BadgeProgressRing from "./BadgeProgressRing";

function getBadgeStateClasses({ earned, progress }) {
  if (earned) {
    return {
      ring: "stroke-yellow-400",
      shell:
        "border-yellow-400/40 bg-gradient-to-br from-yellow-400/18 via-amber-500/10 to-transparent shadow-[0_0_18px_rgba(250,204,21,0.18)]",
      text: "text-yellow-100",
      label: "text-gray-200",
    };
  }

  if (progress > 0) {
    return {
      ring: "stroke-yellow-400",
      shell:
        "border-white/15 bg-white/[0.04]",
      text: "text-white",
      label: "text-gray-400",
    };
  }

  return {
    ring: "stroke-white/10",
    shell:
      "border-white/10 bg-white/[0.02]",
    text: "text-gray-500",
    label: "text-gray-500",
  };
}

export default function BadgeItem({
  badge,
  progress = 0,
  earned = false,
  size = 78,
}) {
  const safeProgress = Math.max(0, Math.min(1, progress));
  const styles = getBadgeStateClasses({ earned, progress: safeProgress });

  return (
    <div className="flex shrink-0 flex-col items-center gap-2">
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <div className="absolute inset-0">
          <BadgeProgressRing
            size={size}
            strokeWidth={5}
            progress={safeProgress}
            earned={earned}
            progressClassName={styles.ring}
          />
        </div>

        <div
          className={`relative z-10 flex items-center justify-center rounded-full border ${styles.shell}`}
          style={{
            width: size - 14,
            height: size - 14,
          }}
        >
          <span className={`text-[11px] font-semibold tracking-wide ${styles.text}`}>
            {badge.label}
          </span>
        </div>
      </div>

      <p className={`max-w-[84px] text-center text-[11px] leading-tight ${styles.label}`}>
        {badge.label}
      </p>
    </div>
  );
}