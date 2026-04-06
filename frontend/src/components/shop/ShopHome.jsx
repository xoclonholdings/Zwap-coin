import React from "react";
import { RefreshCw } from "lucide-react";

function tierLabel(tier) {
  return String(tier || "starter").toLowerCase() === "plus"
    ? "Plus"
    : "Starter";
}

export default function ShopHome({
  balances,
  items,
  onRefresh,
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.14),_transparent_30%),linear-gradient(180deg,rgba(11,10,24,0.96),rgba(9,12,18,0.98))] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">
              Shop
            </p>

            <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[11px] font-medium text-amber-300">
              {tierLabel(balances?.tier)}
            </div>
          </div>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">
            Spend &amp; Redeem
          </h1>

          <p className="mt-1 text-sm text-white/55">
            Turn rewards into real value.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/10"
        >
          <RefreshCw className="h-5 w-5 text-violet-300" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wide text-white/45">
            ZWAP
          </p>
          <p className="mt-1 text-sm font-medium text-violet-300">
            {Number(balances?.zwap || 0).toFixed(2)}
          </p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wide text-white/45">
            zPts
          </p>
          <p className="mt-1 text-sm font-medium text-cyan-300">
            {Number(balances?.zpts || 0).toLocaleString()}
          </p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wide text-white/45">
            Status
          </p>
          <p className="mt-1 text-sm font-medium text-white/85">
            {items?.length ? "Ready" : "Locked"}
          </p>
        </div>
      </div>
    </div>
  );
}