import React from "react";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRightLeft,
  Bitcoin,
  Coins,
  Info,
  Sparkles,
} from "lucide-react";

function TokenIcon({ token, tokenLogos, size = "md" }) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const imgSizes = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div
      className={`${sizeClasses[size]} flex items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/6`}
    >
      {tokenLogos?.[token] ? (
        <img
          src={tokenLogos[token]}
          alt={token}
          className={`${imgSizes[size]} object-contain`}
          onError={(e) => {
            e.currentTarget.style.display = "none";
            if (e.currentTarget.parentElement) {
              e.currentTarget.parentElement.innerHTML = `<span class="text-[10px] font-bold text-white">${token
                ?.slice(0, 2)
                ?.toUpperCase()}</span>`;
            }
          }}
        />
      ) : (
        <span className="text-[10px] font-bold text-white">
          {token?.slice(0, 2)?.toUpperCase()}
        </span>
      )}
    </div>
  );
}

function AssetChip({ token, tokens, tokenLogos }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/6 px-3 py-2">
      <TokenIcon token={token} tokenLogos={tokenLogos} size="sm" />
      <div className="leading-tight">
        <p className="text-sm font-semibold text-white">{token}</p>
        <p className="text-[10px] text-white/45">
          {tokens?.[token]?.name || token}
        </p>
      </div>
    </div>
  );
}

function formatBalance(value, token) {
  const num = Number(value || 0);
  if (!Number.isFinite(num)) return "0";
  return num.toFixed(token === "zPTS" ? 0 : 2);
}

function getModeMeta(mode) {
  switch (mode?.id) {
    case "convert-zpts":
      return {
        title: "Convert",
        subtitle: "Points → ZWAP",
        shortLabel: "zPts",
        Icon: Coins,
      };
    case "swap-btc":
      return {
        title: "Bitcoin",
        subtitle: "ZWAP → BTC",
        shortLabel: "BTC",
        Icon: Bitcoin,
      };
    case "swap-eth":
      return {
        title: "Ethereum",
        subtitle: "ZWAP → ETH",
        shortLabel: "ETH",
        Icon: ArrowRightLeft,
      };
    case "swap-usdc":
      return {
        title: "Stable",
        subtitle: "ZWAP → USDC",
        shortLabel: "USDC",
        Icon: ArrowRightLeft,
      };
    default:
      return {
        title: mode?.name || "Mode",
        subtitle: `${mode?.fromToken || ""} → ${mode?.toToken || ""}`,
        shortLabel: mode?.name || "Mode",
        Icon: ArrowRightLeft,
      };
  }
}

