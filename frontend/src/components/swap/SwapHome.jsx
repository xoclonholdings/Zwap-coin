import React from "react";
import { ArrowRightLeft } from "lucide-react";

import SwapCoreCard from "@/components/swap/SwapCoreCard";
import SwapFeedback from "@/components/swap/SwapFeedback";
import SwapHistory from "@/components/swap/SwapHistory";
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
  hasInternalZwapToClaim,
  hasWalletZwap,
  walletZwapBalance,
  internalZwapBalance,
  zptsBalance,
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

        <SwapHistory
          progressZone={progressZone}
          isConversionReady={isConversionReady}
          hasInternalZwapToClaim={hasInternalZwapToClaim}
          hasWalletZwap={hasWalletZwap}
          walletZwapBalance={walletZwapBalance}
          internalZwapBalance={internalZwapBalance}
          zptsBalance={zptsBalance}
          onOpenConvertModal={onOpenConvertModal}
        />

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