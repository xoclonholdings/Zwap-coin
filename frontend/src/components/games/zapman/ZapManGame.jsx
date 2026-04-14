import React, { useEffect, useMemo, useState } from "react";
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

export default function ZapManGame() {
  const [state, setState] = useState(createInitialState());

  useEffect(() => {
    function handleKeyDown(event) {
      const directionMap = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
      };

      const direction = directionMap[event.key];

      if (!direction) return;

      event.preventDefault();
      setState((prev) => setQueuedDirection(prev, direction));
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
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
  }, []);

  const cells = useMemo(() => {
    const pelletSet = new Set(state.pellets.map((pellet) => key(pellet.x, pellet.y)));
    const enemySet = new Set(state.enemies.map((enemy) => key(enemy.x, enemy.y)));
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

  function getCellClass(type) {
    const base =
      "relative flex h-5 w-5 items-center justify-center rounded-[4px] border border-white/5";

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
      return <div className="h-1.5 w-1.5 rounded-full bg-cyan-200 shadow-[0_0_8px_rgba(165,243,252,0.8)]" />;
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
    <div className="w-full rounded-[1.5rem] border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(5,10,18,0.96),rgba(8,16,26,0.98))] p-4 text-white shadow-[0_0_28px_rgba(34,211,238,0.08)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-cyan-300/70">
            Play
          </div>
          <h2 className="text-xl font-semibold tracking-wide">Zap-Man</h2>
        </div>

        <button
          type="button"
          onClick={() => setState(restartGame())}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/10"
        >
          Restart
        </button>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-2">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">Round</div>
          <div className="mt-1 text-lg font-semibold">{state.round}</div>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-2">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">Score</div>
          <div className="mt-1 text-lg font-semibold">{state.score}</div>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-2">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">Pellets</div>
          <div className="mt-1 text-lg font-semibold">{state.pellets.length}</div>
        </div>
      </div>

      <div
        className="mx-auto grid w-fit gap-1 rounded-[1.25rem] border border-cyan-400/15 bg-black/30 p-3"
        style={{ gridTemplateColumns: `repeat(${GRID_WIDTH}, minmax(0, 1fr))` }}
      >
        {cells.map((cell) => (
          <div key={cell.key} className={getCellClass(cell.type)}>
            {renderInner(cell.type)}
          </div>
        ))}
      </div>

      <div className="mt-4 text-center text-xs text-white/60">
        Use arrow keys to move
      </div>

      {state.isGameOver ? (
        <div className="mt-4 rounded-[1.25rem] border border-fuchsia-400/20 bg-fuchsia-500/10 p-4 text-center">
          <div className="text-xs uppercase tracking-[0.22em] text-fuchsia-200/70">
            Session Ended
          </div>
          <div className="mt-2 text-lg font-semibold">Game Over</div>
          <div className="mt-1 text-sm text-white/70">
            Final score: {state.score} • Round reached: {state.round}
          </div>
        </div>
      ) : null}
    </div>
  );
}