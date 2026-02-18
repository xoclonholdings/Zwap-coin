import React, { useState, useEffect, useRef, useCallback } from "react";
import { useApp, TIERS } from "@/App";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Gamepad2, Play, Trophy, Lock, Crown, ChevronLeft, HelpCircle } from "lucide-react";
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
      paddle: { x: width / 2 - 40, y: height - 25, width: 80 - level * 3, height: 10 },
      ball: { x: width / 2, y: height - 45, dx: ballSpeed, dy: -ballSpeed, radius: 7 },
      bricks: [],
      score: 0,
      blocksDestroyed: 0,
      lives: 3,
      isRunning: true
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
          color: `hsl(${180 + row * 25}, 100%, ${60 - row * 5}%)`
        });
      }
    }

    const handleMove = (clientX) => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      game.paddle.x = Math.max(0, Math.min(width - game.paddle.width, x - game.paddle.width / 2));
    };

    const handleTouch = (e) => { e.preventDefault(); handleMove(e.touches[0].clientX); };
    const handleMouse = (e) => { handleMove(e.clientX); };

    canvas.addEventListener("touchmove", handleTouch, { passive: false });
    canvas.addEventListener("mousemove", handleMouse);

    const update = () => {
      if (!game.isRunning) return;

      game.ball.x += game.ball.dx;
      game.ball.y += game.ball.dy;

      if (game.ball.x <= game.ball.radius || game.ball.x >= width - game.ball.radius) game.ball.dx *= -1;
      if (game.ball.y <= game.ball.radius) game.ball.dy *= -1;

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

      game.bricks.forEach(brick => {
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

      if (game.bricks.every(b => !b.alive)) {
        game.isRunning = false;
        game.score += 500 + level * 100;
        onGameEnd(game.score, game.blocksDestroyed, level, true);
      }
    };

    const draw = () => {
      ctx.fillStyle = "#0a0b1e";
      ctx.fillRect(0, 0, width, height);

      game.bricks.forEach(brick => {
        if (!brick.alive) return;
        ctx.fillStyle = brick.color;
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
      });

      ctx.shadowColor = "#00f5ff"; ctx.shadowBlur = 8;
      ctx.fillStyle = "#00f5ff";
      ctx.fillRect(game.paddle.x, game.paddle.y, game.paddle.width, game.paddle.height);
      ctx.shadowBlur = 0;

      ctx.beginPath();
      ctx.shadowColor = "#ff00ff"; ctx.shadowBlur = 12;
      ctx.fillStyle = "#ff00ff";
      ctx.arc(game.ball.x, game.ball.y, game.ball.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = "#fff";
      ctx.font = "12px 'Exo 2'";
      ctx.fillText(`Score: ${game.score} | Lvl: ${level}`, 8, 16);
      ctx.fillText(`❤️`.repeat(game.lives), width - 50, 16);
    };

    const gameLoop = () => {
      update(); draw();
      if (game.isRunning) animationRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      canvas.removeEventListener("touchmove", handleTouch);
      canvas.removeEventListener("mousemove", handleMouse);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, level, onGameEnd]);

  return <canvas ref={canvasRef} width={280} height={320} className="rounded-xl border border-cyan-500/30 mx-auto touch-none" />;
};

// ============ EDUCATION-POWERED TRIVIA (SERVER-VALIDATED) ============

const TriviaGame = ({ onGameEnd, isPlaying }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
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
        // Fallback to local education spine
        const shuffled = [...allTrivia].sort(() => Math.random() - 0.5).slice(0, 5);
        setQuestions(shuffled.map((t, i) => ({ id: `local-${i}`, question: t.question, options: t.options, correctAnswer: t.answer, module: t.moduleTitle })));
      }
    } catch {
      const shuffled = [...allTrivia].sort(() => Math.random() - 0.5).slice(0, 5);
      setQuestions(shuffled.map((t, i) => ({ id: `local-${i}`, question: t.question, options: t.options, correctAnswer: t.answer, module: t.moduleTitle })));
    }
    setCurrentQ(0); setScore(0); setTimeLeft(30); setCorrectAnswer(null);
    startTimeRef.current = Date.now();
  }, [difficulty]);

  const handleTimeout = useCallback(() => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(c => c + 1); setTimeLeft(30); setCorrectAnswer(null);
      startTimeRef.current = Date.now();
    } else { onGameEnd(score, difficulty); }
  }, [currentQ, questions.length, score, difficulty, onGameEnd]);

  useEffect(() => { if (isPlaying) loadQuestions(); }, [isPlaying, loadQuestions]);

  useEffect(() => {
    if (!isPlaying || showResult || !questions.length) return;
    const timer = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { handleTimeout(); return 30; } return t - 1; });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, currentQ, showResult, handleTimeout, questions.length]);

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
      if (correct) { setScore(s => s + 1 + Math.round(res.time_bonus || 0)); setDifficulty(d => Math.min(d + 1, 5)); }
    } catch {
      correct = answer === (q.correctAnswer || q.answer);
      setCorrectAnswer(q.correctAnswer || q.answer);
      if (correct) setScore(s => s + 1);
    }
    setTimeout(() => {
      setShowResult(false); setSelectedAnswer(null); setCorrectAnswer(null);
      if (currentQ < questions.length - 1) { setCurrentQ(c => c + 1); setTimeLeft(30); startTimeRef.current = Date.now(); }
      else { onGameEnd(score + (correct ? 1 : 0), difficulty); }
    }, 1500);
  };

  if (!questions.length) return <div className="flex items-center justify-center h-64 text-cyan-400">Loading...</div>;
  const q = questions[currentQ];
  const actualCorrect = correctAnswer || q.correctAnswer || q.answer;

  return (
    <div className="w-full max-w-sm mx-auto p-4" data-testid="trivia-game">
      <div className="flex justify-between mb-4 text-sm">
        <span className="text-gray-400">Q{currentQ + 1}/{questions.length}</span>
        <span className="text-purple-400 font-medium">Score: {score}</span>
        <span className={`${timeLeft < 10 ? 'text-red-400' : 'text-gray-400'}`}>{timeLeft}s</span>
      </div>
      {q.module && <p className="text-gray-500 text-[10px] text-center mb-1">{q.module}</p>}
      <div className="mb-4 text-white text-center font-medium">{q.question}</div>
      <div className="space-y-2">
        {q.options.map((opt, i) => (
          <button key={i} onClick={() => handleAnswer(opt)} disabled={!!selectedAnswer}
            className={`w-full p-3 rounded-xl text-left transition-all ${
              selectedAnswer === opt
                ? opt === actualCorrect ? 'bg-green-500/30 border-green-500' : 'bg-red-500/30 border-red-500'
                : selectedAnswer && opt === actualCorrect ? 'bg-green-500/20 border-green-500/50'
                : 'bg-[#141530] border-gray-700 hover:border-cyan-500/50'
            } border`}>
            <span className="text-white text-sm">{opt}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// ============ MAIN PLAY TAB ============

export default function PlayTab() {
  const { user, walletAddress, refreshUser } = useApp();
  const [selectedGame, setSelectedGame] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);

  const tierConfig = TIERS[user?.tier || "starter"];
  const isPlusUser = user?.tier === "plus";

  const games = [
    { id: "zbrickles", name: "zBrickles", icon: "🧱", color: "cyan", description: "Break blocks!", locked: false },
    { id: "ztrivia", name: "zTrivia", icon: "❓", color: "purple", description: "Test your crypto knowledge", locked: false },
    { id: "ztetris", name: "zTetris", icon: "🎮", color: "pink", description: "Stack blocks", locked: !isPlusUser },
    { id: "zslots", name: "zSlots", icon: "🎰", color: "yellow", description: "Try your luck", locked: !isPlusUser },
  ];

  const handleGameEnd = useCallback(async (score, blocksOrDifficulty, level = 1, cleared = false) => {
    setIsPlaying(false);

    const gameType = selectedGame;
    const blocks = gameType === "zbrickles" ? blocksOrDifficulty : 0;
    const difficulty = gameType === "ztrivia" ? blocksOrDifficulty : level;

    try {
      const result = await api.submitGameResult(walletAddress, gameType, score, difficulty, blocks);
      setGameResult({
        ...result,
        cleared,
        nextLevel: cleared ? level + 1 : level
      });
      await refreshUser();
    } catch (error) {
      toast.error(error.message || "Failed to submit result");
      setGameResult({ score, zwap_earned: 0, zpts_earned: 0 });
    }
  }, [selectedGame, walletAddress, refreshUser]);

  const handleClaim = () => {
    setGameResult(null);
    setSelectedGame(null);
    setCurrentLevel(1);
  };

  const handlePlayAgain = () => {
    if (gameResult?.cleared) setCurrentLevel(gameResult.nextLevel);
    setGameResult(null);
    setIsPlaying(true);
  };

  const startGame = (gameId) => {
    const game = games.find(g => g.id === gameId);
    if (game?.locked) {
      toast.error("Upgrade to Plus to unlock this game!");
      return;
    }
    setSelectedGame(gameId);
    setIsPlaying(true);
    setGameResult(null);
  };

  // Game selection screen
  if (!selectedGame) {
    return (
      <div className="min-h-[calc(100dvh-140px)] bg-[#0a0b1e] flex flex-col px-4 py-4" data-testid="play-tab">
        <div className="text-center mb-4">
          <div className="w-14 h-14 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-2 pulse-glow-purple">
            <Gamepad2 className="w-7 h-7 text-purple-400" />
          </div>
          <h1 className="text-xl font-bold text-white">PLAY</h1>
          <p className="text-gray-400 text-xs">Play & Earn</p>
        </div>

        {/* Z Points info */}
        <div className="glass-card p-3 mb-4 flex-shrink-0 rounded-xl">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-xs">Daily Z Points</p>
              <p className="text-purple-400 font-bold">{user?.daily_zpts_earned || 0} / {tierConfig.dailyZptsCap}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-xs">Your Balance</p>
              <p className="text-cyan-400 font-bold">{user?.zpts_balance || 0} zPts</p>
            </div>
          </div>
        </div>

        {/* Game grid */}
        <div className="grid grid-cols-2 gap-3 flex-1">
          {games.map((game) => (
            <button
              key={game.id}
              data-testid={`game-${game.id}`}
              onClick={() => startGame(game.id)}
              className={`p-4 rounded-2xl border transition-all duration-200 active:scale-[0.98] flex flex-col items-center justify-center relative ${
                game.locked 
                  ? 'bg-gray-800/50 border-gray-700 opacity-60' 
                  : `bg-gradient-to-br from-${game.color}-500/20 to-${game.color}-500/5 border-${game.color}-500/30`
              }`}
            >
              {game.locked && (
                <div className="absolute top-2 right-2">
                  <Lock className="w-4 h-4 text-gray-500" />
                </div>
              )}
              <span className="text-3xl mb-2">{game.icon}</span>
              <h3 className="text-white font-bold text-sm">{game.name}</h3>
              <p className="text-gray-400 text-[10px] text-center">{game.description}</p>
              {game.locked && (
                <span className="text-[10px] text-yellow-400 mt-1 flex items-center gap-1">
                  <Crown className="w-3 h-3" /> Plus
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-3 text-center text-xs text-gray-500 flex-shrink-0">
          <HelpCircle className="w-3 h-3 inline mr-1" />
          Games get harder = more rewards!
        </div>
      </div>
    );
  }

  // Active game or result screen
  return (
    <div className="min-h-[calc(100dvh-140px)] bg-[#0a0b1e] flex flex-col px-4 py-4" data-testid="play-tab">
      <div className="flex items-center mb-3 flex-shrink-0">
        <button onClick={() => { setSelectedGame(null); setIsPlaying(false); setGameResult(null); }} className="text-gray-400 mr-3">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-white">{games.find(g => g.id === selectedGame)?.name}</h1>
        {selectedGame === "zbrickles" && <span className="ml-auto text-cyan-400 text-sm">Level {currentLevel}</span>}
      </div>

      <div className="flex-1 flex flex-col justify-center items-center">
        {isPlaying && selectedGame === "zbrickles" && (
          <BricklesGame level={currentLevel} onGameEnd={handleGameEnd} isPlaying={isPlaying} />
        )}

        {isPlaying && selectedGame === "ztrivia" && (
          <TriviaGame onGameEnd={handleGameEnd} isPlaying={isPlaying} />
        )}

        {isPlaying && selectedGame === "ztetris" && (
          <TetrisGame level={currentLevel} onGameEnd={handleGameEnd} isPlaying={isPlaying} />
        )}

        {isPlaying && selectedGame === "zslots" && (
          <SlotsGame level={currentLevel} onGameEnd={handleGameEnd} isPlaying={isPlaying} />
        )}

        {!isPlaying && gameResult && (
          <div className="flex flex-col items-center space-y-4 text-center">
            <h2 className="text-white font-bold text-lg">Game Over!</h2>
            <p className="text-gray-400 text-sm">Score: {gameResult.score}</p>
            <p className="text-cyan-400 text-sm">zPts Earned: {gameResult.zpts_earned}</p>
            <p className="text-purple-400 text-sm">zWAP Earned: {gameResult.zwap_earned}</p>

            <div className="flex space-x-3 mt-2">
              <Button onClick={handleClaim} className="bg-gray-700">Claim</Button>
              <Button onClick={handlePlayAgain} className="bg-cyan-500 text-black">Play Again</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
