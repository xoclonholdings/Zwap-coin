import React, { useState, useEffect, useRef, useCallback } from "react";
import { useApp, api } from "@/App";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Gamepad2, Play, Coins, Trophy, TrendingUp } from "lucide-react";

// Brickles-style game component
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

    // Game state
    const game = {
      paddle: { x: width / 2 - 40, y: height - 30, width: 80, height: 12 },
      ball: { x: width / 2, y: height - 50, dx: 4, dy: -4, radius: 8 },
      bricks: [],
      score: 0,
      blocksDestroyed: 0,
      lives: 3,
      isRunning: true
    };

    // Initialize bricks
    const brickRows = 5;
    const brickCols = 8;
    const brickWidth = (width - 40) / brickCols;
    const brickHeight = 20;
    const brickPadding = 4;

    for (let row = 0; row < brickRows; row++) {
      for (let col = 0; col < brickCols; col++) {
        game.bricks.push({
          x: 20 + col * brickWidth,
          y: 40 + row * (brickHeight + brickPadding),
          width: brickWidth - brickPadding,
          height: brickHeight,
          alive: true,
          color: `hsl(${180 + row * 20}, 100%, ${60 - row * 5}%)`
        });
      }
    }

    gameRef.current = game;

    // Touch/mouse controls
    const handleMove = (clientX) => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      game.paddle.x = Math.max(0, Math.min(width - game.paddle.width, x - game.paddle.width / 2));
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

    // Game loop
    const update = () => {
      if (!game.isRunning) return;

      // Move ball
      game.ball.x += game.ball.dx;
      game.ball.y += game.ball.dy;

      // Wall collisions
      if (game.ball.x <= game.ball.radius || game.ball.x >= width - game.ball.radius) {
        game.ball.dx *= -1;
      }
      if (game.ball.y <= game.ball.radius) {
        game.ball.dy *= -1;
      }

      // Paddle collision
      if (
        game.ball.y + game.ball.radius >= game.paddle.y &&
        game.ball.y - game.ball.radius <= game.paddle.y + game.paddle.height &&
        game.ball.x >= game.paddle.x &&
        game.ball.x <= game.paddle.x + game.paddle.width
      ) {
        game.ball.dy = -Math.abs(game.ball.dy);
        // Add angle based on where ball hits paddle
        const hitPos = (game.ball.x - game.paddle.x) / game.paddle.width;
        game.ball.dx = 6 * (hitPos - 0.5);
      }

      // Brick collisions
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
          game.score += 10;
          game.blocksDestroyed++;
        }
      });

      // Ball out of bounds
      if (game.ball.y > height) {
        game.lives--;
        if (game.lives <= 0) {
          game.isRunning = false;
          onGameEnd(game.score, game.blocksDestroyed);
          return;
        }
        // Reset ball
        game.ball.x = width / 2;
        game.ball.y = height - 50;
        game.ball.dx = 4;
        game.ball.dy = -4;
      }

      // Check win condition
      if (game.bricks.every(b => !b.alive)) {
        game.isRunning = false;
        game.score += 500; // Bonus for clearing all bricks
        onGameEnd(game.score, game.blocksDestroyed);
        return;
      }
    };

    const draw = () => {
      // Clear canvas
      ctx.fillStyle = "#0a0b1e";
      ctx.fillRect(0, 0, width, height);

      // Draw bricks
      game.bricks.forEach(brick => {
        if (!brick.alive) return;
        ctx.fillStyle = brick.color;
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
      });

      // Draw paddle with glow
      ctx.shadowColor = "#00f5ff";
      ctx.shadowBlur = 10;
      ctx.fillStyle = "#00f5ff";
      ctx.fillRect(game.paddle.x, game.paddle.y, game.paddle.width, game.paddle.height);
      ctx.shadowBlur = 0;

      // Draw ball with glow
      ctx.beginPath();
      ctx.shadowColor = "#ff00ff";
      ctx.shadowBlur = 15;
      ctx.fillStyle = "#ff00ff";
      ctx.arc(game.ball.x, game.ball.y, game.ball.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw score
      ctx.fillStyle = "#fff";
      ctx.font = "16px 'Exo 2'";
      ctx.fillText(`Score: ${game.score}`, 10, 25);
      ctx.fillText(`Lives: ${"❤️".repeat(game.lives)}`, width - 100, 25);
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
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, onGameEnd]);

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={480}
      className="rounded-xl border border-cyan-500/30 mx-auto touch-none"
      data-testid="game-canvas"
    />
  );
};

