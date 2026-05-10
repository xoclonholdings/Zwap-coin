import React, { useEffect, useState } from "react";

const INTERSTITIAL_MS = 1800;

export default function GameInterstitialOverlay({
  open,
  gameTitle,
  onComplete,
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!open) {
      setReady(false);
      return;
    }

    const timer = setTimeout(() => {
      setReady(true);
    }, INTERSTITIAL_MS);

    return () => clearTimeout(timer);
  }, [open]);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 px-5 text-white backdrop-blur-md">
      <div className="w-full max-w-[330px] rounded-[30px] border border-cyan-300/15 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_36%),linear-gradient(180deg,rgba(9,14,24,0.96),rgba(4,8,16,0.98))] p-5 text-center shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
        <p className="text-[11px] font-black uppercase tracking-[0.26em] text-cyan-300/75">
          Sponsored Break
        </p>

        <h3 className="mt-3 text-xl font-black text-white">
          Round Complete
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-white/58">
          Short ad break before your {gameTitle} reward screen.
        </p>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full bg-[linear-gradient(90deg,rgba(168,85,247,1),rgba(236,72,153,0.95),rgba(34,211,238,1))] transition-all duration-[1800ms] ${
              ready ? "w-full" : "w-[12%]"
            }`}
          />
        </div>

        <button
          type="button"
          disabled={!ready}
          onClick={onComplete}
          className={`mt-5 w-full rounded-full px-5 py-3.5 text-sm font-black transition ${
            ready
              ? "bg-white text-slate-950 active:scale-[0.98]"
              : "bg-white/10 text-white/35"
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}