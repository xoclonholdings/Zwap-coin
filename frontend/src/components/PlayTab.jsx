import React, { useState, useEffect, useRef, useCallback } from "react";
import { useApp, TIERS } from "@/App";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Gamepad2,
  Blocks,
  Brain,
  Grid3X3,
  Sparkles,
  ChevronLeft,
  HelpCircle,
} from "lucide-react";
import TetrisGame from "@/components/games/TetrisGame";
import SlotsGame from "@/components/games/SlotsGame";
import { allTrivia } from "@/data/education";

// ============ GAME COMPONENTS ============

// zBrickles Game
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
        width: 80 - level * 3,
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
        game.ball.y - game.ball.radius <=
          game.paddle.y + game.paddle.height &&
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
          onGameEnd(game.score, game.blocksDestroyed, level);
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
        onGameEnd(game.score, game.blocksDestroyed, level, true);
      }
    };

    const draw = () => {
      ctx.fillStyle = "#0a0b1e";
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
      ctx.fillText(`Score: ${game.score} | Lvl: ${level}`, 8, 16);
      ctx.fillText("❤️".repeat(game.lives), width - 50, 16);
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
      width={280}
      height={320}
      className="rounded-xl border border-cyan-500/30 mx-auto touch-none"
    />
  );
};

// ============ EDUCATION-POWERED TRIVIA (SERVER-VALIDATED) ============

const TriviaGame = ({ onGameEnd, isPlaying }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [, setShowResult] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [difficulty, setDifficulty] = useState(1);
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
      onGameEnd(score, difficulty);
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
        onGameEnd(score + (correct ? 1 : 0), difficulty);
      }
    }, 1500);
  };

  if (!questions.length) {
    return (
      <div className="flex items-center justify-center h-64 text-cyan-400">
        Loading...
      </div>
    );
  }

  const q = questions[currentQ];
  const actualCorrect = correctAnswer || q.correctAnswer || q.answer;

  return (
    <div className="w-full max-w-sm mx-auto p-4" data-testid="trivia-game">
      <div className="flex justify-between mb-4 text-sm">
        <span className="text-gray-400">
          Q{currentQ + 1}/{questions.length}
        </span>
        <span className="text-purple-400 font-medium">Score: {score}</span>
        <span className={timeLeft < 10 ? "text-red-400" : "text-gray-400"}>
          {timeLeft}s
        </span>
      </div>

      {q.module && (
        <p className="text-gray-500 text-[10px] text-center mb-1">
          {q.module}
        </p>
      )}

      <div className="mb-4 text-white text-center font-medium">
        {q.question}
      </div>

      <div className="space-y-2">
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(opt)}
            disabled={!!selectedAnswer}
            className={`w-full p-3 rounded-xl text-left transition-all border ${
              selectedAnswer === opt
                ? opt === actualCorrect
                  ? "bg-green-500/30 border-green-500"
                  : "bg-red-500/30 border-red-500"
                : selectedAnswer && opt === actualCorrect
                ? "bg-green-500/20 border-green-500/50"
                : "bg-[#141530] border-gray-700 hover:border-cyan-500/50"
            }`}
          >
            <span className="text-white text-sm">{opt}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// ============ MAIN PLAY TAB ============

const colorClasses = {
  cyan: {
    glow: [
      "0 0 10px rgba(0,245,255,0.10)",
      "0 0 20px rgba(0,245,255,0.22)",
      "0 0 10px rgba(0,245,255,0.10)",
    ],
    card: "bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border-cyan-500/30",
    tile: "bg-cyan-500/10 border-cyan-500/30",
    text: "text-cyan-400",
  },
  purple: {
    glow: [
      "0 0 10px rgba(168,85,247,0.10)",
      "0 0 20px rgba(168,85,247,0.22)",
      "0 0 10px rgba(168,85,247,0.10)",
    ],
    card: "bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-purple-500/30",
    tile: "bg-purple-500/10 border-purple-500/30",
    text: "text-purple-400",
  },
  pink: {
    glow: [
      "0 0 10px rgba(236,72,153,0.10)",
      "0 0 20px rgba(236,72,153,0.22)",
      "0 0 10px rgba(236,72,153,0.10)",
    ],
    card: "bg-gradient-to-br from-pink-500/20 to-pink-500/5 border-pink-500/30",
    tile: "bg-pink-500/10 border-pink-500/30",
    text: "text-pink-400",
  },
};

