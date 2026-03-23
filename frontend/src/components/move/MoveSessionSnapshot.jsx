import React from "react";
import { TimerReset } from "lucide-react";

export default function MoveSessionSnapshot({
  isTracking,
  steps,
  multiplier,
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <div className="mb-3 flex items-center gap-2">
        <TimerReset className="h-4 w-4 text-violet-300" />
        <h3 className="text-sm font-semibold text-white">
          Session Snapshot
        </h3>
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
          <p className="text-[11px] uppercase tracking-wide text-white/45">
            Reward type
          </p>
          <p className="mt-1 text-sm font-medium text-white/85">
            Direct ZWAP
          </p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
          <p className="text-[11px] uppercase tracking-wide text-white/45">
            Claim status
          </p>
          <p className="mt-1 text-sm font-medium text-white/85">
            {isTracking
              ? "Pause tracking before claim"
              : steps > 0
              ? "Ready to claim"
              : "No steps yet"}
          </p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
          <p className="text-[11px] uppercase tracking-wide text-white/45">
            Tier bonus
          </p>
          <p className="mt-1 text-sm font-medium text-amber-300">
            {multiplier.toFixed(1)}x multiplier
          </p>
        </div>
      </div>
    </div>
  );
}