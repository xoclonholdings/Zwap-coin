import React, { useEffect, useMemo, useState } from "react";
import zapManLogo from "@/assets/games/zap_man_logo.PNG";
import {
  GRID_WIDTH,
  GRID_HEIGHT,
  GAME_TICK_MS,
  WALLS,
} from "./ZapManConstants";
import {
  createInitialState,
  setQueuedDirection,
  advancePlayer,
  advanceEnemies,
  checkCollision,
  maybeAdvanceRound,
  applyGameOver,
  restartGame,
} from "./ZapManEngine";

const WALL_SET = new Set(WALLS);

function key(x, y) {
  return `${x},${y}`;
}

function buildResult(state) {
  return {
    score: state.score,
    round: state.round,
    cleared: false,
    pelletsCollected: state.pelletsCollected,
    pelletsRemaining: state.pellets.length,
    gameId: "zap-man",
  };
}

export default function ZapManGame({
  onGameEnd,
  isPlaying,
  level = 1,
  round = 1,
}) {
  const [gameState, setGameState] = useState("idle");
  const [exitOpen, setExitOpen] = useState(false);
  const [state, setState] = useState(() => createInitialState());

  useEffect(() => {
    if (!isPlaying) return;

    setState(() => {
      const initial = createInitialState();

      return {
        ...initial,
        round: Math.max(1, Number(round) || 1),
      };
    });

    setGameState("splash");
    setExitOpen(false);
  }, [isPlaying, round]);

  useEffect(() => {
    if (gameState !== "live") return undefined;

    function handleKeyDown(event) {
      const directionMap = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
        w: "up",
        s: "down",
        a: "left",
        d: "right",
        W: "up",
        S: "down",
        A: "left",
        D: "right",
      };

      if (event.key === "Escape") {
        event.preventDefault();
        setGameState("paused");
        return;
      }

      const direction = directionMap[event.key];

      if (!direction) return;

      event.preventDefault();
      setState((prev) => setQueuedDirection(prev, direction));
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState]);

  useEffect(() => {
    if (gameState !== "live") return undefined;

    const interval = window.setInterval(() => {
      setState((prev) => {
        if (prev.isGameOver) return prev;

        const now = Date.now();

        let next = advancePlayer(prev);

        if (checkCollision(next.player, next.enemies)) {
          return applyGameOver(next);
        }

        next = advanceEnemies(next, now);

        if (checkCollision(next.player, next.enemies)) {
          return applyGameOver(next);
        }

        next = maybeAdvanceRound(next);

        return next;
      });
    }, GAME_TICK_MS);

    return () => window.clearInterval(interval);
  }, [gameState]);

  useEffect(() => {
    if (!state.isGameOver) return;
    if (gameState === "ended") return;

    setGameState("ended");
  }, [state.isGameOver, gameState]);

  const cells = useMemo(() => {
    const pelletSet = new Set(
      state.pellets.map((pellet) => key(pellet.x, pellet.y))
    );
    const enemySet = new Set(
      state.enemies.map((enemy) => key(enemy.x, enemy.y))
    );
    const playerKey = key(state.player.x, state.player.y);

    const output = [];

    for (let y = 0; y < GRID_HEIGHT; y += 1) {
      for (let x = 0; x < GRID_WIDTH; x += 1) {
        const cellKey = key(x, y);

        let type = "empty";

        if (WALL_SET.has(cellKey)) type = "wall";
        if (pelletSet.has(cellKey)) type = "pellet";
        if (enemySet.has(cellKey)) type = "enemy";
        if (playerKey === cellKey) type = "player";

        output.push({ x, y, key: cellKey, type });
      }
    }

    return output;
  }, [state]);

  function handleStart() {
    setState(() => {
      const initial = restartGame();

      return {
        ...initial,
        round: Math.max(1, Number(round) || 1),
      };
    });

    setExitOpen(false);
    setGameState("live");
  }

  function handlePause() {
    setExitOpen(false);
    setGameState("paused");
  }

  function handleResume() {
    setExitOpen(false);
    setGameState("live");
  }

  function handleRequestExit() {
    setExitOpen(true);
    setGameState("paused");
  }

  function handleCancelExit() {
    setExitOpen(false);
  }

  function handleConfirmExit() {
    const result = buildResult(state);

    setExitOpen(false);
    setGameState("exit");

    onGameEnd?.({
      ...result,
      level: Math.max(1, Number(level) || 1),
    });
  }

  function handleRestart() {
    setState(() => {
      const initial = restartGame();

      return {
        ...initial,
        round: Math.max(1, Number(round) || 1),
      };
    });

    setExitOpen(false);
    setGameState("live");
  }

  function handleDirection(direction) {
    if (gameState !== "live") return;
    setState((prev) => setQueuedDirection(prev, direction));
  }

  function getCellClass(type) {
    const base =
      "relative flex aspect-square w-full items-center justify-center rounded-[4px] border border-white/5";

    if (type === "wall") {
      return `${base} bg-cyan-400/20 shadow-[0_0_8px_rgba(34,211,238,0.18)]`;
    }

    if (type === "player") {
      return `${base} bg-gradient-to-br from-cyan-300 via-sky-400 to-violet-500 shadow-[0_0_12px_rgba(34,211,238,0.55)]`;
    }

    if (type === "enemy") {
      return `${base} bg-gradient-to-br from-fuchsia-400 to-violet-600 shadow-[0_0_10px_rgba(217,70,239,0.45)]`;
    }

    return `${base} bg-white/[0.03]`;
  }

  function renderInner(type) {
    if (type === "pellet") {
      return (
        <div className="h-1.5 w-1.5 rounded-full bg-cyan-200 shadow-[0_0_8px_rgba(165,243,252,0.8)]" />
      );
    }

    if (type === "player") {
      return <div className="h-2.5 w-2.5 rounded-full bg-white/80" />;
    }

    if (type === "enemy") {
      return <div className="h-2.5 w-2.5 rounded-full bg-white/80" />;
    }

    return null;
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#050816] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-8%] h-[220px] w-[220px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-[-10%] top-[10%] h-[220px] w-[220px] rounded-full bg-pink-500/10 blur-3xl" />
        <div className="absolute bottom-[-12%] left-[20%] h-[220px] w-[220px] rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex items-center justify-between gap-3 border-b border-white/10 bg-black/20 px-4 py-3 backdrop-blur-xl">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-300/70">
            Zap-Man
          </p>
          <p className="mt-1 text-sm font-semibold text-white">
            Round {state.round}
          </p>
        </div>

        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">
            Score
          </p>
          <p className="mt-1 text-sm font-semibold text-cyan-300">
            {Number(state.score || 0).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">
              Pellets
            </p>
            <p className="mt-1 text-sm font-semibold text-pink-300">
              {state.pellets.length}
            </p>
          </div>

          {gameState === "live" ? (
            <button
              type="button"
              onClick={handlePause}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
            >
              Pause
            </button>
          ) : null}
        </div>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center px-3 py-3">
        <div
          className="grid w-full max-w-[360px] gap-1 rounded-[24px] border border-cyan-400/20 bg-[#050912] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
          style={{ gridTemplateColumns: `repeat(${GRID_WIDTH}, minmax(0, 1fr))` }}
        >
          {cells.map((cell) => (
            <div key={cell.key} className={getCellClass(cell.type)}>
              {renderInner(cell.type)}
            </div>
          ))}
        </div>

        {gameState === "live" ? (
          <div className="mt-4 grid w-full max-w-[220px] grid-cols-3 gap-2">
            <div />
            <button
              type="button"
              onClick={() => handleDirection("up")}
              className="rounded-2xl border border-white/10 bg-white/[0.06] py-2 text-sm font-black text-white/75 active:scale-[0.97]"
            >
              ↑
            </button>
            <div />

            <button
              type="button"
              onClick={() => handleDirection("left")}
              className="rounded-2xl border border-white/10 bg-white/[0.06] py-2 text-sm font-black text-white/75 active:scale-[0.97]"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => handleDirection("down")}
              className="rounded-2xl border border-white/10 bg-white/[0.06] py-2 text-sm font-black text-white/75 active:scale-[0.97]"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => handleDirection("right")}
              className="rounded-2xl border border-white/10 bg-white/[0.06] py-2 text-sm font-black text-white/75 active:scale-[0.97]"
            >
              →
            </button>
          </div>
        ) : null}

        {gameState === "splash" ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center px-4">
            <div className="w-full max-w-[320px] rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.01))] p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-xl">
              <img
                src={zapManLogo}
                alt="Zap-Man"
                className="mx-auto mb-8 h-24 object-contain drop-shadow-[0_0_32px_rgba(34,211,238,0.18)]"
              />

              <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">
                Ready
              </p>

              <div className="mt-7 flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={handleStart}
                  className="min-w-[170px] rounded-[18px] bg-[linear-gradient(90deg,rgba(168,85,247,1),rgba(236,72,153,0.95),rgba(34,211,238,1))] px-6 py-2.5 text-base font-semibold tracking-[0.02em] text-white transition active:scale-[0.98]"
                >
                  Start
                </button>

                <button
                  type="button"
                  onClick={handleConfirmExit}
                  className="min-w-[170px] rounded-[18px] border border-white/10 bg-white/[0.05] px-6 py-2.5 text-sm font-medium text-white/72 transition hover:bg-white/[0.08]"
                >
                  Back to Arcade
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {gameState === "paused" && !exitOpen ? (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">
            <div className="w-full max-w-[320px] rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_35%),linear-gradient(180deg,rgba(11,18,28,0.96),rgba(7,11,18,0.98))] p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
              <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-300/70">
                Paused
              </p>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2 text-center">
                  <p className="text-[10px] uppercase tracking-wide text-white/40">
                    Round
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {state.round}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2 text-center">
                  <p className="text-[10px] uppercase tracking-wide text-white/40">
                    Score
                  </p>
                  <p className="mt-1 text-sm font-semibold text-cyan-300">
                    {Number(state.score || 0).toLocaleString()}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2 text-center">
                  <p className="text-[10px] uppercase tracking-wide text-white/40">
                    Left
                  </p>
                  <p className="mt-1 text-sm font-semibold text-pink-300">
                    {state.pellets.length}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <button
                  type="button"
                  onClick={handleResume}
                  className="flex w-full items-center justify-center rounded-[20px] bg-[linear-gradient(90deg,rgba(168,85,247,1),rgba(236,72,153,0.95),rgba(34,211,238,1))] px-5 py-3.5 text-base font-semibold text-white transition active:scale-[0.98]"
                >
                  Resume
                </button>

                <button
                  type="button"
                  onClick={handleRequestExit}
                  className="flex w-full items-center justify-center rounded-[20px] border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-medium text-white/75 transition hover:bg-white/[0.08]"
                >
                  Exit Session
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {exitOpen ? (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/75 px-4 backdrop-blur-md">
            <div className="w-full max-w-[320px] rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(236,72,153,0.10),transparent_35%),linear-gradient(180deg,rgba(16,10,18,0.96),rgba(8,8,12,0.98))] p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.50)]">
              <p className="text-[11px] uppercase tracking-[0.24em] text-pink-300/75">
                Exit Game
              </p>

              <h3 className="mt-2 text-lg font-semibold text-white">
                Leave Zap-Man?
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-white/55">
                Your current session will end if you exit now.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2 text-center">
                  <p className="text-[10px] uppercase tracking-wide text-white/40">
                    Score
                  </p>
                  <p className="mt-1 text-sm font-semibold text-cyan-300">
                    {Number(state.score || 0).toLocaleString()}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2 text-center">
                  <p className="text-[10px] uppercase tracking-wide text-white/40">
                    Round
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {state.round}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <button
                  type="button"
                  onClick={handleCancelExit}
                  className="flex w-full items-center justify-center rounded-[20px] border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-medium text-white/75 transition hover:bg-white/[0.08]"
                >
                  Back to Game
                </button>

                <button
                  type="button"
                  onClick={handleConfirmExit}
                  className="flex w-full items-center justify-center rounded-[20px] bg-[linear-gradient(90deg,rgba(244,114,182,0.95),rgba(239,68,68,0.95))] px-5 py-3.5 text-base font-semibold text-white transition active:scale-[0.98]"
                >
                  Confirm Exit
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {gameState === "ended" ? (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-md">
            <div className="w-full max-w-[320px] rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_35%),linear-gradient(180deg,rgba(11,18,28,0.96),rgba(7,11,18,0.98))] p-5 text-center text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
              <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-300/70">
                Session Ended
              </p>

              <h3 className="mt-2 text-lg font-semibold text-white">
                Game Over
              </h3>

              <p className="mt-2 text-sm text-white/60">
                Final score: {Number(state.score || 0).toLocaleString()} • Round{" "}
                {state.round}
              </p>

              <div className="mt-5 space-y-3">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="flex w-full items-center justify-center rounded-[20px] bg-[linear-gradient(90deg,rgba(168,85,247,1),rgba(236,72,153,0.95),rgba(34,211,238,1))] px-5 py-3.5 text-base font-semibold text-white transition active:scale-[0.98]"
                >
                  Restart
                </button>

                <button
                  type="button"
                  onClick={handleConfirmExit}
                  className="flex w-full items-center justify-center rounded-[20px] border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-medium text-white/75 transition hover:bg-white/[0.08]"
                >
                  Back to Arcade
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}