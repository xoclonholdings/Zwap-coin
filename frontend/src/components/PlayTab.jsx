import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  Trophy,
  Globe,
  MapPin,
  Orbit,
  PlayCircle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import TetrisGame from "@/components/games/TetrisGame";
import SlotsGame from "@/components/games/SlotsGame";
import { allTrivia } from "@/data/education";

// ======================================================
// INTERNAL GAME COMPONENTS
// ======================================================

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
    description: "Stack clean. Think fast.",
    rounds: 3,
    type: "internal",
  },
  {
    id: "zslots",
    name: "zSpin",
    icon: Sparkles,
    color: "cyan",
    description: "Pulse the reels.",
    rounds: 3,
    type: "internal",
  },
];

const GAME_THEME = {
  cyan: {
    accent: "text-cyan-300",
    iconBg: "bg-cyan-400/10 border-cyan-400/20",
    tileBg:
      "border-cyan-400/20 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_transparent_35%),linear-gradient(180deg,rgba(8,20,28,0.96),rgba(7,15,22,0.98))]",
    subtle: "text-cyan-200/80",
    button: "from-cyan-400 via-teal-400 to-violet-400",
  },
  purple: {
    accent: "text-violet-300",
    iconBg: "bg-violet-400/10 border-violet-400/20",
    tileBg:
      "border-violet-400/20 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),_transparent_35%),linear-gradient(180deg,rgba(16,12,30,0.96),rgba(10,10,24,0.98))]",
    subtle: "text-violet-200/80",
    button: "from-violet-400 via-fuchsia-400 to-cyan-400",
  },
  pink: {
    accent: "text-pink-300",
    iconBg: "bg-pink-400/10 border-pink-400/20",
    tileBg:
      "border-pink-400/20 bg-[radial-gradient(circle_at_top,_rgba(244,114,182,0.18),_transparent_35%),linear-gradient(180deg,rgba(26,10,26,0.96),rgba(15,9,19,0.98))]",
    subtle: "text-pink-200/80",
    button: "from-pink-400 via-fuchsia-400 to-violet-400",
  },
};

const LEADERBOARD_SCOPE_OPTIONS = [
  { id: "local", label: "Local", icon: MapPin, enabled: false },
  { id: "regional", label: "Regional", icon: Orbit, enabled: false },
  { id: "global", label: "Global", icon: Globe, enabled: true },
];

