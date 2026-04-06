import React from "react";
import { ArrowRightLeft, TrendingUp } from "lucide-react";

import SwapCoreCard from "@/components/swap/SwapCoreCard";
import SwapFeedback from "@/components/swap/SwapFeedback";
import SwapEmbeddedFlow from "@/components/swap/SwapEmbeddedFlow";
import ConvertZPtsModal from "@/components/swap/ConvertZPtsModal";

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
  availableToConvert,
  progressZone,
  isConversionReady,
  isConvertModalOpen,
  primaryActionLabel,
  onSetFromAmount,
  onSwapTokens,
  onSelectMode,
  onSetMax,
  onPrimaryAction,
  onOpenConvertModal,
  onCloseConvertModal,
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

  const progressTitle = isConversionReady
    ? "Conversion Ready"
    : "Progress Zone";

  const progressBody = isConversionReady
    ? "Your zPts balance is ready for conversion into ZWAP."
    : "Track your build path and unlock conversion as your zPts balance grows.";

  const progressCta = isConversionReady ? "Convert zPts" : "Open Progress";

  return (
    <div
      className="min-h-[calc(100dvh-140px)] bg-[#081017] px-4 py-4 text-white"
      data-testid="swap-tab"
    >
      <div className="mx-auto w-full max-w-md space-y-4">
        <div className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(52,211,153,0.18),transparent_35%),linear-gradient(180deg,rgba(10,24,22,0.96),rgba(6,14,14,0.98))] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[11px] uppercase tracking-[0.28em] text-emerald-200/70">
                  Swap
                </p>

                <div className="rounded-xl border border-amber-400/25 bg-[linear-gradient(180deg,rgba(251,191,36,0.18),rgba(251,191,36,0.08))] px-2.5 py-1 text-[11px] font-medium text-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.10)]">
                  {isPlus ? "Zitizen" : "Zwapper"}
                </div>
              </div>

              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                Swap & Convert
              </h1>

              <p className="mt-1 text-sm text-emerald-50/65">
                Move value across your ZWAP ecosystem.
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/25 bg-[radial-gradient(circle_at_top,rgba(52,211,153,0.22),rgba(52,211,153,0.10))] shadow-[0_0_24px_rgba(52,211,153,0.14)]">
              <ArrowRightLeft className="h-5 w-5 text-emerald-300" />
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
          progressZone={progressZone}
          isConversionReady={isConversionReady}
          onSetFromAmount={onSetFromAmount}
          onSwapTokens={onSwapTokens}
          onSetMax={onSetMax}
          onPrimaryAction={onPrimaryAction}
        />

        <div className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(52,211,153,0.14),transparent_35%),linear-gradient(180deg,rgba(11,24,20,0.96),rgba(7,15,13,0.98))] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.35)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[11px] uppercase tracking-[0.28em] text-emerald-200/70">
                  Progress
                </p>

                <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                  {progressZone}
                </div>
              </div>

              <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">
                {progressTitle}
              </h3>

              <p className="mt-1 text-sm text-emerald-50/65">
                {progressBody}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/25 bg-[radial-gradient(circle_at_top,rgba(52,211,153,0.22),rgba(52,211,153,0.10))] shadow-[0_0_20px_rgba(52,211,153,0.12)]">
              <TrendingUp className="h-5 w-5 text-emerald-300" />
            </div>
          </div>

          <div className="mt-4 rounded-[22px] border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">
                  Current Zone
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {progressZone}
                </p>
              </div>

              <button
                type="button"
                onClick={onOpenConvertModal}
                className="inline-flex items-center justify-center rounded-2xl border border-emerald-300/30 bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-[#071511] shadow-[0_8px_0_rgba(10,84,64,0.95),0_14px_24px_rgba(52,211,153,0.22),inset_0_1px_0_rgba(255,255,255,0.35)] transition hover:translate-y-[1px] hover:shadow-[0_6px_0_rgba(10,84,64,0.95),0_12px_20px_rgba(52,211,153,0.20),inset_0_1px_0_rgba(255,255,255,0.35)]"
              >
                {progressCta}
              </button>
            </div>
          </div>
        </div>

        <SwapFeedback feedback={feedback} onClose={onCloseFeedback} />
      </div>

      <ConvertZPtsModal
        open={isConvertModalOpen}
        onClose={onCloseConvertModal}
        isReady={isConversionReady}
        progressZone={progressZone}
        zptsBalance={Math.floor(Number(user?.zpts_balance ?? 0))}
        onConvert={onPrimaryAction}
      />
    </div>
  );
}