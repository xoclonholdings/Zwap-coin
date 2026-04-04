import React from "react";
import { CircleDollarSign, Sparkles } from "lucide-react";

function StatTile({ label, value, accent = "cyan" }) {
  const accentMap = {
    cyan: "border-cyan-400/15 bg-cyan-500/10 text-cyan-300",
    purple: "border-violet-400/15 bg-violet-500/10 text-violet-300",
  };

  const accentClass = accentMap[accent] || accentMap.cyan;

  return (
    <div className={`rounded-2xl border p-3 ${accentClass}`}>
      <p className="text-[10px] uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function MomentumPill({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

export default function DashboardStatusCard({
  zpts = 0,
  pendingZwap = 0,
  movePercent = 0,
  playPercent = 0,
  tasksCompleted = 0,
  tasksTotal = 4,
  nextBadge = null,
}) {
  const safeMovePercent = Math.max(0, Math.min(Number(movePercent) || 0, 100));
  const safePlayPercent = Math.max(0, Math.min(Number(playPercent) || 0, 100));
  const safeTasksCompleted = Math.max(Number(tasksCompleted) || 0, 0);
  const safeTasksTotal = Math.max(Number(tasksTotal) || 0, 1);

  const badgeProgress = Math.max(Number(nextBadge?.progress) || 0, 0);
  const badgeGoal = Math.max(Number(nextBadge?.goal) || 0, 1);
  const badgePercent = Math.max(
    0,
    Math.min((badgeProgress / badgeGoal) * 100, 100)
  );

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Status</h2>
          <p className="mt-1 text-[11px] text-gray-500">
            Rewards, momentum, and your next badge.
          </p>
        </div>

        <CircleDollarSign className="mt-1 h-4 w-4 shrink-0 text-emerald-300" />
      </div>

      <div className="space-y-4">
        <div>
          <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-gray-500">
            Rewards
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <StatTile label="zPts" value={zpts} accent="purple" />
            <StatTile
              label="Pending ZWAP!"
              value={Number(pendingZwap || 0).toFixed(2)}
              accent="cyan"
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-gray-500">
            Momentum
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <MomentumPill label="Move" value={`${Math.round(safeMovePercent)}%`} />
            <MomentumPill label="Play" value={`${Math.round(safePlayPercent)}%`} />
            <MomentumPill
              label="Tasks"
              value={`${safeTasksCompleted}/${safeTasksTotal}`}
            />
          </div>
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