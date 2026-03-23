import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Gamepad2,
  Crown,
  ShieldCheck,
  PlayCircle,
  RefreshCw,
  ExternalLink,
  Plus,
} from "lucide-react";
import GameLeaderboard from "@/components/play/GameLeaderboard";

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
        <div className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.14),_transparent_30%),linear-gradient(180deg,rgba(11,10,24,0.96),rgba(9,12,18,0.98))] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">
                Play
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                Play & Earn
              </h1>
              <p className="mt-1 text-sm text-white/55">
                Games, rounds, rewards, and leaderboard heat.
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/10">
              <Gamepad2 className="h-5 w-5 text-violet-300" />
            </div>
          </div>

          <div className="mb-4 grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-white/45">
                Tier
              </p>
              <p className="mt-1 flex items-center gap-1 text-sm font-medium text-amber-300">
                {isPlus && <Crown className="h-3.5 w-3.5" />}
                {isPlus ? "Plus" : "Starter"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-white/45">
                Daily zPts
              </p>
              <p className="mt-1 text-sm font-medium text-white/85">
                {user?.daily_zpts_earned || 0}/{dailyZptsCap}
              </p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-white/45">
                Balance
              </p>
              <p className="mt-1 text-sm font-medium text-cyan-300">
                {user?.zpts_balance || 0} zPts
              </p>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-white/45">
                  Internal Arcade
                </p>
                <h3 className="mt-1 text-lg font-semibold text-white">
                  Core Games
                </h3>
              </div>

              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
                Starter Standard
              </div>
            </div>

            <p className="mb-4 text-sm text-white/55">
              All four internal games are available to every user.
            </p>

            <div className="space-y-3">
              {internalGames.map((game) => {
                const Icon = game.icon;
                const theme = themes[game.color];

                return (
                  <motion.button
                    key={game.id}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => onStartGame(game)}
                    className={`w-full rounded-[24px] border p-4 text-left shadow-[0_10px_35px_rgba(0,0,0,0.18)] transition ${theme.shell}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${theme.icon}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="truncate text-base font-semibold text-white">
                            {game.name}
                          </h3>
                          <span className={`text-[11px] font-medium ${theme.accent}`}>
                            {game.rounds} Rounds
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-white/55">
                          {game.description}
                        </p>

                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-[11px] uppercase tracking-wide text-white/40">
                            Level {baseLevel} start
                          </span>

                          <span className="inline-flex items-center gap-1 text-sm font-medium text-white">
                            Launch
                            <PlayCircle className="h-4 w-4 text-cyan-300" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-cyan-300" />
              <h3 className="text-sm font-semibold text-white">
                Community Games
              </h3>
            </div>

            <Button
              onClick={onRefreshPortalGames}
              variant="outline"
              className="h-9 rounded-xl border-white/10 bg-white/5 px-3 text-white hover:bg-white/10"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          <p className="mb-4 text-sm text-white/50">
            Approved browser games from the submission portal.
          </p>

          {portalLoading ? (
            <div className="flex items-center justify-center rounded-2xl border border-white/8 bg-black/20 px-4 py-10 text-white/55">
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Loading community games...
            </div>
          ) : portalGames.length > 0 ? (
            <div className="space-y-3">
              {portalGames.map((game) => (
                <button
                  key={game.game_id}
                  onClick={() =>
                    onStartGame({
                      ...game,
                      type: "portal",
                    })
                  }
                  className="w-full rounded-[22px] border border-cyan-400/12 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.14),_transparent_28%),linear-gradient(180deg,rgba(8,16,23,0.94),rgba(7,12,18,0.98))] p-4 text-left transition hover:bg-white/[0.06]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-semibold text-white">
                        {game.title}
                      </h4>
                      <p className="mt-1 text-xs text-cyan-200/70">
                        {game.category || "community"} • iframe/webview
                      </p>
                      <p className="mt-2 text-sm text-white/55">
                        {game.description ||
                          "Approved submission ready for launch."}
                      </p>
                    </div>

                    <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-6 text-center">
              <p className="text-sm text-white/60">
                {portalError || "No approved community games yet."}
              </p>
            </div>
          )}
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-violet-300" />
              <h3 className="text-sm font-semibold text-white">
                Developer Submission
              </h3>
            </div>

            {isPlus && (
              <div className="rounded-xl border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs font-medium text-violet-200">
                Plus
              </div>
            )}
          </div>

          {isPlus ? (
            <div className="rounded-[22px] border border-violet-400/16 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),_transparent_30%),linear-gradient(180deg,rgba(17,10,32,0.96),rgba(10,10,22,0.98))] p-4">
              <p className="text-sm text-white/70">
                Submission portal is available for Plus developers. This should
                link to your dedicated developer submission flow, not live inside
                PlayTab.
              </p>

              <Button
                onClick={onOpenSubmissionPortal}
                className="mt-4 h-11 rounded-2xl bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 text-[#081017]"
              >
                Open Submission Portal
              </Button>
            </div>
          ) : (
            <div className="rounded-[22px] border border-white/8 bg-black/20 p-4">
              <p className="text-sm text-white/65">
                Submission access is available on Plus.
              </p>

              <p className="mt-2 text-xs text-white/40">
                Upgrade to submit browser games to the ZWAP ecosystem.
              </p>
            </div>
          )}
        </div>

        <GameLeaderboard />
      </div>
    </div>
  );
}