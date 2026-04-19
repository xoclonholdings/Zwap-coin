import React from "react";
import { Pause, Play, X } from "lucide-react";

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
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">
      <div className="w-full max-w-[320px] rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_35%),linear-gradient(180deg,rgba(11,18,28,0.96),rgba(7,11,18,0.98))] p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
              <Pause className="h-4 w-4 text-cyan-300" />
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-300/70">
                Paused
              </p>
              <p className="text-sm text-white/55">
                Breakerz session stopped
              </p>
            </div>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-3 gap-2">
          <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2 text-center">
            <p className="text-[10px] uppercase tracking-wide text-white/40">
              Round
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {round}
            </p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2 text-center">
            <p className="text-[10px] uppercase tracking-wide text-white/40">
              Score
            </p>
            <p className="mt-1 text-sm font-semibold text-cyan-300">
              {Number(score || 0).toLocaleString()}
            </p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2 text-center">
            <p className="text-[10px] uppercase tracking-wide text-white/40">
              Lives
            </p>
            <p className="mt-1 text-sm font-semibold text-pink-300">
              {lives}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={onResume}
            className="flex w-full items-center justify-center gap-2 rounded-[20px] bg-[linear-gradient(90deg,rgba(34,211,238,1),rgba(139,92,246,1),rgba(236,72,153,0.95))] px-5 py-3.5 text-base font-semibold text-[#071019] shadow-[0_0_30px_rgba(139,92,246,0.28)] transition active:scale-[0.98]"
          >
            <Play className="h-4 w-4" />
            Resume
          </button>

          <button
            type="button"
            onClick={onExit}
            className="flex w-full items-center justify-center gap-2 rounded-[20px] border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-medium text-white/75 transition hover:bg-white/[0.08]"
          >
            <X className="h-4 w-4" />
            Exit Session
          </button>
        </div>
      </div>
    </div>
  );
}