import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Gamepad2,
  ShieldCheck,
  PlayCircle,
  RefreshCw,
  ExternalLink,
  Plus,
  ChevronRight,
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
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">
                  Play
                </p>

                <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[11px] font-medium text-amber-300">
                  {isPlus ? "Plus" : "Starter"}
                </div>
              </div>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                Play & Earn
              </h1>
              <p className="mt-1 text-sm text-white/55">
                Progress through rounds, stack rewards, and climb the board.
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/10">
              <Gamepad2 className="h-5 w-5 text-violet-300" />
            </div>
          </div>

          <div className="mb-4 grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-white/45">
                ZWAP
              </p>
              <p className="mt-1 text-sm font-medium text-violet-300">
                {user?.zwap_balance ?? 0}
              </p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-white/45">
                zPts
              </p>
              <p className="mt-1 text-sm font-medium text-cyan-300">
                {user?.zpts_balance ?? 0}
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
          </div>

          <div className="rounded-[24px] border border-cyan-400/12 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.10),_transparent_32%),linear-gradient(180deg,rgba(8,16,23,0.96),rgba(7,12,18,0.98))] p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-white/45">
                  Core Arcade
                </p>
                <h3 className="mt-1 text-lg font-semibold text-white">
                  Game Modes
                </h3>
              </div>

              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
                Infinite Play
              </div>
            </div>

            <p className="mb-4 text-sm text-white/55">
              Progress through rounds, increase difficulty, and stack rewards.
            </p>

            <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {internalGames.map((game) => {
                const Icon = game.icon;
                const theme = themes[game.color];

                return (
                  <motion.button
                    key={game.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onStartGame(game)}
                    className={`min-w-[260px] max-w-[260px] rounded-[22px] border p-4 text-left shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition ${theme.shell}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${theme.icon}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="truncate text-[15px] font-semibold text-white">
                            {game.name}
                          </h3>
                        </div>

                        <p className="mt-1 line-clamp-2 text-sm text-white/60">
                          {game.description}
                        </p>

                        <div className="mt-3 flex items-center justify-between">
                          <span className={`text-[11px] font-medium ${theme.accent}`}>
                            Round progression
                          </span>

                          <span className="inline-flex items-center gap-1 text-sm font-medium text-white">
                            Launch
                            <PlayCircle className="h-4 w-4 text-cyan-300" />
                          </span>
                        </div>

                        <p className="mt-1 text-[11px] uppercase tracking-wide text-white/35">
                          Level {baseLevel} start
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.08),_transparent_24%),linear-gradient(180deg,rgba(10,16,23,0.96),rgba(8,12,18,0.98))] p-4 backdrop-blur-sm">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-cyan-300" />
                <h3 className="text-sm font-semibold text-white">
                  Community Portal
                </h3>
              </div>
              <p className="mt-1 text-sm text-white/50">
                Approved games and developer submission access.
              </p>
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

          <div className="rounded-[22px] border border-cyan-400/14 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_26%),linear-gradient(180deg,rgba(8,16,23,0.94),rgba(7,12,18,0.98))] p-3">
            <div className="mb-2">
              <p className="text-[11px] uppercase tracking-wide text-cyan-200/65">
                Approved Community Games
              </p>
              <p className="mt-1 text-sm text-white/60">
                Browser games from the submission portal.
              </p>
            </div>

            {portalLoading ? (
              <div className="flex items-center justify-center rounded-2xl border border-white/8 bg-black/20 px-4 py-6 text-white/55">
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Loading community games...
              </div>
            ) : portalGames.length > 0 ? (
              <div className="space-y-2">
                {portalGames.map((game) => (
                  <button
                    key={game.game_id}
                    onClick={() =>
                      onStartGame({
                        ...game,
                        type: "portal",
                      })
                    }
                    className="w-full rounded-2xl border border-cyan-400/12 bg-cyan-400/[0.05] px-3 py-3 text-left transition hover:bg-cyan-400/[0.09]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="truncate text-sm font-semibold text-white">
                          {game.title}
                        </h4>
                        <p className="mt-0.5 text-[11px] text-cyan-200/70">
                          {game.category || "community"} • iframe/webview
                        </p>
                        <p className="mt-1 text-sm text-white/55">
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
              <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-5 text-center">
                <p className="text-sm text-white/60">
                  {portalError || "No approved community games yet."}
                </p>
              </div>
            )}
          </div>

          <div className="mt-3 rounded-[22px] border border-violet-400/16 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),_transparent_28%),linear-gradient(180deg,rgba(17,10,32,0.96),rgba(10,10,22,0.98))] p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-violet-300" />
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-violet-200/65">
                    Developer Submission
                  </p>
                  <p className="mt-1 text-sm text-white/60">
                    Submit browser games into the ZWAP ecosystem.
                  </p>
                </div>
              </div>
            </div>

            {isPlus ? (
              <div className="rounded-2xl border border-violet-400/14 bg-black/20 p-3">
                <p className="text-sm text-white/70">
                  Open the submission portal to send your game for review and approval.
                </p>

                <Button
                  onClick={onOpenSubmissionPortal}
                  className="mt-3 h-11 w-full rounded-2xl bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 text-[#081017]"
                >
                  Open Submission Portal
                </Button>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
                <p className="text-sm text-white/65">
                  Submission access is available on Plus.
                </p>

                <p className="mt-1 text-xs text-white/40">
                  Upgrade to submit browser games to the ZWAP ecosystem.
                </p>
              </div>
            )}
          </div>
        </div>

        <GameLeaderboard />
      </div>
    </div>
  );
}