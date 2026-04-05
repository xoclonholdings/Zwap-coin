import React from "react";
import { Gamepad2 } from "lucide-react";

import PlayCoreGamesCard from "@/components/play/PlayCoreGamesCard";
import PlayMomentumCard from "@/components/play/PlayMomentumCard";

export default function PlayHome({
  user,
  isPlus,
  dailyZptsCap,
  baseLevel,
  internalGames,
  themes,
  portalGames,
  portalLoading,
  portalError,
  onRefreshPortalGames,
  onStartGame,
  onOpenSubmissionPortal,
}) {
  return (
    <div
      className="min-h-[calc(100dvh-140px)] bg-[#081017] px-4 py-4 text-white"
      data-testid="play-tab"
    >
      <div className="mx-auto w-full max-w-md space-y-4">
        <div className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.18),transparent_35%),linear-gradient(180deg,rgba(18,11,36,0.96),rgba(10,10,22,0.98))] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[11px] uppercase tracking-[0.28em] text-violet-200/70">
                  Play
                </p>

                <div className="rounded-xl border border-amber-400/25 bg-[linear-gradient(180deg,rgba(251,191,36,0.18),rgba(251,191,36,0.08))] px-2.5 py-1 text-[11px] font-medium text-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.10)]">
                  {isPlus ? "Zitizen" : "Zwapper"}
                </div>
              </div>

              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                Play & Earn
              </h1>

              <p className="mt-1 text-sm text-violet-50/65">
                Progress through rounds, stack rewards, and build momentum.
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/25 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.22),rgba(168,85,247,0.10))] shadow-[0_0_24px_rgba(168,85,247,0.14)]">
              <Gamepad2 className="h-5 w-5 text-violet-300" />
            </div>
          </div>
        </div>

        <PlayCoreGamesCard
          user={user}
          dailyZptsCap={dailyZptsCap}
          baseLevel={baseLevel}
          internalGames={internalGames}
          themes={themes}
          onStartGame={onStartGame}
        />

        <PlayMomentumCard
          isPlus={isPlus}
          portalGames={portalGames}
          portalLoading={portalLoading}
          portalError={portalError}
          onRefreshPortalGames={onRefreshPortalGames}
          onStartGame={onStartGame}
          onOpenSubmissionPortal={onOpenSubmissionPortal}
        />
      </div>
    </div>
  );
}