const games = [
  {
    id: "zbrickles",
    name: "zBrickles",
    icon: Blocks,
    color: "cyan",
    description: "Break blocks!",
  },
  {
    id: "ztrivia",
    name: "zTrivia",
    icon: Brain,
    color: "purple",
    description: "Test your crypto knowledge",
  },
  {
    id: "ztetris",
    name: "zTetris",
    icon: Grid3X3,
    color: "pink",
    description: "Stack blocks",
  },
  {
    id: "zslots",
    name: "zSpin",
    icon: Sparkles,
    color: "cyan",
    description: "Pulse the reels",
  },
];

export default function PlayTab() {
  const { user, walletAddress, refreshUser } = useApp();
  const [selectedGame, setSelectedGame] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [rewardPopup, setRewardPopup] = useState(null);
  
  const tierConfig = TIERS[user?.tier || "starter"];
  const gamesPlayed = user?.games_played || 0;
  const baseLevel = Math.min(Math.floor(gamesPlayed / 3) + 1, 10);
  const isPlus = user?.tier === "plus";

  const handleGameEnd = useCallback(
    async (score, blocksOrDifficulty, level = 1, cleared = false) => {
      setIsPlaying(false);
  
      const gameType = selectedGame;
      const blocks = gameType === "zbrickles" ? blocksOrDifficulty : 0;
      const difficulty = gameType === "ztrivia" ? blocksOrDifficulty : level;
  
      try {
        const result = await api.submitGameResult(
          walletAddress,
          gameType,
          score,
          difficulty,
          blocks
        );
  
        setRewardPopup(result);
  
        setGameResult({
          ...result,
          cleared,
          nextLevel: cleared ? level + 1 : level,
        });
  
        await refreshUser();
      } catch (error) {
        toast.error(error.message || "Failed to submit result");
        setGameResult({ score, zwap_earned: 0, zpts_earned: 0 });
      }
    },
    [selectedGame, walletAddress, refreshUser]
  );

  const handleDone = () => {
    setGameResult(null);
    setSelectedGame(null);
    setCurrentLevel(1);
  };

  const handlePlayAgain = () => {
    if (gameResult?.cleared) {
      setCurrentLevel(gameResult.nextLevel);
    }
    setGameResult(null);
    setIsPlaying(true);
  };

  const startGame = (gameId) => {
    setSelectedGame(gameId);
    setIsPlaying(true);
    setGameResult(null);
    setCurrentLevel(Math.max(baseLevel, currentLevel));
  };

  const currentGameData = games.find((g) => g.id === selectedGame);

  if (!selectedGame) {
    return (
      <div
        className="min-h-[calc(100dvh-140px)] bg-[#0a0b1e] flex flex-col px-4 py-4"
        data-testid="play-tab"
      >
        <div className="text-center mb-4">
          <div className="w-14 h-14 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-2 pulse-glow-purple">
            <Gamepad2 className="w-7 h-7 text-purple-400" />
          </div>
          <h1 className="text-xl font-bold text-white">PLAY</h1>
          <p className="text-gray-400 text-xs">Play & Earn</p>
        
          {isPlus && (
            <p className="text-yellow-400 text-xs font-medium mt-1">
              👑 1.5x Rewards
            </p>
          )}
        </div>
        
        <div className="glass-card p-3 mb-4 flex-shrink-0 rounded-xl">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-xs">Daily Z Points</p>
              <p className="text-purple-400 font-bold">
                {user?.daily_zpts_earned || 0} / {tierConfig.dailyZptsCap}
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-xs">Your Balance</p>
              <p className="text-cyan-400 font-bold">
                {user?.zpts_balance || 0} zPts
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 flex-1">
          {games.map((game) => {
            const styles = colorClasses[game.color];

            return (
              <motion.button
                key={game.id}
                data-testid={`game-${game.id}`}
                onClick={() => startGame(game.id)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                animate={{ boxShadow: styles.glow }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col items-center justify-center relative ${styles.card}`}
              >
                <motion.div
                  className={`w-14 h-14 mb-3 rounded-2xl flex items-center justify-center border ${styles.tile}`}
                  animate={{
                    boxShadow: [
                      "0 0 6px rgba(0,245,255,0.15)",
                      "0 0 14px rgba(0,245,255,0.35)",
                      "0 0 6px rgba(0,245,255,0.15)",
                    ],
                  }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                >
                  <game.icon className={`w-7 h-7 ${styles.text}`} />
                </motion.div>

                <h3 className="text-white font-bold text-sm">{game.name}</h3>
                <p className="text-gray-400 text-[10px] text-center">
                  {game.description}
                </p>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-3 text-center text-xs text-gray-500 flex-shrink-0">
          <HelpCircle className="w-3 h-3 inline mr-1" />
          Games get harder = more rewards!
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-[calc(100dvh-140px)] bg-[#0a0b1e] flex flex-col px-4 py-4"
      data-testid="play-tab"
    >
      <div className="flex items-center mb-4 flex-shrink-0">
        <button
          onClick={() => {
            setSelectedGame(null);
            setIsPlaying(false);
            setGameResult(null);
          }}
          className="text-gray-400 hover:text-white transition mr-3"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3">
          {currentGameData?.icon && (
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <currentGameData.icon className="w-5 h-5 text-cyan-400" />
            </div>
          )}
        
          <div>
            <h1 className="text-lg font-bold text-white">
              {currentGameData?.name}
            </h1>
        
            <p className="text-[11px] text-gray-500">
              {currentGameData?.description}
            </p>
        
            {isPlus && (
              <p className="text-[11px] text-yellow-400 font-medium mt-1">
                👑 1.5x Rewards
              </p>
            )}
          </div>
        </div>

        {(selectedGame === "zbrickles" || selectedGame === "ztetris") && (
          <span className="ml-auto text-cyan-400 text-sm font-medium">
            Level {currentLevel}
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center items-center">
        {isPlaying && selectedGame === "zbrickles" && (
          <BricklesGame
            level={currentLevel}
            onGameEnd={handleGameEnd}
            isPlaying={isPlaying}
          />
        )}

        {isPlaying && selectedGame === "ztrivia" && (
          <TriviaGame onGameEnd={handleGameEnd} isPlaying={isPlaying} />
        )}

        {isPlaying && selectedGame === "ztetris" && (
          <TetrisGame
            level={currentLevel}
            onGameEnd={handleGameEnd}
            isPlaying={isPlaying}
          />
        )}

        {isPlaying && selectedGame === "zslots" && (
          <div className="w-full max-w-sm">
            <div className="glass-card rounded-2xl p-3 mb-3 border border-cyan-500/20">
              <div className="flex items-center justify-between text-xs">
                <span className="text-cyan-400 font-medium">zSpin Arcade</span>
                <span className="text-gray-500">Pulse the reels</span>
              </div>
            </div>

            <SlotsGame
              level={currentLevel}
              onGameEnd={handleGameEnd}
              isPlaying={isPlaying}
            />
          </div>
        )}

        {!isPlaying && gameResult && !rewardPopup && (
          <div className="w-full max-w-sm glass-card rounded-2xl p-6 text-center">
            <h2 className="text-white font-bold text-xl mb-2">Run Complete</h2>
            <p className="text-gray-400 text-sm mb-5">
              {currentGameData?.name} results
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Score</span>
                <span className="text-white font-bold">
                  {gameResult.score}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">zPts Earned</span>
                <span className="text-cyan-400 font-bold">
                  {gameResult.zpts_earned}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">zWAP Earned</span>
                <span className="text-purple-400 font-bold">
                  {gameResult.zwap_earned}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleDone} className="flex-1 bg-gray-700">
                Done
              </Button>
              <Button
                onClick={handlePlayAgain}
                className="flex-1 bg-cyan-500 text-black"
              >
                Play Again
              </Button>
            </div>
                    </div>
                    )}
                  </div>
            
                  {rewardPopup && (
                      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60">
                        <motion.div
                          initial={{ scale: 0.85, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className={`rounded-2xl p-6 text-center w-72 border ${
                            isPlus
                              ? "bg-gradient-to-br from-purple-900/40 to-black border-purple-500/40"
                              : "bg-[#0a0b1e] border-cyan-500/30"
                          }`}
                        >
                          <h2 className="text-white text-lg font-bold mb-2">
                            {isPlus ? "Bonus Reward" : "Session Reward"}
                          </h2>
                    
                          <p className="text-purple-400 text-xl font-bold">
                            +{rewardPopup.zwap_earned || 0} ZWAP
                          </p>
                    
                          <p className={`text-sm mb-4 ${isPlus ? "text-pink-400" : "text-cyan-400"}`}>
                            +{rewardPopup.zpts_earned || 0} zPts
                          </p>
                    
                          {isPlus && (
                            <p className="text-xs text-purple-300 mb-3">
                              ✨ Plus Bonus Applied
                            </p>
                          )}
                    
                          <Button
                            onClick={() => setRewardPopup(null)}
                            className={`w-full ${isPlus ? "bg-purple-500 text-white" : "bg-cyan-500 text-black"}`}
                          >
                            Continue
                          </Button>
                        </motion.div>
                      </div>
                    )}
            
                </div>
              );
            }