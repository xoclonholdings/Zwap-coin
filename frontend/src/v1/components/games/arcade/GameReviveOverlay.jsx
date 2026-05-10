import React from "react";

export default function GameReviveOverlay({
  open,
  gameTitle,
  result,
  reviveUsed,
  adRunning,
  onWatchReviveAd,
  onEndSession,
}) {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 px-5 text-white backdrop-blur-md">
      <div className="w-full max-w-[340px] rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(236,72,153,0.13),transparent_36%),linear-gradient(180deg,rgba(16,10,18,0.96),rgba(8,8,12,0.98))] p-5 text-center shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
        <p className="text-[11px] font-black uppercase tracking-[0.26em] text-pink-300/75">
          {gameTitle}
        </p>

        <h3 className="mt-3 text-xl font-black text-white">Continue?</h3>

        <p className="mt-2 text-sm leading-relaxed text-white/58">
          Watch a longer ad to revive with one extra life, or end this session.
        </p>

        <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.05] px-3 py-3">
          <p className="text-[10px] uppercase tracking-wide text-white/40">
            Score
          </p>
          <p className="mt-1 text-base font-black text-cyan-300">
            {Number(result?.score || 0).toLocaleString()}
          </p>
        </div>

        <div className="mt-5 space-y-3">
          <button
            type="button"
            disabled={reviveUsed || adRunning}
            onClick={onWatchReviveAd}
            className={`flex w-full items-center justify-center rounded-[20px] px-5 py-3.5 text-sm font-black transition ${
              reviveUsed
                ? "border border-white/10 bg-white/[0.05] text-white/35"
                : "bg-[linear-gradient(90deg,rgba(250,204,21,0.95),rgba(236,72,153,0.95))] text-white active:scale-[0.98]"
            }`}
          >
            {adRunning
              ? "Playing Reward Ad…"
              : reviveUsed
                ? "Revive Used"
                : "Watch Longer Ad for +1 Life"}
          </button>

          <button
            type="button"
            onClick={onEndSession}
            className="flex w-full items-center justify-center rounded-[20px] border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-medium text-white/72 transition hover:bg-white/[0.08]"
          >
            End Session
          </button>
        </div>
      </div>
    </div>
  );
}