const BricklesGame = ({ onGameEnd, isPlaying, level }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!isPlaying || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    const ballSpeed = 4 + level * 0.5;
    const brickRows = Math.min(4 + Math.floor(level / 2), 7);

    const game = {
      paddle: {
        x: width / 2 - 40,
        y: height - 25,
        width: Math.max(52, 80 - level * 3),
        height: 10,
      },
      ball: {
        x: width / 2,
        y: height - 45,
        dx: ballSpeed,
        dy: -ballSpeed,
        radius: 7,
      },
      bricks: [],
      score: 0,
      blocksDestroyed: 0,
      lives: 3,
      isRunning: true,
    };

    const brickCols = 7;
    const brickWidth = (width - 30) / brickCols;
    const brickHeight = 18;

    for (let row = 0; row < brickRows; row++) {
      for (let col = 0; col < brickCols; col++) {
        game.bricks.push({
          x: 15 + col * brickWidth,
          y: 30 + row * (brickHeight + 3),
          width: brickWidth - 3,
          height: brickHeight,
          alive: true,
          color: `hsl(${180 + row * 25}, 100%, ${60 - row * 5}%)`,
        });
      }
    }

    const handleMove = (clientX) => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      game.paddle.x = Math.max(
        0,
        Math.min(width - game.paddle.width, x - game.paddle.width / 2)
      );
    };

    const handleTouch = (e) => {
      e.preventDefault();
      handleMove(e.touches[0].clientX);
    };

    const handleMouse = (e) => {
      handleMove(e.clientX);
    };

    canvas.addEventListener("touchmove", handleTouch, { passive: false });
    canvas.addEventListener("mousemove", handleMouse);

    const update = () => {
      if (!game.isRunning) return;

      game.ball.x += game.ball.dx;
      game.ball.y += game.ball.dy;

      if (
        game.ball.x <= game.ball.radius ||
        game.ball.x >= width - game.ball.radius
      ) {
        game.ball.dx *= -1;
      }

      if (game.ball.y <= game.ball.radius) {
        game.ball.dy *= -1;
      }

      if (
        game.ball.y + game.ball.radius >= game.paddle.y &&
        game.ball.y - game.ball.radius <= game.paddle.y + game.paddle.height &&
        game.ball.x >= game.paddle.x &&
        game.ball.x <= game.paddle.x + game.paddle.width
      ) {
        game.ball.dy = -Math.abs(game.ball.dy);
        const hitPos = (game.ball.x - game.paddle.x) / game.paddle.width;
        game.ball.dx = (ballSpeed + 2) * (hitPos - 0.5);
      }

      game.bricks.forEach((brick) => {
        if (!brick.alive) return;

        if (
          game.ball.x >= brick.x &&
          game.ball.x <= brick.x + brick.width &&
          game.ball.y - game.ball.radius <= brick.y + brick.height &&
          game.ball.y + game.ball.radius >= brick.y
        ) {
          brick.alive = false;
          game.ball.dy *= -1;
          game.score += 10 + level * 2;
          game.blocksDestroyed++;
        }
      });

      if (game.ball.y > height) {
        game.lives--;

        if (game.lives <= 0) {
          game.isRunning = false;
          onGameEnd({
            score: game.score,
            blocksDestroyed: game.blocksDestroyed,
            level,
            cleared: false,
          });
          return;
        }

        game.ball.x = width / 2;
        game.ball.y = height - 45;
        game.ball.dx = ballSpeed;
        game.ball.dy = -ballSpeed;
      }

      if (game.bricks.every((b) => !b.alive)) {
        game.isRunning = false;
        game.score += 500 + level * 100;
        onGameEnd({
          score: game.score,
          blocksDestroyed: game.blocksDestroyed,
          level,
          cleared: true,
        });
      }
    };

    const draw = () => {
      ctx.fillStyle = "#09111a";
      ctx.fillRect(0, 0, width, height);

      game.bricks.forEach((brick) => {
        if (!brick.alive) return;
        ctx.fillStyle = brick.color;
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
      });

      ctx.shadowColor = "#00f5ff";
      ctx.shadowBlur = 8;
      ctx.fillStyle = "#00f5ff";
      ctx.fillRect(
        game.paddle.x,
        game.paddle.y,
        game.paddle.width,
        game.paddle.height
      );
      ctx.shadowBlur = 0;

      ctx.beginPath();
      ctx.shadowColor = "#ff00ff";
      ctx.shadowBlur = 12;
      ctx.fillStyle = "#ff00ff";
      ctx.arc(game.ball.x, game.ball.y, game.ball.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = "#fff";
      ctx.font = "12px 'Exo 2'";
      ctx.fillText(`Score: ${game.score} | Lvl: ${level}`, 10, 18);
      ctx.fillText("❤️".repeat(game.lives), width - 56, 18);
    };

    const gameLoop = () => {
      update();
      draw();
      if (game.isRunning) {
        animationRef.current = requestAnimationFrame(gameLoop);
      }
    };

    gameLoop();

    return () => {
      canvas.removeEventListener("touchmove", handleTouch);
      canvas.removeEventListener("mousemove", handleMouse);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, level, onGameEnd]);

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={380}
      className="w-full max-w-[340px] rounded-[24px] border border-cyan-400/20 bg-[#09111a] touch-none"
    />
  );
};

