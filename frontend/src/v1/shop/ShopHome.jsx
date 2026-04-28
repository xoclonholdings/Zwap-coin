import React from "react";
import { ShoppingBag } from "lucide-react";

export default function ShopHome() {
  return (
    <div className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(236,72,153,0.16),_transparent_34%),linear-gradient(180deg,rgba(14,10,24,0.97),rgba(9,8,18,0.99))] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.38)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">
              Shop
            </p>

            <div className="rounded-xl border border-pink-400/20 bg-pink-400/10 px-2.5 py-1 text-[11px] font-medium text-pink-200">
              Marketplace
            </div>
          </div>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">
            Spend &amp; Redeem
          </h1>

          <p className="mt-1 text-sm text-white/55">
            Turn rewards into real value.
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-pink-400/20 bg-pink-400/10">
          <ShoppingBag className="h-5 w-5 text-pink-300" />
        </div>
      </div>
    </div>
  );
}
