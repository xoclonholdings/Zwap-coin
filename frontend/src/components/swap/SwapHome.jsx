import React from "react";
import { ArrowRightLeft } from "lucide-react";

import SwapCoreCard from "@/components/swap/SwapCoreCard";
import SwapFeedback from "@/components/swap/SwapFeedback";
import SwapHistory from "@/components/swap/SwapHistory";
import SwapEmbeddedFlow from "@/components/swap/SwapEmbeddedFlow";

export default function SwapHome({
  user,
  isPlus,
  isLoadingPrices,
  tokens,
  tokenLogos,
  modes,
  activeMode,
  fromToken,
  toToken,
  fromAmount,
  fromUsd,
  estimatedOutput,
  rate,
  activeService,
  isFullscreen,
  isRouteLoading,
  feedback,
  history,
  availableToConvert,
  readyNowLabel,
  bestRouteLabel,
  primaryActionLabel,
  onSetFromAmount,
  onSwapTokens,
  onSelectMode,
  onSetMax,
  onPrimaryAction,
  onCloseFeedback,
  onToggleFullscreen,
  onCloseSwapService,
}) {
  if (activeService) {
    return (
      <SwapEmbeddedFlow
        activeService={activeService}
        isFullscreen={isFullscreen}
        isRouteLoading={isRouteLoading}
        fromAmount={fromAmount}
        fromToken={fromToken}
        toToken={toToken}
        onToggleFullscreen={onToggleFullscreen}
        onClose={onCloseSwapService}
      />
    );
  }

  return (
    <div
      className="min-h-[calc(100dvh-140px)] bg-[#081017] px-4 py-4 text-white"
      data-testid="swap-tab"
    >
      <div className="mx-auto w-full max-w-md space-y-4">
        <div className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_30%),linear-gradient(180deg,rgba(8,17,34,0.96),rgba(8,12,23,0.98))] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">
                  Swap
                </p>

                <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[11px] font-medium text-amber-300">
                  {isPlus ? "Plus" : "Starter"}
                </div>
              </div>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                Swap & Convert
              </h1>
              <p className="mt-1 text-sm text-white/55">
                Move value across your ZWAP ecosystem.
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
              <ArrowRightLeft className="h-5 w-5 text-cyan-300" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-white/45">
                ZWAP
              </p>
              <p className="mt-1 text-sm font-medium text-cyan-300">
                {Number(user?.zwap_balance ?? 0).toFixed(2)}
              </p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-white/45">
                zPts
              </p>
              <p className="mt-1 text-sm font-medium text-violet-300">
                {Math.floor(Number(user?.zpts_balance ?? 0))}
              </p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-white/45">
                Ready Now
              </p>
              <p className="mt-1 text-sm font-medium text-white/85">
                {readyNowLabel}
              </p>
            </div>
          </div>
        </div>

        <SwapCoreCard
          tokens={tokens}
          tokenLogos={tokenLogos}
          modes={modes}
          activeMode={activeMode}
          onSelectMode={onSelectMode}
          fromToken={fromToken}
          toToken={toToken}
          fromAmount={fromAmount}
          fromUsd={fromUsd}
          estimatedOutput={estimatedOutput}
          rate={rate}
          availableToConvert={availableToConvert}
          isLoadingPrices={isLoadingPrices}
          primaryActionLabel={primaryActionLabel}
          bestRouteLabel={bestRouteLabel}
          onSetFromAmount={onSetFromAmount}
          onSwapTokens={onSwapTokens}
          onSetMax={onSetMax}
          onPrimaryAction={onPrimaryAction}
        />

        <SwapHistory history={history} />

        <SwapFeedback feedback={feedback} onClose={onCloseFeedback} />
      </div>
    </div>
  );
}