const TriviaGame = ({ onGameEnd, isPlaying, level }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [, setShowResult] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [difficulty, setDifficulty] = useState(level || 1);
  const startTimeRef = useRef(Date.now());

  const loadQuestions = useCallback(async () => {
    try {
      const res = await api.getTriviaQuestions(5, difficulty);
      const qs = res.questions || res;

      if (Array.isArray(qs) && qs.length > 0) {
        setQuestions(qs);
      } else {
        const shuffled = [...allTrivia]
          .sort(() => Math.random() - 0.5)
          .slice(0, 5);

        setQuestions(
          shuffled.map((t, i) => ({
            id: `local-${i}`,
            question: t.question,
            options: t.options,
            correctAnswer: t.answer,
            module: t.moduleTitle,
          }))
        );
      }
    } catch {
      const shuffled = [...allTrivia]
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);

      setQuestions(
        shuffled.map((t, i) => ({
          id: `local-${i}`,
          question: t.question,
          options: t.options,
          correctAnswer: t.answer,
          module: t.moduleTitle,
        }))
      );
    }

    setCurrentQ(0);
    setScore(0);
    setTimeLeft(30);
    setCorrectAnswer(null);
    startTimeRef.current = Date.now();
  }, [difficulty]);

  const handleTimeout = useCallback(() => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((c) => c + 1);
      setTimeLeft(30);
      setCorrectAnswer(null);
      startTimeRef.current = Date.now();
    } else {
      onGameEnd({
        score,
        blocksDestroyed: 0,
        level: difficulty,
        cleared: score >= 3,
      });
    }
  }, [currentQ, questions.length, score, difficulty, onGameEnd]);

  useEffect(() => {
    if (isPlaying) loadQuestions();
  }, [isPlaying, loadQuestions]);

  useEffect(() => {
    if (!isPlaying || !questions.length) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          handleTimeout();
          return 30;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, currentQ, handleTimeout, questions.length]);

  const handleAnswer = async (answer) => {
    if (selectedAnswer) return;

    setSelectedAnswer(answer);
    setShowResult(true);

    const timeTaken = (Date.now() - startTimeRef.current) / 1000;
    const q = questions[currentQ];
    let correct = false;

    try {
      const res = await api.checkTriviaAnswer(q.id, answer, timeTaken);
      correct = res.correct;
      setCorrectAnswer(res.correct_answer);

      if (correct) {
        setScore((s) => s + 1 + Math.round(res.time_bonus || 0));
        setDifficulty((d) => Math.min(d + 1, 5));
      }
    } catch {
      correct = answer === (q.correctAnswer || q.answer);
      setCorrectAnswer(q.correctAnswer || q.answer);
      if (correct) setScore((s) => s + 1);
    }

    setTimeout(() => {
      setShowResult(false);
      setSelectedAnswer(null);
      setCorrectAnswer(null);

      if (currentQ < questions.length - 1) {
        setCurrentQ((c) => c + 1);
        setTimeLeft(30);
        startTimeRef.current = Date.now();
      } else {
        onGameEnd({
          score: score + (correct ? 1 : 0),
          blocksDestroyed: 0,
          level: difficulty,
          cleared: score + (correct ? 1 : 0) >= 3,
        });
      }
    }, 1200);
  };

  if (!questions.length) {
    return (
      <div className="flex h-64 items-center justify-center text-cyan-300">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading questions...
      </div>
    );
  }

  const q = questions[currentQ];
  const actualCorrect = correctAnswer || q.correctAnswer || q.answer;

  return (
    <div className="w-full max-w-sm rounded-[24px] border border-violet-400/20 bg-black/20 p-4">
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="text-white/55">
          Q{currentQ + 1}/{questions.length}
        </span>
        <span className="font-medium text-violet-300">Score: {score}</span>
        <span className={timeLeft < 10 ? "text-red-300" : "text-white/55"}>
          {timeLeft}s
        </span>
      </div>

      {q.module && (
        <p className="mb-2 text-center text-[10px] text-white/35">{q.module}</p>
      )}

      <div className="mb-4 text-center text-base font-medium text-white">
        {q.question}
      </div>

      <div className="space-y-2">
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(opt)}
            disabled={!!selectedAnswer}
            className={`w-full rounded-2xl border p-3 text-left transition-all ${
              selectedAnswer === opt
                ? opt === actualCorrect
                  ? "border-green-400 bg-green-500/20"
                  : "border-red-400 bg-red-500/20"
                : selectedAnswer && opt === actualCorrect
                ? "border-green-400/50 bg-green-500/10"
                : "border-white/10 bg-white/5 hover:border-violet-400/40"
            }`}
          >
            <span className="text-sm text-white">{opt}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// ======================================================
// HELPERS
// ======================================================

function getTierDailyZptsCap(tierConfig) {
  return tierConfig?.daily_zpts_cap ?? tierConfig?.dailyZptsCap ?? 75;
}

function normalizeLeaderboard(rows = []) {
  return rows.map((row, index) => ({
    rank: row.rank || index + 1,
    username: row.username || row.wallet || row.wallet_address || "zwapper",
    value: row.value ?? row.score ?? 0,
    wallet: row.wallet || row.wallet_address || "",
    tier: row.tier || "starter",
  }));
}