export default function PlayTab() {
  const { user, walletAddress, refreshUser } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastScore, setLastScore] = useState(null);
  const [lastBlocks, setLastBlocks] = useState(null);
  const [pendingReward, setPendingReward] = useState(0);
  const [isClaiming, setIsClaiming] = useState(false);

  const calculateRewards = (score, blocks) => {
    const baseReward = blocks * 0.5;
    const bonus = score > 1000 ? (score - 1000) * 0.01 : 0;
    return Math.min(baseReward + bonus, 500);
  };

  const handleGameEnd = useCallback((score, blocksDestroyed) => {
    setLastScore(score);
    setLastBlocks(blocksDestroyed);
    setPendingReward(calculateRewards(score, blocksDestroyed));
    setIsPlaying(false);
    toast.info(`Game Over! Score: ${score}, Blocks: ${blocksDestroyed}`);
  }, []);

  const handleClaim = async () => {
    if (!lastScore) return;
    
    setIsClaiming(true);
    try {
      const result = await api.claimGameRewards(walletAddress, lastScore, lastBlocks);
      toast.success(result.message);
      await refreshUser();
      setLastScore(null);
      setLastBlocks(null);
      setPendingReward(0);
    } catch (error) {
      toast.error("Failed to claim rewards");
    } finally {
      setIsClaiming(false);
    }
  };

  const handleStartGame = () => {
    setIsPlaying(true);
    setLastScore(null);
    setLastBlocks(null);
    setPendingReward(0);
  };

  const tiers = [
    { blocks: "1-10", rate: "0.5 ZWAP/block" },
    { blocks: "Score > 1000", rate: "+0.01 ZWAP/point" },
    { blocks: "Max per game", rate: "500 ZWAP" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0b1e] p-4" data-testid="play-tab">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
          <Gamepad2 className="w-8 h-8 text-purple-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-1">PLAY</h1>
        <p className="text-gray-400">zBricks - Destroy blocks, earn ZWAP!</p>
      </div>

      {/* Game Area */}
      <div className="game-container mb-6">
        {isPlaying ? (
          <BricklesGame onGameEnd={handleGameEnd} isPlaying={isPlaying} />
        ) : (
          <div className="w-[320px] h-[480px] rounded-xl border border-purple-500/30 mx-auto flex flex-col items-center justify-center bg-[#0f1029]">
            {lastScore !== null ? (
              <>
                <Trophy className="w-16 h-16 text-yellow-400 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Game Over!</h2>
                <p className="text-gray-400 mb-1">Score: <span className="text-cyan-400">{lastScore}</span></p>
                <p className="text-gray-400 mb-4">Blocks: <span className="text-purple-400">{lastBlocks}</span></p>
                
                <div className="flex items-center gap-2 text-lg mb-6">
                  <Coins className="w-5 h-5 text-cyan-400" />
                  <span className="text-white font-semibold">{pendingReward.toFixed(2)} ZWAP</span>
                </div>

                <div className="space-y-3 w-full px-6">
                  <Button
                    data-testid="claim-game"
                    onClick={handleClaim}
                    disabled={isClaiming}
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-500"
                  >
                    {isClaiming ? "Claiming..." : "Claim Rewards"}
                  </Button>
                  <Button
                    data-testid="play-again"
                    onClick={handleStartGame}
                    variant="outline"
                    className="w-full border-purple-500/50 text-purple-400"
                  >
                    Play Again
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Gamepad2 className="w-20 h-20 text-purple-400 mb-4 float" />
                <h2 className="text-xl text-white mb-2">Ready to Play?</h2>
                <p className="text-gray-400 text-sm mb-6 text-center px-6">
                  Move your finger/mouse to control the paddle
                </p>
                <Button
                  data-testid="start-game"
                  onClick={handleStartGame}
                  className="bg-purple-500 hover:bg-purple-600 px-8"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Game
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Tier System */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          <h3 className="text-white font-semibold">Earning Rates</h3>
        </div>
        
        <div className="space-y-2">
          {tiers.map((tier, index) => (
            <div 
              key={index}
              className="flex justify-between items-center p-3 rounded-lg bg-gray-800/50"
            >
              <span className="text-gray-400">{tier.blocks}</span>
              <span className="font-mono text-white">{tier.rate}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="glass-card p-4 text-center">
          <p className="text-gray-400 text-xs mb-1">Games Played</p>
          <p className="text-2xl font-bold text-purple-400">{user?.games_played || 0}</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-gray-400 text-xs mb-1">Your Balance</p>
          <p className="text-2xl font-bold text-cyan-400">{user?.zwap_balance?.toFixed(2) || "0.00"}</p>
        </div>
      </div>
    </div>
  );
}
