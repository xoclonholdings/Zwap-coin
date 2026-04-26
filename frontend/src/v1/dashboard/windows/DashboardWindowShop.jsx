import React from "react";
import { ChevronRight, Lock, ShoppingBag } from "lucide-react";

const SHOP_UNLOCK_THRESHOLD = 1000;

const FEATURED_TEST_ITEM = {
  id: "bronze-ring",
  name: "Bronze Profile Ring",
  description: "A starter cosmetic ring for your ZWAP! profile.",
  type: "cosmetic",
};

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
  onPurchase,
  className = "",
}) {
  const unlockProgressSource = Math.max(
    Number(lifetimeZpts || 0),
    Number(zptsBalance || 0)
  );

  const progress = clamp(
    (unlockProgressSource / SHOP_UNLOCK_THRESHOLD) * 100
  );

  const isUnlocked =
    typeof shopUnlocked === "boolean"
      ? shopUnlocked
      : unlockProgressSource >= SHOP_UNLOCK_THRESHOLD;

  const handleClick = () => {
    if (!isUnlocked) return;
    onOpenShop?.();
  };

  const handlePurchase = (event) => {
    event.stopPropagation();
    if (!isUnlocked) return;
    onPurchase?.(FEATURED_TEST_ITEM);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!isUnlocked}
      aria-label={isUnlocked ? "Open Shop" : "Shop locked"}
      className={[
        "group relative h-full w-full overflow-hidden rounded-[28px] border text-left active:scale-[0.99]",
        isUnlocked
          ? "border-cyan-300/24 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_42%),linear-gradient(180deg,rgba(12,24,30,0.97),rgba(5,10,15,0.99))] shadow-[0_16px_38px_rgba(0,0,0,0.30),0_0_28px_rgba(34,211,238,0.08)]"
          : "border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_38%),linear-gradient(180deg,rgba(13,18,26,0.94),rgba(5,9,15,0.99))] opacity-75 shadow-[0_16px_38px_rgba(0,0,0,0.28)]",
        "disabled:cursor-default",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-5 top-0 h-16 rounded-full bg-cyan-300/10 blur-2xl" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.075),transparent_36%,rgba(34,211,238,0.04))]" />
      </div>

      {!isUnlocked ? (
        <div className="pointer-events-none absolute inset-0 bg-black/18 backdrop-blur-[1px]" />
      ) : null}

      <div className="relative z-10 flex h-full flex-col p-3">
        <div className="flex shrink-0 items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div
              className={[
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                isUnlocked
                  ? "border-cyan-300/22 bg-cyan-300/10 text-cyan-200"
                  : "border-white/10 bg-white/[0.045] text-white/56",
              ].join(" ")}
            >
              {isUnlocked ? (
                <ShoppingBag className="h-4 w-4" strokeWidth={2.2} />
              ) : (
                <Lock className="h-4 w-4" strokeWidth={2.2} />
              )}
            </div>

            <div className="min-w-0">
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-white/88">
                Shop
              </div>
              <div
                className={[
                  "mt-0.5 truncate text-[9px] font-semibold uppercase tracking-[0.12em]",
                  isUnlocked ? "text-cyan-100/48" : "text-white/38",
                ].join(" ")}
              >
                {isUnlocked ? "Unlocked" : "Locked"}
              </div>
            </div>
          </div>

          <div
            className={[
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
              isUnlocked
                ? "border-cyan-300/14 bg-cyan-300/[0.06] text-cyan-100/58"
                : "border-white/8 bg-white/[0.03] text-white/28",
            ].join(" ")}
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
          </div>
        </div>

        <div className="flex min-h-0 flex-1 items-center py-2">
          {isUnlocked ? (
            <div className="w-full rounded-[24px] border border-cyan-300/14 bg-cyan-300/[0.055] p-3 shadow-[inset_0_0_24px_rgba(255,255,255,0.03)]">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-[clamp(46px,13vw,64px)] w-[clamp(46px,13vw,64px)] shrink-0 items-center justify-center rounded-2xl border border-cyan-300/18 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.22),transparent_58%),rgba(255,255,255,0.04)] text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.10)]">
                  <ShoppingBag className="h-6 w-6" strokeWidth={2.1} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-[clamp(13px,3.8vw,16px)] font-black tracking-[-0.03em] text-white">
                    {FEATURED_TEST_ITEM.name}
                  </div>

                  <div className="mt-1 line-clamp-2 text-[10px] leading-4 text-white/50">
                    {FEATURED_TEST_ITEM.description}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePurchase}
                className="w-full rounded-full border border-cyan-300/18 bg-cyan-300/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-100 active:scale-[0.98]"
              >
                Add to Inventory
              </button>
            </div>
          ) : (
            <div className="w-full">
              <div className="mx-auto flex h-[clamp(62px,18vw,86px)] w-[clamp(62px,18vw,86px)] items-center justify-center rounded-[24px] border border-white/10 bg-white/[0.045] text-white/64 shadow-[inset_0_0_24px_rgba(255,255,255,0.03)]">
                <Lock className="h-8 w-8" strokeWidth={2.1} />
              </div>

              <div className="mt-4 text-center">
                <div className="text-[clamp(15px,4vw,19px)] font-black tracking-[-0.04em] text-white">
                  Unlock Shop
                </div>

                <div className="mt-1 text-[10px] font-semibold text-white/50">
                  {formatZPts(unlockProgressSource)} /{" "}
                  {formatZPts(SHOP_UNLOCK_THRESHOLD)} lifetime zPts
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.14em] text-white/34">
              {isUnlocked ? "Ready" : "Unlock"}
            </span>

            <span className="text-[10px] font-black uppercase tracking-[0.12em] text-white/48">
              {Math.round(progress)}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300 shadow-[0_0_14px_rgba(34,211,238,0.18)]"
              style={{ width: `${progress}%` }}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </button>
  );
}