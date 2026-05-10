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
      "relative flex aspect-square w-full items-center justify-center overflow-visible rounded-[8px] border transition-colors duration-200";

    if (type === "wall") {
      return `${base} border-cyan-200/25 bg-[linear-gradient(180deg,rgba(103,242,255,0.22),rgba(14,165,233,0.10)_42%,rgba(2,6,23,0.72)_100%)] shadow-[inset_0_1px_10px_rgba(255,255,255,0.10),inset_0_-10px_18px_rgba(8,47,73,0.36),0_0_15px_rgba(34,211,238,0.24)]`;
    }

    return `${base} border-white/[0.025] bg-[radial-gradient(circle_at_center,rgba(103,242,255,0.045),rgba(255,255,255,0.012)_48%,rgba(2,6,23,0.18)_100%)]`;
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
    <div className="flex min-h-0 flex-1 items-center justify-center">
      <div className="relative w-full max-w-[520px] rounded-[34px] border border-cyan-300/28 bg-[radial-gradient(circle_at_50%_35%,rgba(34,211,238,0.12),transparent_58%),linear-gradient(180deg,rgba(4,13,24,0.98),rgba(1,4,12,0.99))] p-3.5 shadow-[0_26px_80px_rgba(0,0,0,0.55),0_0_42px_rgba(34,211,238,0.16)]">
        <div className="pointer-events-none absolute inset-0 rounded-[34px] bg-[linear-gradient(135deg,rgba(255,255,255,0.10),transparent_28%,rgba(34,211,238,0.08)_74%,transparent)]" />

        <div className="pointer-events-none absolute inset-2 rounded-[28px] border border-cyan-200/12 shadow-[inset_0_0_38px_rgba(34,211,238,0.14)]" />

        <div className="pointer-events-none absolute inset-4 rounded-[24px] bg-[radial-gradient(circle_at_center,transparent_42%,rgba(34,211,238,0.07)_100%)]" />

        <div
          className="relative grid gap-[5px]"
          style={{
            gridTemplateColumns: `repeat(${GRID_WIDTH}, minmax(0, 1fr))`,
          }}
        >
          {cells.map((cell) => (
            <div key={cell.key} className={getCellClass(cell.type)}>
              <span className="pointer-events-none absolute inset-[18%] rounded-[5px] bg-cyan-200/[0.018]" />
              {renderInner(cell)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}