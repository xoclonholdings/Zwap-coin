import React from "react";
import { Sparkles } from "lucide-react";

function ProgressCircle({
  label,
  percent = 0,
  valueLabel = "0%",
  accent = "cyan",
}) {
  const safePercent = Math.max(0, Math.min(Number(percent) || 0, 100));

  const size = 116;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (safePercent / 100) * circumference;

  const accentMap = {
    cyan: {
      track: "rgba(34, 211, 238, 0.14)",
      stroke: "#22d3ee",
      glow: "drop-shadow(0 0 8px rgba(34,211,238,0.28))",
      text: "text-cyan-300",
    },
    green: {
      track: "rgba(52, 211, 153, 0.14)",
      stroke: "#34d399",
      glow: "drop-shadow(0 0 8px rgba(52,211,153,0.28))",
      text: "text-emerald-300",
    },
  };

  const theme = accentMap[accent] || accentMap.cyan;

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white">{label}</p>
        <span className={`text-[11px] font-semibold ${theme.text}`}>
          {Math.round(safePercent)}%
        </span>
      </div>

      <div className="flex items-center justify-center">
        <svg width={size} height={size} className="overflow-visible">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={theme.track}
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={theme.stroke}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ filter: theme.glow }}
          />
          <text
            x="50%"
            y="52%"
            textAnchor="middle"
            className="fill-white text-[16px] font-bold"
          >
            {valueLabel}
          </text>
        </svg>
      </div>
    </div>
  );
}

export default function DashboardStatusCard({
  movePercent = 0,
  playPercent = 0,
  nextBadge = null,
}) {
  const safeMovePercent = Math.max(0, Math.min(Number(movePercent) || 0, 100));
  const safePlayPercent = Math.max(0, Math.min(Number(playPercent) || 0, 100));

  const badgeProgress = Math.max(Number(nextBadge?.progress) || 0, 0);
  const badgeGoal = Math.max(Number(nextBadge?.goal) || 1, 1);
  const badgePercent = Math.max(
    0,
    Math.min((badgeProgress / badgeGoal) * 100, 100)
  );

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white">Momentum</h2>
        <p className="mt-1 text-[11px] text-gray-500">
          Movement, play, and your next badge.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ProgressCircle
            label="Move"
            percent={safeMovePercent}
            valueLabel={`${Math.round(safeMovePercent)}%`}
            accent="cyan"
          />

          <ProgressCircle
            label="Play"
            percent={safePlayPercent}
            valueLabel={`${Math.round(safePlayPercent)}%`}
            accent="green"
          />
        </div>

        <div className="rounded-2xl border border-amber-400/15 bg-gradient-to-br from-amber-500/10 via-orange-500/6 to-transparent p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.22em] text-amber-300/80">
                Next Badge
              </p>
              <h3 className="mt-2 text-lg font-bold text-white">
                {nextBadge?.label || "No badge in progress"}
              </h3>
              <p className="mt-1 text-[11px] text-gray-400">
                {nextBadge?.category || "Progress will appear here"}
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-500/10">
              <Sparkles className="h-4 w-4 text-amber-300" />
            </div>
          </div>

          {nextBadge ? (
            <>
              <div className="mb-2 flex items-center justify-between gap-3 text-[11px]">
                <span className="text-gray-400">Progress</span>
                <span className="font-semibold text-white">
                  {badgeProgress}/{badgeGoal}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all"
                  style={{ width: `${badgePercent}%` }}
                />
              </div>

              <p className="mt-3 text-sm text-gray-300">
                {nextBadge?.hint || "Keep going to unlock this badge."}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-300">
              Keep moving through your daily loop to reveal your next badge target.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}