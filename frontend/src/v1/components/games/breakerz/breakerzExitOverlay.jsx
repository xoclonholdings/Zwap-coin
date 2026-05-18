import React from "react";
import {
  AlertTriangle,
  ArrowLeft,
  LogOut,
  ShieldAlert,
} from "lucide-react";

export default function BreakerzExitOverlay({
  open = false,
  score = 0,
  round = 1,
  onCancel,
  onConfirmExit,
}) {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center overflow-hidden bg-[rgba(4,6,14,0.82)] px-4 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-14%] top-[2%] h-[230px] w-[230px] rounded-full bg-pink-500/12 blur-[110px]" />
        <div className="absolute right-[-14%] top-[12%] h-[230px] w-[230px] rounded-full bg-red-500/12 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[28%] h-[250px] w-[250px] rounded-full bg-orange-400/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-[328px] overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(11,10,18,0.98),rgba(7,7,12,0.99))] shadow-[0_34px_90px_rgba(0,0,0,0.66)]">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-pink-300/50 to-transparent" />

        <div className="absolute left-[-16%] top-[-20%] h-[220px] w-[220px] rounded-full bg-pink-500/10 blur-[110px]" />
        <div className="absolute right-[-20%] top-[0%] h-[240px] w-[240px] rounded-full bg-red-500/10 blur-[120px]" />

        <div className="relative px-5 pb-5 pt-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-[22px] border border-pink-400/20 bg-[linear-gradient(180deg,rgba(244,114,182,0.18),rgba(244,114,182,0.06))] shadow-[0_0_28px_rgba(244,114,182,0.18)]">
                <AlertTriangle className="h-5 w-5 text-pink-300" />
              </div>

              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-pink-300/74">
                  Exit Session
                </p>

                <h3 className="mt-1 text-[18px] font-black text-white">
                  Leave Breakerz?
                </h3>

                <p className="mt-1 text-[13px] leading-relaxed text-white/48">
                  Your current run ends if you exit now.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 rounded-full border border-red-300/10 bg-red-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-red-300">
              <ShieldAlert className="h-3 w-3" />
              Warning
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-3 py-3 text-center backdrop-blur-md">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/35">
                Score
              </p>

              <p className="mt-1 text-lg font-black text-cyan-300">
                {Number(score || 0).toLocaleString()}
              </p>
            </div>

            <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-3 py-3 text-center backdrop-blur-md">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/35">
                Round
              </p>

              <p className="mt-1 text-lg font-black text-white">
                {round}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex w-full items-center justify-center gap-2 rounded-[24px] border border-white/10 bg-white/[0.05] px-5 py-3.5 text-sm font-semibold text-white/74 transition active:scale-[0.985]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back To Game
            </button>

            <button
              type="button"
              onClick={onConfirmExit}
              className="flex w-full items-center justify-center gap-2 rounded-[24px] border border-white/10 bg-[linear-gradient(90deg,#f472b6,#ef4444)] px-5 py-4 text-[15px] font-black text-white shadow-[0_0_34px_rgba(239,68,68,0.24)] transition active:scale-[0.985]"
            >
              <LogOut className="h-4 w-4" />
              Confirm Exit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}