export default function SwapCoreCard({
  tokens,
  tokenLogos,
  modes = [],
  activeMode,
  onSelectMode,
  fromToken,
  toToken,
  fromAmount,
  fromUsd,
  estimatedOutput,
  rate,
  availableToConvert,
  isLoadingPrices,
  primaryActionLabel,
  bestRouteLabel,
  portalData,
  onSetFromAmount,
  onSwapTokens,
  onSetMax,
  onPrimaryAction,
  onOpenRoute,
}) {
  const canSubmit =
    fromAmount &&
    Number.isFinite(parseFloat(fromAmount)) &&
    parseFloat(fromAmount) > 0;

  const disableFlip = fromToken === "zPTS" || toToken === "zPTS";
  const visibleModes = modes.slice(0, 4);
  const activeModeConfig =
    visibleModes.find((mode) => mode.id === activeMode) || visibleModes[0];
  const activeModeMeta = getModeMeta(activeModeConfig);

  const infoText =
    activeMode === "convert-zpts"
      ? "zPts convert directly into ZWAP inside your reward flow."
      : "Some swaps may continue in a secure external confirmation step after you choose your amount.";

  const featuredService =
    portalData?.featuredServiceName || "Secure Route";

  return (
    <div className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.10),_transparent_34%),linear-gradient(180deg,rgba(9,18,30,0.98),rgba(7,13,24,0.98))] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.30)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[11px] uppercase tracking-[0.26em] text-white/40">
              Utility Flow
            </p>
            <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-medium text-cyan-300">
              Guided
            </div>
          </div>

          <h3 className="mt-1 text-xl font-semibold tracking-tight text-white">
            Convert Value
          </h3>
          <p className="mt-1 text-sm text-white/55">
            Clean reward conversion without exposing the machinery.
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/10">
          <Sparkles className="h-5 w-5 text-violet-300" />
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">
              Conversion Modes
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              Choose your utility path
            </p>
          </div>

          <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-medium text-cyan-300">
            {activeModeMeta?.shortLabel || "Mode"}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {visibleModes.map((mode, index) => {
            const meta = getModeMeta(mode);
            const Icon = meta.Icon;
            const isActive = activeMode === mode.id;

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

      <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-3">
        <div className="grid grid-cols-[1fr_auto] gap-3">
          <div className="rounded-[20px] border border-white/8 bg-black/20 p-3">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-[11px] uppercase tracking-wide text-white/45">
                From
              </p>

              <button
                type="button"
                onClick={onSetMax}
                className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-medium text-cyan-300 transition hover:bg-cyan-400/15"
              >
                Max
              </button>
            </div>

            <div className="flex items-center justify-between gap-3">
              <AssetChip
                token={fromToken}
                tokens={tokens}
                tokenLogos={tokenLogos}
              />

              <div className="min-w-0 flex-1 text-right">
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={fromAmount}
                  onChange={(e) => onSetFromAmount(e.target.value)}
                  className="block w-full truncate bg-transparent text-right text-[28px] font-semibold leading-none text-white outline-none placeholder:text-white/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <p className="mt-2 truncate text-xs text-white/40">≈ ${fromUsd}</p>
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-white/8 bg-white/5 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-white/40">
                Available
              </p>
              <p className="mt-1 text-sm font-medium text-white/80">
                {formatBalance(availableToConvert, fromToken)} {fromToken}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <motion.button
              type="button"
              onClick={onSwapTokens}
              disabled={disableFlip}
              whileHover={disableFlip ? {} : { rotate: 180 }}
              whileTap={disableFlip ? {} : { scale: 0.92 }}
              className={`flex h-11 w-11 items-center justify-center rounded-full border-4 border-[#081017] shadow-[0_0_18px_rgba(34,211,238,0.18)] transition ${
                disableFlip
                  ? "cursor-not-allowed bg-white/6 text-white/25"
                  : "bg-white/8 text-cyan-300 hover:bg-white/12"
              }`}
            >
              <ArrowDown className="h-5 w-5" />
            </motion.button>
          </div>
        </div>

        <div className="mt-3 rounded-[20px] border border-white/8 bg-black/20 p-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-[11px] uppercase tracking-wide text-white/45">
              To
            </p>

            <div className="rounded-xl border border-white/8 bg-white/5 px-2.5 py-1 text-[11px] text-white/45">
              Estimate
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <AssetChip token={toToken} tokens={tokens} tokenLogos={tokenLogos} />

            <div className="min-w-0 flex-1 text-right">
              <p className="truncate text-[28px] font-semibold leading-none text-white">
                {estimatedOutput}
              </p>
              <p className="mt-2 truncate text-xs text-white/40">
                {isLoadingPrices
                  ? "Updating route data..."
                  : `1 ${fromToken} ≈ ${rate} ${toToken}`}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-white/8 bg-white/5 p-3">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-violet-300" />
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-white/45">
                Helpful Context
              </p>
              <p className="mt-1 text-xs leading-5 text-white/58">
                {infoText}
              </p>
              <p className="mt-2 text-xs font-medium text-cyan-300">
                {bestRouteLabel}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onPrimaryAction}
          disabled={!canSubmit}
          className={`mt-4 inline-flex w-full items-center justify-center rounded-[22px] px-4 py-3.5 text-sm font-semibold transition ${
            canSubmit
              ? "bg-cyan-500 text-[#04121a] shadow-[0_12px_30px_rgba(34,211,238,0.25)] hover:bg-cyan-400"
              : "cursor-not-allowed bg-white/8 text-white/35"
          }`}
        >
          <ArrowRightLeft className="mr-2 h-4 w-4" />
          {primaryActionLabel}
        </button>
      </div>
    </div>
  );
}