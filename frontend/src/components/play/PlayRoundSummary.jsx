import React from "react";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";

export default function PlayRoundSummary({
  roundResult,
  session,
  currentGameData,
  currentTheme,
  onExit,
  onNextRound,
}) {
  return (
    <div className="min-h-[calc(100dvh-140px)] bg-[#081017] px-4 py-4 text-white">
      <div className="mx-auto w-full max-w-md space-y-4">
        <div className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.14),_transparent_30%),linear-gradient(180deg,rgba(11,10,24,0.96),rgba(9,12,18,0.98))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">
                Round Complete
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                {currentGameData?.name}
              </h1>
              <p className="mt-1 text-sm text-white/55">
                Nice. Round {roundResult?.round} is complete.
              </p>
            </div>

            <div
              className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${currentTheme.icon}`}
            >
              <Trophy className="h-5 w-5" />
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className="text-[11px] uppercase tracking-wide text-white/45">
                Round score
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {roundResult?.roundScore ?? 0}
              </p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className="text-[11px] uppercase tracking-wide text-white/45">
                Total score
              </p>
              <p className="mt-2 text-2xl font-semibold text-cyan-300">
                {roundResult?.totalScore ?? 0}
              </p>
            </div>
          </div>

          <div className="mb-4 rounded-[24px] border border-white/8 bg-black/20 p-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-white/55">Session progress</span>
              <span className="text-white/75">
                {session?.round}/{session?.maxRounds}
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${currentTheme.button}`}
                style={{
                  width: `${((session?.round || 1) / (session?.maxRounds || 1)) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onExit}
              className="h-12 flex-1 rounded-2xl bg-white/10 text-white hover:bg-white/15"
            >
              Exit
            </Button>

            <Button
              onClick={onNextRound}
              className={`h-12 flex-1 rounded-2xl bg-gradient-to-r ${currentTheme.button} text-[#081017]`}
            >
              Next Round
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}