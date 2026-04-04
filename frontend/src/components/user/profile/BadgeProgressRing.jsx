import React from "react";

export default function BadgeProgressRing({
  size = 72,
  strokeWidth = 5,
  progress = 0,
  earned = false,
  trackClassName = "stroke-white/10",
  progressClassName = "stroke-yellow-400",
}) {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const normalizedProgress = earned ? 1 : clampedProgress;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - normalizedProgress);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90"
      aria-hidden="true"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        className={trackClassName}
      />

      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        className={progressClassName}
        style={{
          transition: "stroke-dashoffset 0.35s ease",
        }}
      />
    </svg>
  );
}