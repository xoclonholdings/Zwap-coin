import React from "react";
import { AlertTriangle, ArrowLeft, LogOut } from "lucide-react";

export default function BreakerzExitOverlay({
  open = false,
  score = 0,
  round = 1,
  onCancel,
  onConfirmExit,
}) {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/75 px-4 backdrop-blur-md">
      <div className="w-full max-w-[320px] rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(244,114,182,0.10),transparent_35%),linear-gradient(180deg,rgba(16,10,18,0.96),rgba(8,8,12,0.98))] p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.50)]">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-pink-400/20 bg-pink-400/10">
            <AlertTriangle className="h-5 w-5 text-pink-300" />
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-pink-300/75">
              Exit Game
            </p>
            <h3 className="mt-1 text-lg font-semibold text-white">
              Leave Breakerz?
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-white/55">
              Your current session will end if you exit now.
            </p>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-2">
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
              Round
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {round}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex w-full items-center justify-center gap-2 rounded-[20px] border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-medium text-white/75 transition hover:bg-white/[0.08]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Game
          </button>

          <button
            type="button"
            onClick={onConfirmExit}
            className="flex w-full items-center justify-center gap-2 rounded-[20px] bg-[linear-gradient(90deg,rgba(244,114,182,0.95),rgba(239,68,68,0.95))] px-5 py-3.5 text-base font-semibold text-white shadow-[0_0_28px_rgba(239,68,68,0.22)] transition active:scale-[0.98]"
          >
            <LogOut className="h-4 w-4" />
            Confirm Exit
          </button>
        </div>
      </div>
    </div>
  );
}
