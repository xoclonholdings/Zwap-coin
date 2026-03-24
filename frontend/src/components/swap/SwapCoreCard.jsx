import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, ArrowRightLeft, ChevronDown, Sparkles } from "lucide-react";

function TokenIcon({ token, tokenLogos, size = "md" }) {
  const sizeClasses = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-11 w-11",
  };

  const imgSizes = {
    sm: "h-5 w-5",
    md: "h-7 w-7",
    lg: "h-9 w-9",
  };

  return (
    <div
      className={`${sizeClasses[size]} overflow-hidden rounded-full bg-white/8 flex items-center justify-center border border-white/10`}
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

function TokenSelector({
  selected,
  onSelect,
  exclude,
  tokens,
  tokenLogos,
  show,
  setShow,
  allowedTokens,
}) {
  const options = useMemo(() => {
    const keys = allowedTokens?.length
      ? allowedTokens
      : Object.keys(tokens || {});

    return keys.filter((key) => key !== exclude);
  }, [allowedTokens, exclude, tokens]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShow((prev) => !prev)}
        className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/6 px-3 py-2 transition hover:bg-white/10"
      >
        <TokenIcon token={selected} tokenLogos={tokenLogos} size="sm" />
        <span className="text-sm font-semibold text-white">{selected}</span>
        <ChevronDown
          className={`h-4 w-4 text-white/50 transition-transform ${
            show ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute left-0 z-20 mt-2 w-56 overflow-hidden rounded-[22px] border border-white/10 bg-[#0c1723] shadow-[0_18px_40px_rgba(0,0,0,0.4)]"
          >
            {options.map((key) => (
              <button
                type="button"
                key={key}
                onClick={() => {
                  onSelect(key);
                  setShow(false);
                }}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/8 ${
                  selected === key ? "bg-white/8" : ""
                }`}
              >
                <TokenIcon token={key} tokenLogos={tokenLogos} size="sm" />

                <div>
                  <p className="text-sm font-medium text-white">{key}</p>
                  <p className="text-[11px] text-white/45">
                    {tokens?.[key]?.name || key}
                  </p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SwapCoreCard({
  tokens,
  tokenLogos,
  fromToken,
  toToken,
  fromAmount,
  fromUsd,
  estimatedOutput,
  rate,
  availableToConvert,
  isLoadingPrices,
  primaryActionLabel,
  onSetFromToken,
  onSetToToken,
  onSetFromAmount,
  onSwapTokens,
  onSetMax,
  onPrimaryAction,
}) {
  const [showFromTokens, setShowFromTokens] = useState(false);
  const [showToTokens, setShowToTokens] = useState(false);

  const fromAllowedTokens = useMemo(
    () => ["zPTS", "ZWAP", "MATIC", "USDC", "USDT", "WETH", "WBTC"],
    []
  );

  const toAllowedTokens = useMemo(
    () => ["ZWAP", "MATIC", "USDC", "USDT", "WETH", "WBTC"],
    []
  );

  const canSubmit =
    fromAmount && Number.isFinite(parseFloat(fromAmount)) && parseFloat(fromAmount) > 0;

  return (
    <div className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.10),_transparent_30%),linear-gradient(180deg,rgba(9,18,30,0.98),rgba(7,13,24,0.98))] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
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
            Move balances cleanly across supported ZWAP routes.
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/10">
          <Sparkles className="h-5 w-5 text-violet-300" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded-[24px] border border-white/10 bg-white/5 p-3">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-[11px] uppercase tracking-wide text-white/45">
              From
            </label>
            <button
              type="button"
              onClick={onSetMax}
              className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-medium text-cyan-300 transition hover:bg-cyan-400/15"
            >
              Max {Number(availableToConvert || 0).toFixed(fromToken === "zPTS" ? 0 : 2)}
            </button>
          </div>

          <div className="flex items-center gap-3 rounded-[20px] border border-white/8 bg-black/20 p-3">
            <TokenSelector
              selected={fromToken}
              onSelect={onSetFromToken}
              exclude={toToken}
              tokens={tokens}
              tokenLogos={tokenLogos}
              show={showFromTokens}
              setShow={setShowFromTokens}
              allowedTokens={fromAllowedTokens}
            />

            <input
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={fromAmount}
              onChange={(e) => onSetFromAmount(e.target.value)}
              className="flex-1 bg-transparent text-right text-2xl font-medium text-white outline-none placeholder:text-white/20"
            />
          </div>

          <div className="mt-2 flex items-center justify-between px-1">
            <p className="text-xs text-white/40">≈ ${fromUsd}</p>
            <p className="text-xs text-white/40">
              Balance ready:{" "}
              <span className="text-white/70">
                {Number(availableToConvert || 0).toFixed(fromToken === "zPTS" ? 0 : 2)}
              </span>
            </p>
          </div>
        </div>

        <div className="relative flex justify-center py-1">
          <motion.button
            type="button"
            onClick={onSwapTokens}
            whileHover={{ rotate: 180 }}
            whileTap={{ scale: 0.92 }}
            className="flex h-11 w-11 items-center justify-center rounded-full border-4 border-[#081017] bg-white/8 text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.18)] transition hover:bg-white/12"
          >
            <ArrowDown className="h-5 w-5" />
          </motion.button>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/5 p-3">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-[11px] uppercase tracking-wide text-white/45">
              To
            </label>
            <div className="inline-flex items-center rounded-xl border border-white/8 bg-white/5 px-2.5 py-1 text-[11px] text-white/45">
              Estimate
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-[20px] border border-white/8 bg-black/20 p-3">
            <TokenSelector
              selected={toToken}
              onSelect={onSetToToken}
              exclude={fromToken}
              tokens={tokens}
              tokenLogos={tokenLogos}
              show={showToTokens}
              setShow={setShowToTokens}
              allowedTokens={toAllowedTokens}
            />

            <div className="flex-1 text-right">
              <p className="text-2xl font-medium text-white">{estimatedOutput}</p>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between px-1">
            <p className="text-xs text-white/40">
              {isLoadingPrices ? "Updating route data..." : `Rate: 1 ${fromToken} ≈ ${rate} ${toToken}`}
            </p>
            <div className="inline-flex items-center text-xs text-cyan-300">
              <ArrowRightLeft className="mr-1 h-3.5 w-3.5" />
              Ready route
            </div>
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
  );
}