import React from "react";
import { ChevronLeft, Gamepad2, Loader2 } from "lucide-react";

export default function PlaySessionView({
  currentGameData,
  currentTheme,
  session,
  submittingResult,
  onBack,
  renderGameStage,
}) {
  return (
    <div className="min-h-[calc(100dvh-140px)] bg-[#081017] px-4 py-4 text-white">
      <div className="mx-auto w-full max-w-md space-y-4">
        <div
          className={`rounded-[28px] border border-white/10 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] ${currentTheme.shell}`}
        >
          <div className="mb-4 flex items-center">
            <button
              onClick={onBack}
              className="mr-3 rounded-2xl border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex min-w-0 items-center gap-3">
              {currentGameData?.icon ? (
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${currentTheme.icon}`}
                >
                  <currentGameData.icon className="h-5 w-5" />
                </div>
              ) : (
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${currentTheme.icon}`}
                >
                  <Gamepad2 className="h-5 w-5" />
                </div>
              )}

              <div className="min-w-0">
                <h1 className="truncate text-lg font-semibold text-white">
                  {currentGameData?.name}
                </h1>
                <p className="truncate text-xs text-white/45">
                  {currentGameData?.description}
                </p>
              </div>
            </div>
          </div>

          {session && (
            <div className="mb-4 grid grid-cols-3 gap-2">
              <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wide text-white/45">
                  Round
                </p>
                <p className="mt-1 text-sm font-medium text-white/85">
                  {session.round}/{session.maxRounds}
                </p>
              </div>

              <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wide text-white/45">
                  Total
                </p>
                <p className="mt-1 text-sm font-medium text-cyan-300">
                  {session.totalScore}
                </p>
              </div>

              <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wide text-white/45">
                  Level
                </p>
                <p className="mt-1 text-sm font-medium text-white/85">
                  {session.level}
                </p>
              </div>
            </div>
          )}

          <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-white/55">Session progress</span>
                <span className="text-white/75">
                  {session?.round || 1}/{session?.maxRounds || 1}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${currentTheme.button}`}
                  style={{
                    width: `${(((session?.round || 1) - 1) /
                      (session?.maxRounds || 1)) *
                      100}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex min-h-[420px] items-center justify-center">
              {submittingResult ? (
                <div className="flex items-center justify-center text-white/60">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Recording final session...
                </div>
              ) : (
                renderGameStage()
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}