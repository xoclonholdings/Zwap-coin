import React from "react";
import { Lock, ShoppingBag } from "lucide-react";

const SHOP_UNLOCK_THRESHOLD = 1000;

function clamp(value, min = 0, max = 100) {
  return Math.min(Math.max(value, min), max);
}

function formatZPts(value) {
  return Number(value || 0).toLocaleString();
}

export default function DashboardWindowShop({
  lifetimeZpts = 0,
  zptsBalance = 0,
  shopUnlocked,
  onOpenShop,
}) {
  const unlockProgressSource = Math.max(
    Number(lifetimeZpts || 0),
    Number(zptsBalance || 0)
  );

  const progress = clamp((unlockProgressSource / SHOP_UNLOCK_THRESHOLD) * 100);

  const isUnlocked =
    typeof shopUnlocked === "boolean"
      ? shopUnlocked
      : unlockProgressSource >= SHOP_UNLOCK_THRESHOLD;

  const handleClick = () => {
    if (!isUnlocked) return;
    if (typeof onOpenShop === "function") onOpenShop();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!isUnlocked}
      aria-label={isUnlocked ? "Open Shop" : "Shop locked"}
      className={[
        "relative flex h-full min-h-[220px] w-full flex-col overflow-hidden rounded-[1.5rem] p-4 text-left",
        "border border-cyan-200/15 bg-[#0b1220]",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_26px_rgba(34,211,238,0.08)]",
        "disabled:cursor-default",
        isUnlocked ? "opacity-100" : "opacity-70",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[1.5rem] bg-gradient-to-br from-cyan-400/[0.10] via-white/[0.03] to-violet-500/[0.10]" />
      <div className="pointer-events-none absolute inset-[1px] rounded-[1.45rem] border border-white/[0.06]" />

      <div className="relative z-10 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300/10 text-cyan-200">
          <ShoppingBag className="h-4 w-4" />
        </div>

        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/90">
          Shop
        </h2>
      </div>

      {isUnlocked ? (
        <div className="relative z-10 mt-auto">
          <p className="text-base font-semibold text-white">
            Use what you earned
          </p>

          <p className="mt-2 text-sm text-white/60">Shop is unlocked.</p>
        </div>
      ) : (
        <div className="relative z-10 mt-8 flex flex-1 flex-col">
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/75">
              <Lock className="h-5 w-5" />
            </div>

            <p className="mt-4 text-base font-semibold text-white">
              Unlock Shop
            </p>
          </div>

          <div className="pb-1">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-400"
                style={{ width: `${progress}%` }}
                aria-hidden="true"
              />
            </div>

            <p className="mt-3 text-left text-sm font-semibold text-white/80">
              {formatZPts(unlockProgressSource)} /{" "}
              {formatZPts(SHOP_UNLOCK_THRESHOLD)}{" "}
              <sub className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/45">
                zPts
              </sub>
            </p>
          </div>
        </div>
      )}
    </button>
  );
}
