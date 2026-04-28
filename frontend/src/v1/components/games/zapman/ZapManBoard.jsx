import React, { useMemo } from "react";
import { GRID_WIDTH, GRID_HEIGHT, getWallsForRound } from "./ZapManConstants";
import {
  ZapManEnemy,
  ZapManPellet,
  ZapManPlayer,
  ZapManPowerPellet,
} from "./ZapManCharacters";
import { isPowered } from "./ZapManEngine";

function key(x, y) {
  return `${x},${y}`;
}

export default function ZapManBoard({ state }) {
  const powered = isPowered(state);

  const cells = useMemo(() => {
    const wallSet = new Set(getWallsForRound(state.round));
    const pelletSet = new Set(
      state.pellets.map((pellet) => key(pellet.x, pellet.y))
    );
    const powerPelletSet = new Set(
      state.powerPellets.map((pellet) => key(pellet.x, pellet.y))
    );
    const enemyMap = new Map(
      state.enemies.map((enemy) => [key(enemy.x, enemy.y), enemy])
    );
    const playerKey = key(state.player.x, state.player.y);

    const output = [];

    for (let y = 0; y < GRID_HEIGHT; y += 1) {
      for (let x = 0; x < GRID_WIDTH; x += 1) {
        const cellKey = key(x, y);

        let type = "empty";
        let enemy = null;

        if (wallSet.has(cellKey)) type = "wall";
        if (pelletSet.has(cellKey)) type = "pellet";
        if (powerPelletSet.has(cellKey)) type = "powerPellet";
        if (enemyMap.has(cellKey)) {
          type = "enemy";
          enemy = enemyMap.get(cellKey);
        }
        if (playerKey === cellKey) type = "player";

        output.push({ x, y, key: cellKey, type, enemy });
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

    return `${base} bg-white/[0.03]`;
  }

  function renderInner(cell) {
    if (cell.type === "pellet") return <ZapManPellet />;
    if (cell.type === "powerPellet") return <ZapManPowerPellet />;

    if (cell.type === "player") {
      return (
        <ZapManPlayer
          direction={state.player.direction}
          powered={powered}
        />
      );
    }

    if (cell.type === "enemy") {
      return (
        <ZapManEnemy
          character={cell.enemy?.character}
          vulnerable={powered}
        />
      );
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
