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
        shortLabel: "zPts",
        Icon: Coins,
      };
    case "swap-btc":
      return {
        shortLabel: "BTC",
        Icon: Bitcoin,
      };
    case "swap-eth":
      return {
        shortLabel: "ETH",
        Icon: ArrowRightLeft,
      };
    case "swap-usdc":
      return {
        shortLabel: "USDC",
        Icon: ArrowRightLeft,
      };
    default:
      return {
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
  progressZone,
  isConversionReady,
  onSetFromAmount,
  onSwapTokens,
  onSetMax,
  onPrimaryAction,
}) {
  const canSubmit =
    fromAmount &&
    Number.isFinite(parseFloat(fromAmount)) &&
    parseFloat(fromAmount) > 0;

  const disableFlip = fromToken === "zPTS" || toToken === "zPTS";
  const visibleModes = modes.slice(0, 4);

  const helperTitle =
    activeMode === "convert-zpts"
      ? "Progress toward ZWAP"
      : "Estimated unlock value";

  const helperLine =
    activeMode === "convert-zpts"
      ? isConversionReady
        ? "Conversion available once you continue."
        : "Keep building until the next conversion unlock is ready."
      : "Continue when you're ready to move value into this asset path.";

  const rateLine =
    activeMode === "convert-zpts"
      ? isConversionReady
        ? "Unlock available"
        : `Zone: ${progressZone}`
      : isLoadingPrices
      ? "Updating market path..."
      : `1 ${fromToken} ≈ ${rate} ${toToken}`;

  return (
    <div className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(52,211,153,0.12),transparent_34%),linear-gradient(180deg,rgba(9,22,19,0.98),rgba(7,13,16,0.98))] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.30)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[11px] uppercase tracking-[0.26em] text-emerald-100/45">
              Utility Flow
            </p>
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
              Guided
            </div>
          </div>

          <h3 className="mt-1 text-xl font-semibold tracking-tight text-white">
            Build Value
          </h3>
          <p className="mt-1 text-sm text-emerald-50/60">
            Progress your balance and move it when the path is ready.
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10">
          <Sparkles className="h-5 w-5 text-emerald-300" />
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">
            Conversion Modes
          </p>

          <div className="rounded-xl border border-white/8 bg-white/5 px-2.5 py-1 text-[11px] text-white/50">
            Tap to switch
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
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                whileTap={{ scale: 0.98 }}
                className={`inline-flex h-12 items-center justify-center gap-2 rounded-2xl border px-3 text-sm font-semibold transition ${
                  isActive
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300 shadow-[0_0_0_1px_rgba(52,211,153,0.10)]"
                    : "border-white/8 bg-white/5 text-white/72 hover:bg-white/8"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{meta.shortLabel}</span>
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
                className="inline-flex h-8 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 text-[11px] font-medium text-emerald-300 transition hover:bg-emerald-400/15"
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
                  className="block w-full bg-transparent text-right text-[28px] font-semibold leading-none text-white outline-none placeholder:text-white/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <p className="mt-2 truncate text-xs text-white/35">
                  {fromUsd === "0.00" ? "Value will appear here" : `≈ $${fromUsd}`}
                </p>
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
              className={`flex h-11 w-11 items-center justify-center rounded-full border-4 border-[#081017] transition ${
                disableFlip
                  ? "cursor-not-allowed bg-white/6 text-white/25"
                  : "bg-white/8 text-emerald-300 shadow-[0_0_18px_rgba(52,211,153,0.18)] hover:bg-white/12"
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
              <p className="mt-2 truncate text-xs text-white/35">{rateLine}</p>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-2xl border border-white/8 bg-white/5 px-3 py-2.5">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-300" />
          <div className="min-w-0">
            <p className="text-xs font-medium text-white/80">{helperTitle}</p>
            <p className="mt-0.5 text-[11px] text-white/55">{helperLine}</p>
          </div>
        </div>

        <motion.button
          type="button"
          onClick={onPrimaryAction}
          disabled={!canSubmit}
          whileTap={canSubmit ? { scale: 0.985, y: 2 } : {}}
          className={`mt-4 inline-flex w-full items-center justify-center rounded-[22px] px-4 py-3.5 text-sm font-semibold transition ${
            canSubmit
              ? "border border-emerald-300/30 bg-emerald-400 text-[#071511] shadow-[0_10px_0_rgba(10,84,64,0.95),0_16px_28px_rgba(52,211,153,0.24),inset_0_1px_0_rgba(255,255,255,0.35)] hover:translate-y-[1px] hover:shadow-[0_8px_0_rgba(10,84,64,0.95),0_14px_24px_rgba(52,211,153,0.22),inset_0_1px_0_rgba(255,255,255,0.35)]"
              : "cursor-not-allowed border border-white/8 bg-white/8 text-white/35"
          }`}
        >
          <ArrowRightLeft className="mr-2 h-4 w-4" />
          {primaryActionLabel}
        </motion.button>
      </div>
    </div>
  );
}