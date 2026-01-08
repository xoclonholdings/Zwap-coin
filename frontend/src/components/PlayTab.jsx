import React, { useState, useEffect, useRef, useCallback } from "react";
import { useApp, api } from "@/App";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Gamepad2, Play, Coins, Trophy } from "lucide-react";

const BricklesGame = ({ onGameEnd, isPlaying }) => {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!isPlaying || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    const game = {
      paddle: { x: width / 2 - 40, y: height - 25, width: 80, height: 10 },
      ball: { x: width / 2, y: height - 45, dx: 4, dy: -4, radius: 7 },
      bricks: [],
      score: 0,
      blocksDestroyed: 0,
      lives: 3,
      isRunning: true
    };

    const brickRows = 4;
    const brickCols = 7;
    const brickWidth = (width - 30) / brickCols;
    const brickHeight = 18;
    const brickPadding = 3;

    for (let row = 0; row < brickRows; row++) {
      for (let col = 0; col < brickCols; col++) {
        game.bricks.push({
          x: 15 + col * brickWidth,
          y: 30 + row * (brickHeight + brickPadding),
          width: brickWidth - brickPadding,
          height: brickHeight,
          alive: true,
          color: `hsl(${180 + row * 25}, 100%, ${60 - row * 5}%)`
        });
      }
    }

    gameRef.current = game;

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

      if (game.ball.y + game.ball.radius >= game.paddle.y && game.ball.y - game.ball.radius <= game.paddle.y + game.paddle.height &&
          game.ball.x >= game.paddle.x && game.ball.x <= game.paddle.x + game.paddle.width) {
        game.ball.dy = -Math.abs(game.ball.dy);
        const hitPos = (game.ball.x - game.paddle.x) / game.paddle.width;
        game.ball.dx = 6 * (hitPos - 0.5);
      }

      game.bricks.forEach(brick => {
        if (!brick.alive) return;
        if (game.ball.x >= brick.x && game.ball.x <= brick.x + brick.width &&
            game.ball.y - game.ball.radius <= brick.y + brick.height && game.ball.y + game.ball.radius >= brick.y) {
          brick.alive = false;
          game.ball.dy *= -1;
          game.score += 10;
          game.blocksDestroyed++;
        }
      });

      if (game.ball.y > height) {
        game.lives--;
        if (game.lives <= 0) { game.isRunning = false; onGameEnd(game.score, game.blocksDestroyed); return; }
        game.ball.x = width / 2; game.ball.y = height - 45; game.ball.dx = 4; game.ball.dy = -4;
      }

      if (game.bricks.every(b => !b.alive)) {
        game.isRunning = false;
        game.score += 500;
        onGameEnd(game.score, game.blocksDestroyed);
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

      ctx.fillStyle = "#fff"; ctx.font = "14px 'Exo 2'";
      ctx.fillText(`Score: ${game.score}`, 8, 18);
      ctx.fillText(`❤️`.repeat(game.lives), width - 60, 18);
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
  }, [isPlaying, onGameEnd]);

  return <canvas ref={canvasRef} width={280} height={360} className="rounded-xl border border-cyan-500/30 mx-auto touch-none" data-testid="game-canvas" />;
};

export default function PlayTab() {
  const { user, walletAddress, refreshUser } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastScore, setLastScore] = useState(null);
  const [lastBlocks, setLastBlocks] = useState(null);
  const [pendingReward, setPendingReward] = useState(0);
  const [isClaiming, setIsClaiming] = useState(false);

  const calculateRewards = (score, blocks) => Math.min(blocks * 0.5 + (score > 1000 ? (score - 1000) * 0.01 : 0), 500);

  const handleGameEnd = useCallback((score, blocksDestroyed) => {
    setLastScore(score); setLastBlocks(blocksDestroyed);
    setPendingReward(calculateRewards(score, blocksDestroyed));
    setIsPlaying(false);
    toast.info(`Game Over! Score: ${score}`);
  }, []);

  const handleClaim = async () => {
    if (!lastScore) return;
    setIsClaiming(true);
    try {
      const result = await api.claimGameRewards(walletAddress, lastScore, lastBlocks);
      toast.success(result.message);
      await refreshUser();
      setLastScore(null); setLastBlocks(null); setPendingReward(0);
    } catch (error) { toast.error("Failed to claim"); }
    finally { setIsClaiming(false); }
  };

  const handleStartGame = () => { setIsPlaying(true); setLastScore(null); setLastBlocks(null); setPendingReward(0); };

  return (
    <div className="h-[100dvh] bg-[#0a0b1e] flex flex-col px-4 pt-4 pb-[72px] overflow-hidden" data-testid="play-tab">
      {/* Header */}
      <div className="text-center mb-2 flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-1">
          <Gamepad2 className="w-6 h-6 text-purple-400" />
        </div>
        <h1 className="text-xl font-bold text-white">PLAY</h1>
        <p className="text-gray-400 text-xs">zBricks - Earn ZWAP!</p>
      </div>

      {/* Game Area */}
      <div className="game-container flex-1 flex items-center justify-center min-h-0">
        {isPlaying ? (
          <BricklesGame onGameEnd={handleGameEnd} isPlaying={isPlaying} />
        ) : (
          <div className="w-[280px] h-[360px] rounded-xl border border-purple-500/30 flex flex-col items-center justify-center bg-[#0f1029] p-4">
            {lastScore !== null ? (
              <>
                <Trophy className="w-12 h-12 text-yellow-400 mb-2" />
                <h2 className="text-xl font-bold text-white mb-1">Game Over!</h2>
                <p className="text-gray-400 text-sm">Score: <span className="text-cyan-400">{lastScore}</span> • Blocks: <span className="text-purple-400">{lastBlocks}</span></p>
                <div className="flex items-center gap-2 text-base my-3">
                  <Coins className="w-4 h-4 text-cyan-400" />
                  <span className="text-white font-semibold">{pendingReward.toFixed(2)} ZWAP</span>
                </div>
                <div className="space-y-2 w-full">
                  <Button data-testid="claim-game" onClick={handleClaim} disabled={isClaiming} className="w-full bg-gradient-to-r from-cyan-500 to-purple-500">
                    {isClaiming ? "Claiming..." : "Claim Rewards"}
                  </Button>
                  <Button data-testid="play-again" onClick={handleStartGame} variant="outline" className="w-full border-purple-500/50 text-purple-400">
                    Play Again
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Gamepad2 className="w-16 h-16 text-purple-400 mb-3 float" />
                <h2 className="text-lg text-white mb-1">Ready to Play?</h2>
                <p className="text-gray-400 text-xs mb-4 text-center">Move finger/mouse to control paddle</p>
                <Button data-testid="start-game" onClick={handleStartGame} className="bg-purple-500 hover:bg-purple-600 px-6">
                  <Play className="w-4 h-4 mr-2" />Start Game
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex gap-3 mt-2 flex-shrink-0">
        <div className="glass-card p-2 flex-1 text-center">
          <p className="text-gray-400 text-[10px]">Games Played</p>
          <p className="text-lg font-bold text-purple-400">{user?.games_played || 0}</p>
        </div>
        <div className="glass-card p-2 flex-1 text-center">
          <p className="text-gray-400 text-[10px]">Balance</p>
          <p className="text-lg font-bold text-cyan-400">{user?.zwap_balance?.toFixed(0) || "0"}</p>
        </div>
      </div>
    </div>
  );
}
