import React, { useMemo } from "react";
import { GRID_WIDTH, GRID_HEIGHT, WALLS } from "./ZapManConstants";
import { ZapManEnemy, ZapManPlayer } from "./ZapManCharacters";

const WALL_SET = new Set(WALLS);

function key(x, y) {
  return `${x},${y}`;
}

export default function ZapManBoard({ state }) {
  const cells = useMemo(() => {
    const pelletSet = new Set(
      state.pellets.map((pellet) => key(pellet.x, pellet.y))
    );

    const enemyMap = new Map(
      state.enemies.map((enemy, index) => [key(enemy.x, enemy.y), index])
    );

    const playerKey = key(state.player.x, state.player.y);
    const output = [];

    for (let y = 0; y < GRID_HEIGHT; y += 1) {
      for (let x = 0; x < GRID_WIDTH; x += 1) {
        const cellKey = key(x, y);
        let type = "empty";

        if (WALL_SET.has(cellKey)) type = "wall";
        if (pelletSet.has(cellKey)) type = "pellet";
        if (enemyMap.has(cellKey)) type = "enemy";
        if (playerKey === cellKey) type = "player";

        output.push({
          x,
          y,
          key: cellKey,
          type,
          enemyIndex: enemyMap.get(cellKey) ?? 0,
        });
      }
    }

    return output;
  }, [state]);

  function getCellClass(type) {
    const base =
      "relative flex aspect-square w-full items-center justify-center rounded-[5px] border border-white/5";

    if (type === "wall") {
      return `${base} bg-cyan-400/20 shadow-[0_0_8px_rgba(34,211,238,0.18)]`;
    }

    if (type === "player" || type === "enemy") {
      return `${base} bg-white/[0.025]`;
    }

    return `${base} bg-white/[0.03]`;
  }

  function renderInner(cell) {
    if (cell.type === "pellet") {
      return (
        <div className="h-1.5 w-1.5 rounded-full bg-cyan-200 shadow-[0_0_8px_rgba(165,243,252,0.8)]" />
      );
    }

    if (cell.type === "player") {
      return <ZapManPlayer direction={state.player.direction} />;
    }

    if (cell.type === "enemy") {
      return <ZapManEnemy index={cell.enemyIndex} />;
    }

    return null;
  }

  return (
    <div
      className="grid w-full max-w-[360px] gap-1 rounded-[24px] border border-cyan-400/20 bg-[#050912] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
      style={{ gridTemplateColumns: `repeat(${GRID_WIDTH}, minmax(0, 1fr))` }}
    >
      {cells.map((cell) => (
        <div key={cell.key} className={getCellClass(cell.type)}>
          {renderInner(cell)}
        </div>
      ))}
    </div>
  );
}