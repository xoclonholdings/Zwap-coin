import React from "react";

export default function GameRoundCompleteOverlay({
  open,
  gameTitle,
  result,
  rewardDoubled,
  adRunning,
  onWatchDoubleAd,
  onStartNextRound,
  onBackToArcade,
}) {
  if (!open) return null;

  const baseZpts = Number(result?.baseZpts || result?.zpts || 0);
  const finalZpts = rewardDoubled ? baseZpts * 2 : baseZpts;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/78 px-5 text-white backdrop-blur-md">
      <div className="w-full max-w-[340px] rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_36%),linear-gradient(180deg,rgba(9,14,24,0.96),rgba(4,8,16,0.98))] p-5 text-center shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
        <p className="text-[11px] font-black uppercase tracking-[0.26em] text-cyan-300/75">
          {gameTitle}
        </p>

        <h3 className="mt-3 text-xl font-black text-white">Reward Ready</h3>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-white/8 bg-white/[0.05] px-3 py-3">
            <p className="text-[10px] uppercase tracking-wide text-white/40">
              Score
            </p>
            <p className="mt-1 text-base font-black text-cyan-300">
              {Number(result?.score || 0).toLocaleString()}
            </p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.05] px-3 py-3">
            <p className="text-[10px] uppercase tracking-wide text-white/40">
              zPts
            </p>
            <p className="mt-1 text-base font-black text-pink-300">
              +{Number(finalZpts || 0).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <button
            type="button"
            disabled={rewardDoubled || adRunning || baseZpts <= 0}
            onClick={onWatchDoubleAd}
            className={`flex w-full items-center justify-center rounded-[20px] px-5 py-3.5 text-sm font-black transition ${
              rewardDoubled || baseZpts <= 0
                ? "border border-white/10 bg-white/[0.05] text-white/35"
                : "bg-[linear-gradient(90deg,rgba(250,204,21,0.95),rgba(236,72,153,0.95))] text-white active:scale-[0.98]"
            }`}
          >
            {adRunning
              ? "Playing Reward Ad…"
              : rewardDoubled
                ? "zPts Doubled"
                : "Watch Longer Ad to Double zPts"}
          </button>

          <button
            type="button"
            onClick={onStartNextRound}
            className="flex w-full items-center justify-center rounded-[20px] bg-[linear-gradient(90deg,rgba(168,85,247,1),rgba(236,72,153,0.95),rgba(34,211,238,1))] px-5 py-3.5 text-base font-black text-white transition active:scale-[0.98]"
          >
            Start Next Round
          </button>

          <button
            type="button"
            onClick={onBackToArcade}
            className="flex w-full items-center justify-center rounded-[20px] border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-medium text-white/72 transition hover:bg-white/[0.08]"
          >
            Back to Arcade
          </button>
        </div>
      </div>
    </div>
  );
}