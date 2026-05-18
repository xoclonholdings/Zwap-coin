import React from "react";
import { Pause, Play, X, Sparkles } from "lucide-react";

export default function BreakerzPauseOverlay({
  open = false,
  round = 1,
  score = 0,
  lives = 0,
  onResume,
  onExit,
}) {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center overflow-hidden bg-[rgba(3,7,18,0.78)] px-4 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[4%] h-[220px] w-[220px] rounded-full bg-cyan-400/12 blur-[110px]" />
        <div className="absolute right-[-10%] top-[14%] h-[240px] w-[240px] rounded-full bg-fuchsia-500/12 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[20%] h-[240px] w-[240px] rounded-full bg-amber-400/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-[328px] overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,12,24,0.97),rgba(4,7,16,0.985))] shadow-[0_32px_90px_rgba(0,0,0,0.62)]">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />

        <div className="absolute left-[-18%] top-[-20%] h-[220px] w-[220px] rounded-full bg-cyan-400/10 blur-[110px]" />
        <div className="absolute right-[-22%] top-[0%] h-[240px] w-[240px] rounded-full bg-fuchsia-500/10 blur-[120px]" />

        <div className="relative px-5 pb-5 pt-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-[52px] w-[52px] items-center justify-center rounded-[22px] border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(34,211,238,0.16),rgba(34,211,238,0.05))] shadow-[0_0_26px_rgba(34,211,238,0.18)]">
                <Pause className="h-5 w-5 text-cyan-300" />
              </div>

              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-cyan-300/72">
                  Session Paused
                </p>

                <p className="mt-1 text-sm font-semibold text-white">
                  Breakerz
                </p>

                <p className="mt-1 text-[12px] text-white/45">
                  Your neon wall waits ⚡
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 rounded-full border border-amber-300/10 bg-amber-300/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-300">
              <Sparkles className="h-3 w-3" />
              LIVE
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="rounded-[22px] border border-cyan-300/10 bg-white/[0.04] px-3 py-3 text-center backdrop-blur-md">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/35">
                Round
              </p>

              <p className="mt-1 text-lg font-black text-white">
                {round}
              </p>
            </div>

            <div className="rounded-[22px] border border-cyan-300/10 bg-white/[0.04] px-3 py-3 text-center backdrop-blur-md">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/35">
                Score
              </p>

              <p className="mt-1 text-lg font-black text-cyan-300">
                {Number(score || 0).toLocaleString()}
              </p>
            </div>

            <div className="rounded-[22px] border border-cyan-300/10 bg-white/[0.04] px-3 py-3 text-center backdrop-blur-md">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/35">
                Lives
              </p>

              <p className="mt-1 text-lg font-black text-pink-300">
                {lives}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <button
              type="button"
              onClick={onResume}
              className="flex w-full items-center justify-center gap-2 rounded-[24px] border border-white/20 bg-[linear-gradient(90deg,#22d3ee,#8b5cf6,#ec4899)] px-5 py-4 text-[15px] font-black text-white shadow-[0_0_34px_rgba(139,92,246,0.34)] transition active:scale-[0.985]"
            >
              <Play className="h-4 w-4" />
              Resume Session
            </button>

            <button
              type="button"
              onClick={onExit}
              className="flex w-full items-center justify-center gap-2 rounded-[24px] border border-white/10 bg-white/[0.05] px-5 py-3.5 text-sm font-semibold text-white/72 transition active:scale-[0.985]"
            >
              <X className="h-4 w-4" />
              Exit Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}