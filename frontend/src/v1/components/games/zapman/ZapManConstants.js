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
      "relative flex aspect-square w-full items-center justify-center overflow-visible rounded-[7px] border transition-colors duration-200";

    if (type === "wall") {
      return `${base} border-cyan-300/20 bg-[radial-gradient(circle_at_top,rgba(103,242,255,0.24),rgba(8,145,178,0.14)_48%,rgba(2,6,23,0.72)_100%)] shadow-[inset_0_0_12px_rgba(34,211,238,0.16),0_0_14px_rgba(34,211,238,0.18)]`;
    }

    return `${base} border-white/[0.035] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.045),rgba(255,255,255,0.015)_52%,rgba(2,6,23,0.22)_100%)]`;
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
    <div className="relative w-full max-w-[430px] rounded-[30px] border border-cyan-300/25 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.08),transparent_62%),linear-gradient(180deg,rgba(4,13,24,0.98),rgba(2,6,16,0.98))] p-3 shadow-[0_22px_70px_rgba(0,0,0,0.42),0_0_34px_rgba(34,211,238,0.10)]">
      <div className="pointer-events-none absolute inset-2 rounded-[24px] border border-cyan-200/10 shadow-[inset_0_0_34px_rgba(34,211,238,0.10)]" />

      <div
        className="relative grid gap-[5px]"
        style={{ gridTemplateColumns: `repeat(${GRID_WIDTH}, minmax(0, 1fr))` }}
      >
        {cells.map((cell) => (
          <div key={cell.key} className={getCellClass(cell.type)}>
            {renderInner(cell)}
          </div>
        ))}
      </div>
    </div>
  );
}