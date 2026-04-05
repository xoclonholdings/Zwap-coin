import React, { useMemo } from "react";

function formatDuration(totalSeconds) {
  const safe = Math.max(0, Number(totalSeconds || 0));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;

  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function MoveCoreMovementCard({
  isTracking,
  sessionSeconds,
  progressPercent,
  remainingSteps,
  pace,
  onToggleTracking,
}) {
  const ringStyle = useMemo(() => {
    const degrees = progressPercent * 3.6;

    return {
      background: `conic-gradient(
        from 180deg,
        rgba(34,211,238,1) 0deg,
        rgba(45,212,191,1) ${degrees * 0.65}deg,
        rgba(168,85,247,1) ${degrees}deg,
        rgba(255,255,255,0.08) ${degrees}deg,
        rgba(255,255,255,0.08) 360deg
      )`,
    };
  }, [progressPercent]);

  return (
    <div className="rounded-[26px] border border-cyan-400/15 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_34%),linear-gradient(180deg,rgba(10,25,35,0.96),rgba(5,15,20,0.98))] p-4 shadow-[0_14px_40px_rgba(0,0,0,0.45)]">
      <div className="mb-4 grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-cyan-400/15 bg-[linear-gradient(180deg,rgba(18,40,56,0.92),rgba(10,22,32,0.95))] px-3 py-2 shadow-[0_0_18px_rgba(34,211,238,0.08)]">
          <p className="text-[10px] uppercase tracking-wide text-cyan-100/55">
            Status
          </p>
          <p
            className={`mt-1 text-sm font-medium ${
              isTracking ? "text-emerald-300" : "text-white/75"
            }`}
          >
            {isTracking ? "Active" : "Idle"}
          </p>
        </div>

        <div className="rounded-2xl border border-cyan-400/15 bg-[linear-gradient(180deg,rgba(18,40,56,0.92),rgba(10,22,32,0.95))] px-3 py-2 shadow-[0_0_18px_rgba(34,211,238,0.08)]">
          <p className="text-[10px] uppercase tracking-wide text-cyan-100/55">
            Timer
          </p>
          <p className="mt-1 text-sm font-medium text-white/90">
            {formatDuration(sessionSeconds)}
          </p>
        </div>

        <div className="rounded-2xl border border-cyan-400/15 bg-[linear-gradient(180deg,rgba(18,40,56,0.92),rgba(10,22,32,0.95))] px-3 py-2 shadow-[0_0_18px_rgba(34,211,238,0.08)]">
          <p className="text-[10px] uppercase tracking-wide text-cyan-100/55">
            Pace
          </p>
          <p className="mt-1 text-sm font-medium text-cyan-300">{pace}</p>
        </div>
      </div>

      <div className="rounded-[26px] border border-cyan-400/12 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_42%),linear-gradient(180deg,rgba(8,20,28,0.96),rgba(6,14,20,0.98))] px-4 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={onToggleTracking}
            className="group relative h-64 w-64 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
            aria-label={isTracking ? "Stop walking session" : "Start walking session"}
          >
            <div
              className={`absolute inset-0 rounded-full p-[10px] transition-transform duration-200 group-active:scale-[0.98] ${
                isTracking
                  ? "shadow-[0_0_60px_rgba(34,211,238,0.24)]"
                  : "shadow-[0_0_40px_rgba(34,211,238,0.14)]"
              }`}
              style={ringStyle}
            >
              <div className="flex h-full w-full items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),rgba(8,23,22,1)_55%)]">
                <div
                  className={`rounded-full px-7 py-3 text-base font-semibold uppercase tracking-[0.18em] transition ${
                    isTracking
                      ? "bg-red-500/85 text-white shadow-[0_0_24px_rgba(239,68,68,0.35)]"
                      : "bg-cyan-400/85 text-[#041214] shadow-[0_0_24px_rgba(34,211,238,0.35)]"
                  }`}
                >
                  {isTracking ? "Stop" : "Start"}
                </div>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs text-white/55">
            <span>Goal progress</span>
            <span>{progressPercent.toFixed(0)}%</span>
          </div>

          <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-violet-400 transition-all duration-300 shadow-[0_0_20px_rgba(34,211,238,0.25)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="mt-2 text-center text-sm text-white/65">
            {remainingSteps > 0
              ? `${remainingSteps.toLocaleString()} steps to goal`
              : "Goal cleared. Keep stacking."}
          </p>
        </div>
      </div>
    </div>
  );
}