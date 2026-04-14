import React, { useEffect, useRef, useState } from "react";
import PulzeEngine from "./PulzeEngine";
import { createPulzeInput } from "./pulzeInput";
import { getAccentFromResult } from "./pulzeRenderer";

export default function PulzeGame({ isPlaying, level, onGameEnd }) {
  const engineRef = useRef(null);
  const inputRef = useRef(null);

  const [state, setState] = useState({
    progress: 0,
    target: 50,
    score: 0,
    combo: 0,
    beatsLeft: 10,
    bestHit: 0,
    result: null,
  });

  useEffect(() => {
    if (!isPlaying) return;

    const engine = new PulzeEngine({
      level,
      onUpdate: setState,
      onEnd: (score) => {
        onGameEnd(score, 0, level, false);
      },
    });

    engineRef.current = engine;

    const input = createPulzeInput(() => {
      engine.pulse();
    });

    input.attach();
    inputRef.current = input;

    engine.start();

    return () => {
      engine.stop();
      input.detach();
    };
  }, [isPlaying, level, onGameEnd]);

  if (!isPlaying) return null;

  const accent = getAccentFromResult(state.result);

  return (
    <div className="w-full max-w-sm mx-auto p-4 border rounded-xl">
      <div className="h-20 relative border mb-4">
        <div
          className="absolute top-0 bottom-0 w-8 border"
          style={{
            left: `${state.target}%`,
            transform: "translateX(-50%)",
          }}
        />

        <div
          className="absolute top-0 bottom-0 w-2"
          style={{
            left: `${state.progress}%`,
            background: accent,
          }}
        />
      </div>

      <div className="flex justify-between text-sm mb-3">
        <span>Score: {state.score}</span>
        <span>Combo: {state.combo}</span>
        <span>Beats: {state.beatsLeft}</span>
      </div>

      <button
        onClick={() => engineRef.current.pulse()}
        disabled={state.beatsLeft <= 0}
        className="w-full py-3 bg-cyan-500 text-white rounded"
      >
        PULSE
      </button>
    </div>
  );
}