function LeaderboardChart({ data }) {
  const maxValue = Math.max(...data.map((d) => Number(d.value) || 0), 1);

  return (
    <div className="space-y-3">
      {data.map((entry) => {
        const width = Math.max((Number(entry.value || 0) / maxValue) * 100, 8);

        return (
          <div key={`${entry.rank}-${entry.username}`} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[11px] text-white/70">
                  {entry.rank}
                </span>
                <span className="truncate text-white/85">{entry.username}</span>
              </div>
              <span className="text-cyan-300">{entry.value}</span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400"
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ======================================================
// MAIN
// ======================================================

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

  const [leaderboardScope, setLeaderboardScope] = useState("global");
  const [leaderboardGame, setLeaderboardGame] = useState("games");
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState("");

  const isPlus = user?.tier === "plus";
  const tierConfig = TIERS[user?.tier || "starter"];
  const dailyZptsCap = getTierDailyZptsCap(tierConfig);
  const gamesPlayed = user?.games_played || 0;
  const baseLevel = Math.min(Math.floor(gamesPlayed / 3) + 1, 10);

  const featuredInternalGames = useMemo(() => {
    if (isPlus) return INTERNAL_GAMES;
    return INTERNAL_GAMES.filter((g) => ["zbrickles", "ztrivia"].includes(g.id));
  }, [isPlus]);

  const currentGameData =
    selectedGame &&
    (selectedGame.type === "portal"
      ? selectedGame
      : INTERNAL_GAMES.find((g) => g.id === selectedGame.id));

  const currentTheme = GAME_THEME[currentGameData?.color || "cyan"];

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

  const fetchLeaderboard = useCallback(async () => {
    setLeaderboardLoading(true);
    setLeaderboardError("");

    try {
      if (leaderboardScope !== "global") {
        setLeaderboardData([]);
        setLeaderboardError("Local and regional game leaderboards need user location + game score storage.");
        return;
      }

      const categoryMap = {
        zbrickles: "games",
        ztrivia: "games",
        ztetris: "games",
        zslots: "games",
        games: "games",
      };

      const category = categoryMap[leaderboardGame] || "games";
      const res = await api.getLeaderboard(category, 5);
      setLeaderboardData(normalizeLeaderboard(res));
    } catch (error) {
      setLeaderboardData([]);
      setLeaderboardError(error.message || "Unable to load leaderboard");
    } finally {
      setLeaderboardLoading(false);
    }
  }, [leaderboardGame, leaderboardScope]);

  useEffect(() => {
    fetchPortalGames();
  }, [fetchPortalGames]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

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

  const startGame = useCallback(
    (game) => {
      const gameConfig =
        game.type === "portal"
          ? {
              id: game.game_id,
              name: game.title,
              description: game.description || "Community game",
              game_url: game.game_url,
              type: "portal",
              rounds: 1,
              color: "cyan",
              category: game.category,
            }
          : game;

      setSelectedGame(gameConfig);
      setSession({
        gameId: gameConfig.id,
        gameType: gameConfig.type,
        round: 1,
        maxRounds: gameConfig.type === "portal" ? 1 : gameConfig.rounds || 3,
        totalScore: 0,
        roundScores: [],
        level: baseLevel,
        blocksDestroyed: 0,
        startedAt: Date.now(),
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
    async (payload) => {
      if (!walletAddress) {
        toast.info("Connect your wallet to record rewards");
        return {
          score: payload.totalScore,
          zwap_earned: 0,
          zpts_earned: 0,
        };
      }

      setSubmittingResult(true);

      try {
        const result = await api.submitGameResult(
          walletAddress,
          payload.gameType,
          payload.totalScore,
          payload.level,
          payload.blocksDestroyed || 0
        );

        setRewardPopup(result);
        await refreshUser();
        return result;
      } catch (error) {
        toast.error(error.message || "Failed to submit result");
        return {
          score: payload.totalScore,
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

      const nextRound = session.round + 1;
      const totalScore = session.totalScore + score;
      const roundScores = [...session.roundScores, score];
      const totalBlocks = (session.blocksDestroyed || 0) + blocksDestroyed;

      setIsPlaying(false);

      const roundPayload = {
        round: session.round,
        roundScore: score,
        totalScore,
        nextLevel: cleared ? level + 1 : level,
        blocksDestroyed: totalBlocks,
        cleared,
      };

      const isFinalRound = session.round >= session.maxRounds;

      if (!isFinalRound) {
        setRoundResult(roundPayload);
        setSession((prev) => ({
          ...prev,
          totalScore,
          roundScores,
          blocksDestroyed: totalBlocks,
          level: cleared ? level + 1 : level,
        }));
        setView("round-summary");
        return;
      }

      const rewardResult = await submitFinalSession({
        gameType: selectedGame.id,
        totalScore,
        level: cleared ? level + 1 : level,
        blocksDestroyed: totalBlocks,
      });

      setFinalResult({
        ...rewardResult,
        game: selectedGame.name,
        roundsPlayed: session.maxRounds,
        roundScores,
        score: totalScore,
      });

      setSession((prev) => ({
        ...prev,
        totalScore,
        roundScores,
        blocksDestroyed: totalBlocks,
        level: cleared ? level + 1 : level,
      }));
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
      level: roundResult.nextLevel || prev.level,
      blocksDestroyed: roundResult.blocksDestroyed || prev.blocksDestroyed,
      roundScores: [...prev.roundScores],
    }));
    setRoundResult(null);
    setIsPlaying(true);
    setView("session");
  }, [session, roundResult]);

  const handlePlayAgain = useCallback(() => {
    if (!selectedGame) return;
    startGame(selectedGame.type === "portal" ? selectedGame : selectedGame);
  }, [selectedGame, startGame]);

  const renderGameStage = () => {
    if (!selectedGame || !session) return null;

    if (selectedGame.type === "portal") {
      return (
        <div className="w-full rounded-[26px] border border-white/10 bg-black/20 p-3">
          <div className="mb-3 flex items-center justify-between rounded-2xl border border-white/8 bg-white/5 p-3">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-white/45">
                Community game
              </p>
              <p className="mt-1 text-sm font-medium text-white/85">
                External web experience
              </p>
            </div>
            <ExternalLink className="h-4 w-4 text-cyan-300" />
          </div>

          <div className="overflow-hidden rounded-[20px] border border-white/8 bg-[#081017]">
            <iframe
              title={selectedGame.name}
              src={selectedGame.game_url}
              className="h-[62vh] min-h-[480px] w-full"
              allow="fullscreen"
            />
          </div>

          <div className="mt-3">
            <Button
              onClick={async () => {
                const rewardResult = await submitFinalSession({
                  gameType: "zbrickles",
                  totalScore: 0,
                  level: 1,
                  blocksDestroyed: 0,
                });

                setFinalResult({
                  ...rewardResult,
                  game: selectedGame.name,
                  roundsPlayed: 1,
                  roundScores: [0],
                  score: 0,
                });
                setView("final-summary");
              }}
              className="h-12 w-full rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-violet-400 text-sm font-semibold text-[#081017]"
            >
              Finish Session
            </Button>
          </div>
        </div>
      );
    }

    if (selectedGame.id === "zbrickles") {
      return (
        <BricklesGame
          level={session.level}
          onGameEnd={handleInternalRoundEnd}
          isPlaying={isPlaying}
        />
      );
    }

    if (selectedGame.id === "ztrivia") {
      return (
        <TriviaGame
          level={session.level}
          onGameEnd={handleInternalRoundEnd}
          isPlaying={isPlaying}
        />
      );
    }

    if (selectedGame.id === "ztetris") {
      return (
        <TetrisGame
          level={session.level}
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

    if (selectedGame.id === "zslots") {
      return (
        <div className="w-full max-w-sm">
          <div className="mb-3 rounded-2xl border border-cyan-400/20 bg-white/5 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-cyan-300">zSpin Arcade</span>
              <span className="text-white/45">Pulse the reels</span>
            </div>
          </div>

          <SlotsGame
            level={session.level}
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
        </div>
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
                    Session ladder
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-white">
                    Internal Arcade
                  </h3>
                </div>
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
                  3 Rounds
                </div>
              </div>

              <p className="mb-4 text-sm text-white/55">
                Internal games now flow through multi-round sessions before final rewards.
              </p>

              <div className="space-y-3">
                {featuredInternalGames.map((game) => {
                  const Icon = game.icon;
                  const theme = GAME_THEME[game.color];

                  return (
                    <motion.button
                      key={game.id}
                      whileTap={{ scale: 0.985 }}
                      onClick={() => startGame(game)}
                      className={`w-full rounded-[24px] border p-4 text-left shadow-[0_10px_35px_rgba(0,0,0,0.18)] transition ${theme.tileBg}`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${theme.iconBg}`}
                        >
                          <Icon className={`h-5 w-5 ${theme.accent}`} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="truncate text-base font-semibold text-white">
                              {game.name}
                            </h3>
                            <span className={`text-[11px] font-medium ${theme.subtle}`}>
                              Lv {baseLevel}+
                            </span>
                          </div>

                          <p className="mt-1 text-sm text-white/55">
                            {game.description}
                          </p>

                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-[11px] uppercase tracking-wide text-white/40">
                              {game.rounds} round session
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
                <h3 className="text-sm font-semibold text-white">Community Games</h3>
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
                    className="w-full rounded-[22px] border border-white/8 bg-black/20 p-4 text-left transition hover:bg-white/[0.06]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="truncate text-sm font-semibold text-white">
                          {game.title}
                        </h4>
                        <p className="mt-1 text-xs text-white/45">
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
            <div className="mb-3 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-violet-300" />
              <h3 className="text-sm font-semibold text-white">Leaderboard</h3>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {[
                { id: "zbrickles", label: "zBrickles" },
                { id: "ztrivia", label: "zTrivia" },
                { id: "ztetris", label: "zTetris" },
                { id: "zslots", label: "zSpin" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setLeaderboardGame(item.id)}
                  className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${
                    leaderboardGame === item.id
                      ? "border-violet-400/30 bg-violet-400/10 text-violet-200"
                      : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="mb-4 flex gap-2">
              {LEADERBOARD_SCOPE_OPTIONS.map((scope) => {
                const Icon = scope.icon;
                const active = leaderboardScope === scope.id;

                return (
                  <button
                    key={scope.id}
                    onClick={() => {
                      if (!scope.enabled) {
                        toast.info(`${scope.label} leaderboards need location + game score storage`);
                        return;
                      }
                      setLeaderboardScope(scope.id);
                    }}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                      active
                        ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-200"
                        : scope.enabled
                        ? "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                        : "border-white/8 bg-white/[0.03] text-white/25"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {scope.label}
                  </button>
                );
              })}
            </div>

            {leaderboardLoading ? (
              <div className="flex items-center justify-center rounded-2xl border border-white/8 bg-black/20 px-4 py-10 text-white/55">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading leaderboard...
              </div>
            ) : leaderboardData.length > 0 ? (
              <div className="rounded-[22px] border border-white/8 bg-black/20 p-4">
                <LeaderboardChart data={leaderboardData} />
              </div>
            ) : (
              <div className="rounded-[22px] border border-white/8 bg-black/20 p-4 text-sm text-white/55">
                {leaderboardError || "Leaderboard data not available yet."}
              </div>
            )}
          </div>
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
                  Nice. Round {roundResult.round} is in the bag.
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                <Trophy className="h-5 w-5 text-cyan-300" />
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
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400"
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
                className="h-12 flex-1 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-violet-400 text-[#081017]"
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
          <div className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.14),_transparent_30%),linear-gradient(180deg,rgba(8,17,23,0.96),rgba(8,14,20,0.98))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
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

              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${currentTheme.iconBg}`}>
                <Trophy className={`h-5 w-5 ${currentTheme.accent}`} />
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
                  <div key={`${index}-${value}`} className="flex items-center justify-between text-sm">
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
                className="h-12 flex-1 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-violet-400 text-[#081017]"
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
                className={`w-full max-w-[320px] rounded-[28px] border p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.4)] ${
                  isPlus
                    ? "border-violet-400/30 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.22),_transparent_35%),linear-gradient(180deg,rgba(17,10,28,0.98),rgba(10,10,18,0.98))]"
                    : "border-cyan-400/20 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_transparent_35%),linear-gradient(180deg,rgba(8,16,23,0.98),rgba(8,12,18,0.98))]"
                }`}
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
                  className="mt-5 h-12 w-full rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-violet-400 text-[#081017]"
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
        <div className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.14),_transparent_30%),linear-gradient(180deg,rgba(8,17,23,0.96),rgba(8,14,20,0.98))] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="mb-4 flex items-center">
            <button
              onClick={resetSessionState}
              className="mr-3 rounded-2xl border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex min-w-0 items-center gap-3">
              {currentGameData?.icon ? (
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${currentTheme.iconBg}`}>
                  <currentGameData.icon className={`h-5 w-5 ${currentTheme.accent}`} />
                </div>
              ) : (
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${currentTheme.iconBg}`}>
                  <Gamepad2 className={`h-5 w-5 ${currentTheme.accent}`} />
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
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400"
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
