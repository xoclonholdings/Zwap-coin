import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useApp, TIERS } from "@/App";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gamepad2,
  Blocks,
  Brain,
  Grid3X3,
  Sparkles,
  ChevronLeft,
  Crown,
  ShieldCheck,
  PlayCircle,
  RefreshCw,
  ExternalLink,
  Loader2,
} from "lucide-react";
import TetrisGame from "@/components/games/TetrisGame";
import SlotsGame from "@/components/games/SlotsGame";
import BricklesGame from "@/components/games/BricklesGame";
import TriviaGame from "@/components/games/TriviaGame";
import GameLeaderboard from "@/components/play/GameLeaderboard";

const INTERNAL_GAMES = [
  {
    id: "zbrickles",
    name: "zBrickles",
    icon: Blocks,
    color: "cyan",
    description: "Break blocks and clear neon walls.",
    rounds: 3,
    type: "internal",
  },
  {
    id: "ztrivia",
    name: "zTrivia",
    icon: Brain,
    color: "purple",
    description: "Test your crypto knowledge.",
    rounds: 3,
    type: "internal",
  },
  {
    id: "ztetris",
    name: "zTetris",
    icon: Grid3X3,
    color: "pink",
    description: "Stack fast and survive the drop.",
    rounds: 3,
    type: "internal",
  },
  {
    id: "zslots",
    name: "zSpin",
    icon: Sparkles,
    color: "cyan",
    description: "Pulse the reels and chase big runs.",
    rounds: 3,
    type: "internal",
  },
];

const THEMES = {
  cyan: {
    shell:
      "border-cyan-400/20 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_34%),linear-gradient(180deg,rgba(7,20,28,0.96),rgba(7,14,20,0.98))]",
    panel: "border-cyan-400/16 bg-cyan-400/[0.08]",
    icon: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    accent: "text-cyan-300",
    button: "from-cyan-400 via-teal-400 to-violet-400",
  },
  purple: {
    shell:
      "border-violet-400/20 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),_transparent_34%),linear-gradient(180deg,rgba(18,11,36,0.96),rgba(10,10,22,0.98))]",
    panel: "border-violet-400/16 bg-violet-400/[0.08]",
    icon: "border-violet-400/20 bg-violet-400/10 text-violet-300",
    accent: "text-violet-300",
    button: "from-violet-400 via-fuchsia-400 to-cyan-400",
  },
  pink: {
    shell:
      "border-pink-400/20 bg-[radial-gradient(circle_at_top,_rgba(244,114,182,0.18),_transparent_34%),linear-gradient(180deg,rgba(27,10,24,0.96),rgba(14,9,18,0.98))]",
    panel: "border-pink-400/16 bg-pink-400/[0.08]",
    icon: "border-pink-400/20 bg-pink-400/10 text-pink-300",
    accent: "text-pink-300",
    button: "from-pink-400 via-fuchsia-400 to-violet-400",
  },
};

function getTierDailyZptsCap(tierConfig) {
  return tierConfig?.daily_zpts_cap ?? tierConfig?.dailyZptsCap ?? 75;
}

