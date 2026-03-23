import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useApp, TIERS } from "@/App";
import api from "@/lib/api";
import { toast } from "sonner";

import { Blocks, Brain, Grid3X3, Sparkles } from "lucide-react";

import BricklesGame from "@/components/games/BricklesGame";
import TriviaGame from "@/components/games/TriviaGame";
import TetrisGame from "@/components/games/TetrisGame";
import SlotsGame from "@/components/games/SlotsGame";

import PlayHome from "@/components/play/PlayHome";
import PlaySessionView from "@/components/play/PlaySessionView";
import PlayRoundSummary from "@/components/play/PlayRoundSummary";
import PlayFinalSummary from "@/components/play/PlayFinalSummary";
import PlaySubmissionPortal from "@/components/play/PlaySubmissionPortal";

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
    icon: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    accent: "text-cyan-300",
    button: "from-cyan-400 via-teal-400 to-violet-400",
  },
  purple: {
    shell:
      "border-violet-400/20 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),_transparent_34%),linear-gradient(180deg,rgba(18,11,36,0.96),rgba(10,10,22,0.98))]",
    icon: "border-violet-400/20 bg-violet-400/10 text-violet-300",
    accent: "text-violet-300",
    button: "from-violet-400 via-fuchsia-400 to-cyan-400",
  },
  pink: {
    shell:
      "border-pink-400/20 bg-[radial-gradient(circle_at_top,_rgba(244,114,182,0.18),_transparent_34%),linear-gradient(180deg,rgba(27,10,24,0.96),rgba(14,9,18,0.98))]",
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
        return { score: totalScore, zwap_earned: 0, zpts_earned: 0 };
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
        return { score: totalScore, zwap_earned: 0, zpts_earned: 0 };
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

  const renderGameStage = () => {
    if (!currentGameData || !session) return null;

    if (currentGameData.type === "portal") {
      return (
        <div className="w-full space-y-3">
          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-cyan-300">Community Game</span>
              <span className="text-white/50">Playable Experience</span>
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
        </div>
      );
    }

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
      <PlayHome
        user={user}
        isPlus={isPlus}
        dailyZptsCap={dailyZptsCap}
        baseLevel={baseLevel}
        internalGames={INTERNAL_GAMES}
        themes={THEMES}
        portalGames={portalGames}
        portalLoading={portalLoading}
        portalError={portalError}
        onRefreshPortalGames={fetchPortalGames}
        onStartGame={startGame}
        onOpenSubmissionPortal={() => setView("submission")}
      />
    );
  }

  if (view === "submission") {
    return <PlaySubmissionPortal onBack={() => setView("home")} />;
  }

  if (view === "round-summary") {
    return (
      <PlayRoundSummary
        roundResult={roundResult}
        session={session}
        currentGameData={currentGameData}
        currentTheme={currentTheme}
        onExit={resetSessionState}
        onNextRound={continueToNextRound}
      />
    );
  }

  if (view === "final-summary") {
    return (
      <PlayFinalSummary
        finalResult={finalResult}
        currentGameData={currentGameData}
        currentTheme={currentTheme}
        isPlus={isPlus}
        rewardPopup={rewardPopup}
        onDone={resetSessionState}
        onPlayAgain={handlePlayAgain}
        onDismissReward={() => setRewardPopup(null)}
      />
    );
  }

  return (
    <PlaySessionView
      currentGameData={currentGameData}
      currentTheme={currentTheme}
      session={session}
      submittingResult={submittingResult}
      onBack={resetSessionState}
      renderGameStage={renderGameStage}
    />
  );
}