import React from "react";
import { isPowered } from "./ZapManEngine";

export default function ZapManHud({ state, onPause, gameState }) {
  const powered = isPowered(state);

  return (
    <div className="relative z-10 border-b border-cyan-200/10 bg-[linear-gradient(180deg,rgba(5,8,22,0.96),rgba(3,6,18,0.78))] px-3 py-3 shadow-[0_12px_34px_rgba(0,0,0,0.32)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300/70">
            Zap-Man
          </p>
          <p className="mt-1 text-sm font-black text-white">
            Round {state.round}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-2xl border border-cyan-200/10 bg-white/[0.045] px-3 py-2 text-center shadow-[inset_0_0_16px_rgba(34,211,238,0.05)]">
            <p className="text-[9px] uppercase tracking-[0.18em] text-white/38">
              Score
            </p>
            <p className="mt-1 text-sm font-black text-cyan-300">
              {Number(state.score || 0).toLocaleString()}
            </p>
          </div>

          <div className="rounded-2xl border border-pink-200/10 bg-white/[0.045] px-3 py-2 text-center shadow-[inset_0_0_16px_rgba(236,72,153,0.05)]">
            <p className="text-[9px] uppercase tracking-[0.18em] text-white/38">
              Lives
            </p>
            <p className="mt-1 text-sm font-black text-pink-300">
              {"●".repeat(Math.max(0, Number(state.lives || 0)))}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-2 text-center">
            <p className="text-[9px] uppercase tracking-[0.18em] text-white/38">
              Mode
            </p>
            <p
              className={
                powered
                  ? "mt-1 text-sm font-black text-yellow-200"
                  : "mt-1 text-sm font-black text-white/50"
              }
            >
              {powered ? "Zap" : "Run"}
            </p>
          </div>

          {gameState === "live" ? (
            <button
              type="button"
              onClick={onPause}
              className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-xs font-black text-white/72 transition active:scale-[0.98]"
            >
              Pause
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}