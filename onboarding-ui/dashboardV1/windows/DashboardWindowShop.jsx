import React from "react";
import { Lock, ChevronRight } from "lucide-react";

const SHOP_UNLOCK_THRESHOLD = 30;

function clamp(value, min = 0, max = 100) {
  return Math.min(Math.max(value, min), max);
}

function formatZPts(value) {
  return Number(value || 0).toLocaleString();
}

export default function DashboardWindowShop({ zptsBalance = 0 }) {
  const progress = clamp((zptsBalance / SHOP_UNLOCK_THRESHOLD) * 100);
  const isUnlocked = zptsBalance >= SHOP_UNLOCK_THRESHOLD;

  return (
    <section
      aria-label="Shop"
      className="relative w-full overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0b1220] p-4 shadow-[0_0_24px_rgba(0,0,0,0.25)]"
    >
      <div className={isUnlocked ? "opacity-100" : "opacity-60"}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/90">
            Shop
          </h2>

          {isUnlocked ? (
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-cyan-300">
              Unlocked
            </span>
          ) : (
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/50">
              Locked
            </span>
          )}
        </div>

        <div
          className={[
            "rounded-[1.25rem] border border-white/10 px-4 py-5",
            "bg-white/[0.03]",
            isUnlocked ? "backdrop-blur-0" : "backdrop-blur-sm",
          ].join(" ")}
        >
          {isUnlocked ? (
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-[1rem] text-left"
              aria-label="Use what you earned"
            >
              <div>
                <p className="text-base font-semibold text-white">
                  Use what you earned
                </p>
                <p className="mt-1 text-sm text-white/60">
                  Your first value interaction is ready.
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                <ChevronRight className="h-5 w-5" />
              </div>
            </button>
          ) : (
            <div className="relative">
              <div className="pointer-events-none absolute inset-0 rounded-[1rem] bg-black/20" />

              <div className="relative z-10 flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70">
                  <Lock className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold text-white">
                    Unlock Shop
                  </p>

                  <p className="mt-1 text-sm text-white/65">
                    {formatZPts(zptsBalance)} / {SHOP_UNLOCK_THRESHOLD} zPts
                  </p>

                  <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-400"
                      style={{ width: `${progress}%` }}
                      aria-hidden="true"
                    />
                  </div>

                  <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-white/45">
                    {Math.round(progress)}% toward unlock
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}