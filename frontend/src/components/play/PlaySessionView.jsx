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
  const progressPercent =
    session && session.maxRounds > 0
      ? (((session.round || 1) - 1) / session.maxRounds) * 100
      : 0;

  const iconContent = currentGameData?.icon ? (
    typeof currentGameData.icon === "string" ? (
      <span className="text-lg leading-none">{currentGameData.icon}</span>
    ) : (
      <currentGameData.icon className="h-5 w-5" />
    )
  ) : (
    <Gamepad2 className="h-5 w-5" />
  );

  return (
    <div className="fixed inset-0 z-[120] bg-[#050816] text-white">
      <div className="relative flex h-full w-full flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-8%] top-[-10%] h-[260px] w-[260px] rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute right-[-8%] top-[8%] h-[260px] w-[260px] rounded-full bg-violet-500/10 blur-3xl" />
          <div className="absolute bottom-[-12%] left-[18%] h-[240px] w-[240px] rounded-full bg-pink-500/10 blur-3xl" />
        </div>

        <div className="relative z-10 border-b border-white/10 bg-black/20 px-4 pb-3 pt-[max(env(safe-area-inset-top),16px)] backdrop-blur-xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={onBack}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${currentTheme.icon}`}
                >
                  {iconContent}
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-base font-semibold text-white">
                    {currentGameData?.name}
                  </h1>
                  <p className="truncate text-xs text-white/45">
                    {currentGameData?.description || currentGameData?.mechanic}
                  </p>
                </div>
              </div>
            </div>

            {session ? (
              <div className="flex shrink-0 items-center gap-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-center">
                  <p className="text-[10px] uppercase tracking-wide text-white/40">
                    Round
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {session.round}/{session.maxRounds}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-center">
                  <p className="text-[10px] uppercase tracking-wide text-white/40">
                    Total
                  </p>
                  <p className="mt-1 text-sm font-semibold text-cyan-300">
                    {session.totalScore}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-center">
                  <p className="text-[10px] uppercase tracking-wide text-white/40">
                    Level
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {session.level}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-3">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-white/45">Session progress</span>
              <span className="text-white/65">
                {session?.round || 1}/{session?.maxRounds || 1}
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${currentTheme.button}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="relative z-10 flex min-h-0 flex-1 items-stretch justify-center overflow-hidden px-0 pb-[max(env(safe-area-inset-bottom),0px)] pt-0">
          {submittingResult ? (
            <div className="flex h-full w-full items-center justify-center">
              <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-white/65 backdrop-blur-xl">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Recording final session...
              </div>
            </div>
          ) : (
            <div className="h-full w-full">{renderGameStage()}</div>
          )}
        </div>
      </div>
    </div>
  );
}