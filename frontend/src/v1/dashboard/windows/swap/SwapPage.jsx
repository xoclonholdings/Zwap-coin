import React, { useState } from "react";
import {
  ArrowLeft,
  Bitcoin,
  CircleDollarSign,
  Coins,
  Repeat2,
} from "lucide-react";

import SwapCoreCard from "./SwapCoreCard";
import SwapModesCarousel from "./SwapModesCarousel";

const SWAP_MODES = [
  { id: "convert", name: "Convert" },
  { id: "claim", name: "Claim" },
  { id: "swap", name: "Swap" },
];

const FEATURED_SWAPS = [
  {
    id: "zwap-btc",
    short: "BTC",
    label: "ZWAP → BTC",
    name: "Bitcoin",
    Icon: Bitcoin,
  },
  {
    id: "zwap-eth",
    short: "ETH",
    label: "ZWAP → ETH",
    name: "Ethereum",
    Icon: Repeat2,
  },
  {
    id: "zwap-pol",
    short: "POL",
    label: "ZWAP → POL",
    name: "Polygon",
    Icon: Coins,
  },
  {
    id: "zwap-usdc",
    short: "USDC",
    label: "ZWAP → USDC",
    name: "USD Coin",
    Icon: CircleDollarSign,
  },
];

function FeaturedSwapCard({ item, active = false, onClick }) {
  const Icon = item.Icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-[31%] shrink-0 rounded-[18px] border p-2 text-left transition active:scale-[0.98]",
        active
          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
          : "border-white/10 bg-white/[0.04] text-white",
      ].join(" ")}
    >
      <div
        className={[
          "flex h-[70px] items-center justify-center rounded-[12px] border",
          active
            ? "border-emerald-400/20 bg-emerald-400/10"
            : "border-white/10 bg-white/[0.04]",
        ].join(" ")}
      >
        <Icon className="h-6 w-6" />
      </div>

      <div className="mt-2 text-[11px] font-black text-white">
        {item.label}
      </div>

      <div className="mt-1 text-[10px] font-semibold text-white/45">
        {item.name}
      </div>
    </button>
  );
}

export default function SwapPage({
  onBack,

  zptsBalance = 0,
  claimableZwap = 0,
  zwapBalance = 0,
  isConversionReady = false,

  estimatedSwapOutput = "",

  onConvert,
  onClaim,
  onSwap,
}) {
  const [activeMode, setActiveMode] = useState("convert");
  const [selectedSwap, setSelectedSwap] = useState(FEATURED_SWAPS[1]);

  function handleFeaturedSwapTap(item) {
    setSelectedSwap(item);
    setActiveMode("swap");
  }

  return (
    <div className="flex h-[100dvh] flex-col bg-[#050510] text-white">
      <div className="mb-3 flex items-center justify-between px-4 pt-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/80 transition active:scale-[0.96]"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.18em] text-white/40">
            Swap
          </div>
          <div className="text-[15px] font-semibold tracking-[-0.02em] text-white">
            Overview
          </div>
        </div>

        <div className="w-10" />
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-hidden px-3 pb-3">
        <SwapCoreCard
          activeMode={activeMode}
          zptsBalance={zptsBalance}
          claimableZwap={claimableZwap}
          zwapBalance={zwapBalance}
          isConversionReady={isConversionReady}
          swapToSymbol={selectedSwap?.short || "ETH"}
          estimatedSwapOutput={estimatedSwapOutput}
          onConvert={onConvert}
          onClaim={onClaim}
          onSwap={onSwap}
        />

        <SwapModesCarousel
          modes={SWAP_MODES}
          activeMode={activeMode}
          onSelectMode={setActiveMode}
        />

        <div className="min-h-0 flex-1 overflow-hidden">
          <div className="px-1">
            <div className="text-[13px] font-black text-white">
              Featured Swaps
            </div>
          </div>

          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {FEATURED_SWAPS.map((item) => (
              <FeaturedSwapCard
                key={item.id}
                item={item}
                active={activeMode === "swap" && selectedSwap?.id === item.id}
                onClick={() => handleFeaturedSwapTap(item)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}