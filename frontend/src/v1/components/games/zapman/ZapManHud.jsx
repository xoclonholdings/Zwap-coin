import React from "react";
import { isPowered } from "./ZapManEngine";

export default function ZapManHud({ state, onPause, gameState }) {
  const powered = isPowered(state);

  return (
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

      <div className="text-center">
        <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">
          Lives
        </p>
        <p className="mt-1 text-sm font-semibold text-pink-300">
          {"●".repeat(Math.max(0, Number(state.lives || 0)))}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">
            Mode
          </p>
          <p className={powered ? "mt-1 text-sm font-semibold text-yellow-200" : "mt-1 text-sm font-semibold text-white/50"}>
            {powered ? "Zap" : "Run"}
          </p>
        </div>

        {gameState === "live" ? (
          <button
            type="button"
            onClick={onPause}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
          >
            Pause
          </button>
        ) : null}
      </div>
    </div>
  );
}
