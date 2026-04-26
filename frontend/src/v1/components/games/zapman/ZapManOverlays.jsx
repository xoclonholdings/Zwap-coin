import React from "react";
import zapManLogo from "@/assets/games/zap_man_logo.PNG";

export function ZapManSplashOverlay({ open, onStart, onBackToArcade }) {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center px-4">
      <div className="flex w-full max-w-[320px] flex-col items-center rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.012))] px-5 py-7 text-center shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-xl">
        <img
          src={zapManLogo}
          alt="Zap-Man"
          className="mx-auto mb-8 block w-full max-w-[260px] object-contain drop-shadow-[0_0_34px_rgba(34,211,238,0.28)]"
        />

        <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">
          Ready
        </p>

        <div className="mt-7 flex w-full flex-col items-center gap-3">
          <button
            type="button"
            onClick={onStart}
            className="w-full max-w-[260px] rounded-full border border-white/45 bg-[linear-gradient(90deg,rgba(168,85,247,1),rgba(236,72,153,0.95),rgba(34,211,238,1))] px-6 py-4 text-lg font-bold tracking-[0.02em] text-white shadow-[0_0_28px_rgba(34,211,238,0.24)] transition active:scale-[0.98]"
          >
            Start
          </button>

          <button
            type="button"
            onClick={onBackToArcade}
            className="w-full max-w-[260px] rounded-full border border-white/10 bg-white/[0.05] px-6 py-3 text-sm font-medium text-white/72 transition hover:bg-white/[0.08]"
          >
            Back to Arcade
          </button>
        </div>
      </div>
    </div>
  );
}

export function ZapManPauseOverlay({
  open,
  round,
  score,
  lives,
  pellets,
  onResume,
  onExit,
}) {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">
      <div className="w-full max-w-[320px] rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_35%),linear-gradient(180deg,rgba(11,18,28,0.96),rgba(7,11,18,0.98))] p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-300/70">
          Paused
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2 text-center">
            <p className="text-[10px] uppercase tracking-wide text-white/40">
              Round
            </p>
            <p className="mt-1 text-sm font-semibold text-white">{round}</p>
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
              Left
            </p>
            <p className="mt-1 text-sm font-semibold text-pink-300">
              {pellets}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/8 bg-white/5 px-3 py-2 text-center">
          <p className="text-[10px] uppercase tracking-wide text-white/40">
            Lives
          </p>
          <p className="mt-1 text-sm font-semibold text-pink-300">
            {"●".repeat(Math.max(0, Number(lives || 0)))}
          </p>
        </div>

        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={onResume}
            className="flex w-full items-center justify-center rounded-[20px] bg-[linear-gradient(90deg,rgba(168,85,247,1),rgba(236,72,153,0.95),rgba(34,211,238,1))] px-5 py-3.5 text-base font-semibold text-white transition active:scale-[0.98]"
          >
            Resume
          </button>

          <button
            type="button"
            onClick={onExit}
            className="flex w-full items-center justify-center rounded-[20px] border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-medium text-white/75 transition hover:bg-white/[0.08]"
          >
            Exit Session
          </button>
        </div>
      </div>
    </div>
  );
}

export function ZapManExitOverlay({
  open,
  round,
  score,
  onCancel,
  onConfirmExit,
}) {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/75 px-4 backdrop-blur-md">
      <div className="w-full max-w-[320px] rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(236,72,153,0.10),transparent_35%),linear-gradient(180deg,rgba(16,10,18,0.96),rgba(8,8,12,0.98))] p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.50)]">
        <p className="text-[11px] uppercase tracking-[0.24em] text-pink-300/75">
          Exit Game
        </p>

        <h3 className="mt-2 text-lg font-semibold text-white">
          Leave Zap-Man?
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-white/55">
          Your current session will end if you exit now.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2">
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
            <p className="mt-1 text-sm font-semibold text-white">{round}</p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex w-full items-center justify-center rounded-[20px] border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-medium text-white/75 transition hover:bg-white/[0.08]"
          >
            Back to Game
          </button>

          <button
            type="button"
            onClick={onConfirmExit}
            className="flex w-full items-center justify-center rounded-[20px] bg-[linear-gradient(90deg,rgba(244,114,182,0.95),rgba(239,68,68,0.95))] px-5 py-3.5 text-base font-semibold text-white transition active:scale-[0.98]"
          >
            Confirm Exit
          </button>
        </div>
      </div>
    </div>
  );
}

export function ZapManGameOverOverlay({
  open,
  round,
  score,
  onRestart,
  onBackToArcade,
}) {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-md">
      <div className="w-full max-w-[320px] rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_35%),linear-gradient(180deg,rgba(11,18,28,0.96),rgba(7,11,18,0.98))] p-5 text-center text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-300/70">
          Session Ended
        </p>

        <h3 className="mt-2 text-lg font-semibold text-white">Game Over</h3>

        <p className="mt-2 text-sm text-white/60">
          Final score: {Number(score || 0).toLocaleString()} • Round {round}
        </p>

        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={onRestart}
            className="flex w-full items-center justify-center rounded-[20px] bg-[linear-gradient(90deg,rgba(168,85,247,1),rgba(236,72,153,0.95),rgba(34,211,238,1))] px-5 py-3.5 text-base font-semibold text-white transition active:scale-[0.98]"
          >
            Restart
          </button>

          <button
            type="button"
            onClick={onBackToArcade}
            className="flex w-full items-center justify-center rounded-[20px] border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-medium text-white/75 transition hover:bg-white/[0.08]"
          >
            Back to Arcade
          </button>
        </div>
      </div>
    </div>
  );
}