export default function PlayTab() {
  const { user, walletAddress, refreshUser } = useApp();

  const [view, setView] = useState("home");
  const [selectedGame, setSelectedGame] = useState(null);

  const [portalGames, setPortalGames] = useState([]);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState("");

  const [session, setSession] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [roundResult, setRoundResult] = useState(null);
  const [finalResult, setFinalResult] = useState(null);
  const [rewardPopup, setRewardPopup] = useState(null);
  const [submittingResult, setSubmittingResult] = useState(false);

  const isPlus = user?.tier === "plus";
  const tierConfig = TIERS[user?.tier || "starter"];
  const dailyZptsCap = getTierDailyZptsCap(tierConfig);
  const gamesPlayed = user?.games_played || 0;
  const baseLevel = Math.min(Math.floor(gamesPlayed / 3) + 1, 10);

  const currentGameData = useMemo(() => {
    if (!selectedGame) return null;
    if (selectedGame.type === "portal") return selectedGame;
    return INTERNAL_GAMES.find((game) => game.id === selectedGame.id) || null;
  }, [selectedGame]);

  const currentTheme = THEMES[currentGameData?.color || "cyan"];

  const resetSessionState = useCallback(() => {
    setSelectedGame(null);
    setSession(null);
    setIsPlaying(false);
    setRoundResult(null);
    setFinalResult(null);
    setRewardPopup(null);
    setSubmittingResult(false);
    setView("home");
  }, []);

  const fetchPortalGames = useCallback(async () => {
    setPortalLoading(true);
    setPortalError("");

    try {
      if (typeof api.getApprovedGames !== "function") {
        setPortalGames([]);
        return;
      }

      const res = await api.getApprovedGames();
      const items = Array.isArray(res) ? res : res?.games || [];
      setPortalGames(items);
    } catch (error) {
      setPortalGames([]);
      setPortalError(error.message || "Unable to load community games");
    } finally {
      setPortalLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortalGames();
  }, [fetchPortalGames]);

  const startGame = useCallback(
    (game) => {
      const normalized =
        game.type === "portal"
          ? {
              id: game.game_id,
              name: game.title,
              description: game.description || "Community browser game",
              game_url: game.game_url,
              type: "portal",
              rounds: 1,
              color: "cyan",
              category: game.category,
            }
          : game;

      setSelectedGame(normalized);
      setSession({
        gameId: normalized.id,
        gameType: normalized.type,
        round: 1,
        maxRounds: normalized.type === "portal" ? 1 : normalized.rounds || 3,
        totalScore: 0,
        roundScores: [],
        level: baseLevel,
        blocksDestroyed: 0,
      });
      setRoundResult(null);
      setFinalResult(null);
      setRewardPopup(null);
      setIsPlaying(true);
      setView("session");
    },
    [baseLevel]
  );

  const submitFinalSession = useCallback(
    async ({ gameType, totalScore, level, blocksDestroyed }) => {
      if (!walletAddress) {
        toast.info("Connect your wallet to record rewards");
        return {
          score: totalScore,
          zwap_earned: 0,
          zpts_earned: 0,
        };
      }

      setSubmittingResult(true);

      try {
        const result = await api.submitGameResult(
          walletAddress,
          gameType,
          totalScore,
          level,
          blocksDestroyed || 0
        );
        setRewardPopup(result);
        await refreshUser();
        return result;
      } catch (error) {
        toast.error(error.message || "Failed to submit result");
        return {
          score: totalScore,
          zwap_earned: 0,
          zpts_earned: 0,
        };
      } finally {
        setSubmittingResult(false);
      }
    },
    [walletAddress, refreshUser]
  );

  const handleInternalRoundEnd = useCallback(
    async ({ score, blocksDestroyed = 0, level = 1, cleared = false }) => {
      if (!session || !selectedGame) return;

      const totalScore = session.totalScore + score;
      const roundScores = [...session.roundScores, score];
      const totalBlocks = (session.blocksDestroyed || 0) + blocksDestroyed;
      const nextLevel = cleared ? level + 1 : level;
      const isFinalRound = session.round >= session.maxRounds;

      setIsPlaying(false);

      if (!isFinalRound) {
        setRoundResult({
          round: session.round,
          roundScore: score,
          totalScore,
          blocksDestroyed: totalBlocks,
          nextLevel,
        });
        setSession((prev) => ({
          ...prev,
          totalScore,
          roundScores,
          blocksDestroyed: totalBlocks,
          level: nextLevel,
        }));
        setView("round-summary");
        return;
      }

      const rewardResult = await submitFinalSession({
        gameType: selectedGame.id,
        totalScore,
        level: nextLevel,
        blocksDestroyed: totalBlocks,
      });

      setSession((prev) => ({
        ...prev,
        totalScore,
        roundScores,
        blocksDestroyed: totalBlocks,
        level: nextLevel,
      }));

      setFinalResult({
        ...rewardResult,
        game: selectedGame.name,
        score: totalScore,
        roundsPlayed: session.maxRounds,
        roundScores,
      });
      setView("final-summary");
    },
    [session, selectedGame, submitFinalSession]
  );

  const continueToNextRound = useCallback(() => {
    if (!session || !roundResult) return;

    setSession((prev) => ({
      ...prev,
      round: prev.round + 1,
      totalScore: roundResult.totalScore,
      blocksDestroyed: roundResult.blocksDestroyed,
      level: roundResult.nextLevel,
      roundScores: [...prev.roundScores],
    }));
    setRoundResult(null);
    setIsPlaying(true);
    setView("session");
  }, [session, roundResult]);

  const handlePlayAgain = useCallback(() => {
    if (!currentGameData) return;
    startGame(currentGameData);
  }, [currentGameData, startGame]);
  
    // =========================
  // GAME START
  // =========================

  const startGame = useCallback(
    (game) => {
      const normalized =
        game.type === "portal"
          ? {
              id: game.game_id,
              name: game.title,
              description: game.description || "Community browser game",
              game_url: game.game_url,
              type: "portal",
              rounds: 1,
              color: "cyan",
              category: game.category,
            }
          : game;

      setSelectedGame(normalized);

      setSession({
        gameId: normalized.id,
        gameType: normalized.type,
        round: 1,
        maxRounds: normalized.type === "portal" ? 1 : normalized.rounds || 3,
        totalScore: 0,
        roundScores: [],
        level: baseLevel,
        blocksDestroyed: 0,
      });

      setRoundResult(null);
      setFinalResult(null);
      setRewardPopup(null);
      setIsPlaying(true);
      setView("session");
    },
    [baseLevel]
  );

  // =========================
  // FINAL SUBMISSION
  // =========================

  const submitFinalSession = useCallback(
    async ({ gameType, totalScore, level, blocksDestroyed }) => {
      if (!walletAddress) {
        toast.info("Connect your wallet to record rewards");
        return {
          score: totalScore,
          zwap_earned: 0,
          zpts_earned: 0,
        };
      }

      setSubmittingResult(true);

      try {
        const result = await api.submitGameResult(
          walletAddress,
          gameType,
          totalScore,
          level,
          blocksDestroyed || 0
        );

        setRewardPopup(result);
        await refreshUser();

        return result;
      } catch (error) {
        toast.error(error.message || "Failed to submit result");

        return {
          score: totalScore,
          zwap_earned: 0,
          zpts_earned: 0,
        };
      } finally {
        setSubmittingResult(false);
      }
    },
    [walletAddress, refreshUser]
  );

  // =========================
  // ROUND HANDLER
  // =========================

  const handleInternalRoundEnd = useCallback(
    async ({ score, blocksDestroyed = 0, level = 1, cleared = false }) => {
      if (!session || !selectedGame) return;

      const totalScore = session.totalScore + score;
      const roundScores = [...session.roundScores, score];
      const totalBlocks = (session.blocksDestroyed || 0) + blocksDestroyed;
      const nextLevel = cleared ? level + 1 : level;
      const isFinalRound = session.round >= session.maxRounds;

      setIsPlaying(false);

      // ---- NOT FINAL ROUND ----
      if (!isFinalRound) {
        setRoundResult({
          round: session.round,
          roundScore: score,
          totalScore,
          blocksDestroyed: totalBlocks,
          nextLevel,
        });

        setSession((prev) => ({
          ...prev,
          totalScore,
          roundScores,
          blocksDestroyed: totalBlocks,
          level: nextLevel,
        }));

        setView("round-summary");
        return;
      }

      // ---- FINAL ROUND ----
      const rewardResult = await submitFinalSession({
        gameType: selectedGame.id,
        totalScore,
        level: nextLevel,
        blocksDestroyed: totalBlocks,
      });

      setSession((prev) => ({
        ...prev,
        totalScore,
        roundScores,
        blocksDestroyed: totalBlocks,
        level: nextLevel,
      }));

      setFinalResult({
        ...rewardResult,
        game: selectedGame.name,
        score: totalScore,
        roundsPlayed: session.maxRounds,
        roundScores,
      });

      setView("final-summary");
    },
    [session, selectedGame, submitFinalSession]
  );

  // =========================
  // NEXT ROUND
  // =========================

  const continueToNextRound = useCallback(() => {
    if (!session || !roundResult) return;

    setSession((prev) => ({
      ...prev,
      round: prev.round + 1,
      totalScore: roundResult.totalScore,
      blocksDestroyed: roundResult.blocksDestroyed,
      level: roundResult.nextLevel,
      roundScores: [...prev.roundScores],
    }));

    setRoundResult(null);
    setIsPlaying(true);
    setView("session");
  }, [session, roundResult]);

  // =========================
  // REPLAY
  // =========================

  const handlePlayAgain = useCallback(() => {
    if (!currentGameData) return;
    startGame(currentGameData);
  }, [currentGameData, startGame]);

  // =========================
  // GAME RENDER SWITCH
  // =========================

  const renderGameStage = () => {
    if (!currentGameData || !session) return null;

    // ---- PORTAL GAME ----
    if (currentGameData.type === "portal") {
      return (
        <div className="w-full space-y-3">
          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-cyan-300">
                Community Game
              </span>
              <span className="text-white/50">Plus Access</span>
            </div>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#081017]">
            <iframe
              title={currentGameData.name}
              src={currentGameData.game_url}
              className="h-[62vh] min-h-[480px] w-full"
              allow="fullscreen"
            />
          </div>

          <Button
            onClick={async () => {
              const rewardResult = {
                score: 0,
                zwap_earned: 0,
                zpts_earned: 0,
              };

              setFinalResult({
                ...rewardResult,
                game: currentGameData.name,
                score: 0,
                roundsPlayed: 1,
                roundScores: [0],
              });

              setView("final-summary");
            }}
            className="h-12 w-full rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-violet-400 text-[#081017]"
          >
            Finish Session
          </Button>
        </div>
      );
    }

    // ---- INTERNAL GAMES ----
    if (currentGameData.id === "zbrickles") {
      return (
        <BricklesGame
          level={session.level}
          round={session.round}
          onGameEnd={handleInternalRoundEnd}
          isPlaying={isPlaying}
        />
      );
    }

    if (currentGameData.id === "ztrivia") {
      return (
        <TriviaGame
          level={session.level}
          round={session.round}
          onGameEnd={handleInternalRoundEnd}
          isPlaying={isPlaying}
        />
      );
    }

    if (currentGameData.id === "ztetris") {
      return (
        <TetrisGame
          level={session.level}
          round={session.round}
          onGameEnd={(score, difficultyOrLevel, level = 1, cleared = false) =>
            handleInternalRoundEnd({
              score,
              blocksDestroyed: 0,
              level: difficultyOrLevel || level,
              cleared,
            })
          }
          isPlaying={isPlaying}
        />
      );
    }

    if (currentGameData.id === "zslots") {
      return (
        <SlotsGame
          level={session.level}
          round={session.round}
          onGameEnd={(score, difficultyOrLevel, level = 1, cleared = false) =>
            handleInternalRoundEnd({
              score,
              blocksDestroyed: 0,
              level: difficultyOrLevel || level,
              cleared,
            })
          }
          isPlaying={isPlaying}
        />
      );
    }

    return null;
  };
  
    if (view === "home") {
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
                {INTERNAL_GAMES.map((game) => {
                  const Icon = game.icon;
                  const theme = THEMES[game.color];

                  return (
                    <motion.button
                      key={game.id}
                      whileTap={{ scale: 0.985 }}
                      onClick={() => startGame(game)}
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
                onClick={fetchPortalGames}
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading community games...
              </div>
            ) : portalGames.length > 0 ? (
              <div className="space-y-3">
                {portalGames.map((game) => (
                  <button
                    key={game.game_id}
                    onClick={() =>
                      startGame({
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
                          {game.description || "Approved submission ready for launch."}
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
                  Submission portal is available for Plus developers. This should link
                  to your dedicated developer submission flow, not live inside PlayTab.
                </p>

                <Button className="mt-4 h-11 rounded-2xl bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 text-[#081017]">
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

  if (view === "round-summary" && roundResult && session && currentGameData) {
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
                  {currentGameData.name}
                </h1>
                <p className="mt-1 text-sm text-white/55">
                  Nice. Round {roundResult.round} is complete.
                </p>
              </div>

              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${currentTheme.icon}`}>
                <Trophy className="h-5 w-5" />
              </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <p className="text-[11px] uppercase tracking-wide text-white/45">
                  Round score
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {roundResult.roundScore}
                </p>
              </div>

              <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <p className="text-[11px] uppercase tracking-wide text-white/45">
                  Total score
                </p>
                <p className="mt-2 text-2xl font-semibold text-cyan-300">
                  {roundResult.totalScore}
                </p>
              </div>
            </div>

            <div className="mb-4 rounded-[24px] border border-white/8 bg-black/20 p-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-white/55">Session progress</span>
                <span className="text-white/75">
                  {session.round}/{session.maxRounds}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${currentTheme.button}`}
                  style={{ width: `${(session.round / session.maxRounds) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={resetSessionState}
                className="h-12 flex-1 rounded-2xl bg-white/10 text-white hover:bg-white/15"
              >
                Exit
              </Button>

              <Button
                onClick={continueToNextRound}
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

  if (view === "final-summary" && finalResult && currentGameData) {
    return (
      <div className="min-h-[calc(100dvh-140px)] bg-[#081017] px-4 py-4 text-white">
        <div className="mx-auto w-full max-w-md space-y-4">
          <div className={`rounded-[28px] border border-white/10 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] ${currentTheme.shell}`}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">
                  Session Complete
                </p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                  {currentGameData.name}
                </h1>
                <p className="mt-1 text-sm text-white/55">
                  Final totals from your run.
                </p>
              </div>

              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${currentTheme.icon}`}>
                <Trophy className="h-5 w-5" />
              </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <p className="text-[11px] uppercase tracking-wide text-white/45">
                  Total score
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {finalResult.score}
                </p>
              </div>

              <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <p className="text-[11px] uppercase tracking-wide text-white/45">
                  Rounds
                </p>
                <p className="mt-2 text-2xl font-semibold text-cyan-300">
                  {finalResult.roundsPlayed}
                </p>
              </div>
            </div>

            <div className="mb-4 rounded-[24px] border border-white/8 bg-black/20 p-4">
              <div className="space-y-3">
                {finalResult.roundScores?.map((value, index) => (
                  <div
                    key={`${index}-${value}`}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-white/55">Round {index + 1}</span>
                    <span className="font-medium text-white">{value}</span>
                  </div>
                ))}

                <div className="border-t border-white/10 pt-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/55">zPts Earned</span>
                    <span className="font-medium text-cyan-300">
                      {finalResult.zpts_earned || 0}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-white/55">ZWAP Earned</span>
                    <span className="font-medium text-violet-300">
                      {finalResult.zwap_earned || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={resetSessionState}
                className="h-12 flex-1 rounded-2xl bg-white/10 text-white hover:bg-white/15"
              >
                Done
              </Button>

              <Button
                onClick={handlePlayAgain}
                className={`h-12 flex-1 rounded-2xl bg-gradient-to-r ${currentTheme.button} text-[#081017]`}
              >
                Play Again
              </Button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {rewardPopup && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className={`w-full max-w-[320px] rounded-[28px] border p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.4)] ${currentTheme.shell}`}
              >
                <h2 className="text-lg font-semibold text-white">
                  {isPlus ? "Bonus Reward" : "Session Reward"}
                </h2>

                <p className="mt-4 text-3xl font-semibold text-violet-300">
                  +{rewardPopup.zwap_earned || 0} ZWAP
                </p>

                <p className="mt-2 text-base text-cyan-300">
                  +{rewardPopup.zpts_earned || 0} zPts
                </p>

                {isPlus && (
                  <p className="mt-3 text-xs text-violet-200/80">
                    Plus multiplier applied
                  </p>
                )}

                <Button
                  onClick={() => setRewardPopup(null)}
                  className={`mt-5 h-12 w-full rounded-2xl bg-gradient-to-r ${currentTheme.button} text-[#081017]`}
                >
                  Continue
                </Button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-140px)] bg-[#081017] px-4 py-4 text-white">
      <div className="mx-auto w-full max-w-md space-y-4">
        <div className={`rounded-[28px] border border-white/10 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] ${currentTheme.shell}`}>
          <div className="mb-4 flex items-center">
            <button
              onClick={resetSessionState}
              className="mr-3 rounded-2xl border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex min-w-0 items-center gap-3">
              {currentGameData?.icon ? (
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${currentTheme.icon}`}>
                  <currentGameData.icon className="h-5 w-5" />
                </div>
              ) : (
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${currentTheme.icon}`}>
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
                    width: `${(((session?.round || 1) - 1) / (session?.maxRounds || 1)) * 100}%`,
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