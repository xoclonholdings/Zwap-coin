import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRightLeft,
  Bitcoin,
  Coins,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import SwapCoreCard from "@/components/swap/SwapCoreCard";
import SwapPortal from "@/components/swap/SwapPortal";
import SwapFeedback from "@/components/swap/SwapFeedback";
import SwapHistory from "@/components/swap/SwapHistory";
import SwapEmbeddedFlow from "@/components/swap/SwapEmbeddedFlow";

function getModeButtonMeta(mode) {
  switch (mode?.id) {
    case "convert-zpts":
      return {
        shortLabel: "zPts",
        title: "Convert",
        subtitle: "Points → ZWAP",
        Icon: Coins,
      };
    case "swap-btc":
      return {
        shortLabel: "BTC",
        title: "Bitcoin",
        subtitle: "ZWAP → BTC",
        Icon: Bitcoin,
      };
    case "swap-eth":
      return {
        shortLabel: "ETH",
        title: "Ethereum",
        subtitle: "ZWAP → ETH",
        Icon: ArrowRightLeft,
      };
    case "swap-usdc":
      return {
        shortLabel: "USDC",
        title: "Stable",
        subtitle: "ZWAP → USDC",
        Icon: ArrowRightLeft,
      };
    default:
      return {
        shortLabel: mode?.name || "Mode",
        title: mode?.name || "Mode",
        subtitle: `${mode?.fromToken || ""} → ${mode?.toToken || ""}`,
        Icon: ArrowRightLeft,
      };
  }
}

export default function SwapHome({
  user,
  isPlus,
  prices,
  isLoadingPrices,
  tokens,
  tokenLogos,
  services,
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
  externalSwapNotice,
  feedback,
  history,
  availableToConvert,
  readyNowLabel,
  bestRouteLabel,
  primaryActionLabel,
  portalData,
  onSetFromToken,
  onSetToToken,
  onSetFromAmount,
  onSwapTokens,
  onSelectMode,
  onSetMax,
  onRefresh,
  onPrimaryAction,
  onOpenRoute,
  onDismissExternalNotice,
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

  const visibleModes = (modes || []).slice(0, 4);
  const activeModeConfig =
    visibleModes.find((mode) => mode.id === activeMode) || visibleModes[0];
  const activeMeta = getModeButtonMeta(activeModeConfig);

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

        <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(13,24,36,0.96),rgba(9,16,26,0.98))] p-3 shadow-[0_16px_40px_rgba(0,0,0,0.24)]">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">
                Conversion Modes
              </p>
              <h3 className="mt-1 text-sm font-semibold text-white">
                Choose your utility path
              </h3>
            </div>

            <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-medium text-cyan-300">
              {activeMeta?.shortLabel || "Mode"}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {visibleModes.map((mode, index) => {
              const meta = getModeButtonMeta(mode);
              const isActive = activeMode === mode.id;
              const Icon = meta.Icon;

              return (
                <motion.button
                  type="button"
                  key={mode.id}
                  onClick={() => onSelectMode(mode.id)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  whileTap={{ scale: 0.98 }}
                  className={`rounded-[20px] border p-3 text-left transition ${
                    isActive
                      ? "border-cyan-400/30 bg-cyan-400/10 shadow-[0_0_0_1px_rgba(34,211,238,0.12)]"
                      : "border-white/8 bg-white/5 hover:bg-white/8"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${
                        isActive
                          ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
                          : "border-white/10 bg-white/6 text-white/70"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div
                      className={`rounded-xl px-2 py-1 text-[10px] font-medium ${
                        isActive
                          ? "bg-cyan-400/10 text-cyan-300"
                          : "bg-white/6 text-white/45"
                      }`}
                    >
                      {isActive ? "Selected" : "Open"}
                    </div>
                  </div>

                  <p className="mt-3 text-sm font-semibold text-white">
                    {meta.title}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-white/55">
                    {meta.subtitle}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </div>

        <SwapCoreCard
          tokens={tokens}
          tokenLogos={tokenLogos}
          fromToken={fromToken}
          toToken={toToken}
          fromAmount={fromAmount}
          fromUsd={fromUsd}
          estimatedOutput={estimatedOutput}
          rate={rate}
          availableToConvert={availableToConvert}
          isLoadingPrices={isLoadingPrices}
          primaryActionLabel={primaryActionLabel}
          onSetFromToken={onSetFromToken}
          onSetToToken={onSetToToken}
          onSetFromAmount={onSetFromAmount}
          onSwapTokens={onSwapTokens}
          onSetMax={onSetMax}
          onPrimaryAction={onPrimaryAction}
        />

        <AnimatePresence>
          {externalSwapNotice && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="rounded-[24px] border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(18,40,56,0.92),rgba(8,19,28,0.96))] p-4 shadow-[0_10px_35px_rgba(34,211,238,0.08)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                    <ShieldCheck className="h-4 w-4 text-cyan-300" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      Route opened
                    </p>
                    <p className="mt-1 text-xs leading-5 text-white/60">
                      Your conversion flow was opened securely. Complete the
                      wallet confirmation there, then return here to refresh
                      balances.
                    </p>
                    <p className="mt-2 text-xs font-medium text-cyan-300">
                      {externalSwapNotice.fromAmount || "0"}{" "}
                      {externalSwapNotice.fromToken} →{" "}
                      {externalSwapNotice.toToken}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onDismissExternalNotice}
                  className="rounded-xl border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/60 transition hover:bg-white/10 hover:text-white"
                >
                  Dismiss
                </button>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={onRefresh}
                  className="inline-flex flex-1 items-center justify-center rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/12"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (externalSwapNotice?.url) {
                      window.open(
                        externalSwapNotice.url,
                        "_blank",
                        "noopener,noreferrer"
                      );
                    }
                  }}
                  className="inline-flex flex-1 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-200 transition hover:bg-cyan-400/15"
                >
                  Open Again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SwapPortal
            services={services}
            portalData={portalData}
            fromToken={fromToken}
            toToken={toToken}
            prices={prices}
            bestRouteLabel={bestRouteLabel}
            onOpenRoute={onOpenRoute}
          />

          <SwapHistory history={history} />
        </div>

        <SwapFeedback feedback={feedback} onClose={onCloseFeedback} />

        <p className="px-1 text-center text-[11px] text-white/35">
          Swap keeps reward utility simple while supported routes handle secure
          confirmation when needed.
        </p>
      </div>
    </div>
  );
}