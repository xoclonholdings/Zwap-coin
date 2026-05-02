import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Coins, Repeat2, Wallet } from "lucide-react";

function formatNumber(value) {
  const safe = Number(value || 0);
  if (!Number.isFinite(safe)) return "0";

  return safe.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  });
}

function formatWhole(value) {
  const safe = Math.floor(Number(value || 0));
  if (!Number.isFinite(safe)) return "0";
  return safe.toLocaleString();
}

function ConvertCard({
  zptsBalance = 0,
  isConversionReady = false,
  onPrimaryAction,
}) {
  const safeZpts = Math.floor(Number(zptsBalance || 0));
  const estimatedZwap = Math.floor(safeZpts / 1000);

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.26em] text-white/45">
          Convert
        </p>

        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10">
          <Coins className="h-4 w-4 text-emerald-300" />
        </div>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
              zPts Balance
            </p>
            <div className="mt-2 rounded-[18px] border border-white/10 bg-black/20 px-3 py-3 text-[20px] font-semibold text-white">
              {formatWhole(safeZpts)}
            </div>
          </div>

          <div className="pb-3 text-lg font-semibold text-white/35">→</div>

          <div>
            <p className="text-right text-[10px] uppercase tracking-[0.2em] text-white/40">
              ZWAP Balance
            </p>
            <div className="mt-2 rounded-[18px] border border-white/10 bg-black/20 px-3 py-3 text-right text-[20px] font-semibold text-emerald-300">
              {formatNumber(estimatedZwap)}
            </div>
          </div>
        </div>

        <motion.button
          type="button"
          onClick={onPrimaryAction}
          disabled={!isConversionReady}
          whileTap={isConversionReady ? { scale: 0.98 } : {}}
          className={`mt-5 inline-flex w-full items-center justify-center rounded-[22px] px-4 py-3 text-sm font-semibold transition ${
            isConversionReady
              ? "border border-emerald-300/30 bg-emerald-400 text-[#071511] shadow-[0_8px_0_rgba(10,84,64,0.95)]"
              : "cursor-not-allowed border border-white/8 bg-white/8 text-white/35"
          }`}
        >
          Convert Now
        </motion.button>
      </div>
    </>
  );
}

function ClaimCard({ claimableZwap = 0, onPrimaryAction }) {
  const canClaim = Number(claimableZwap || 0) > 0;

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.26em] text-white/45">
          Claim
        </p>

        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
          <Wallet className="h-4 w-4 text-cyan-300" />
        </div>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
          Claimable
        </p>

        <div className="mt-2 flex items-center gap-2 rounded-[18px] border border-white/10 bg-black/20 px-3 py-3">
          <div className="min-w-0 flex-1 text-[22px] font-semibold text-white">
            {formatNumber(claimableZwap)}
          </div>

          <div className="shrink-0 text-[12px] font-semibold uppercase tracking-[0.14em] text-cyan-300/80">
            ZWAP
          </div>
        </div>

        <motion.button
          type="button"
          onClick={onPrimaryAction}
          disabled={!canClaim}
          whileTap={canClaim ? { scale: 0.98 } : {}}
          className={`mt-5 inline-flex w-full items-center justify-center rounded-[22px] px-4 py-3 text-sm font-semibold transition ${
            canClaim
              ? "border border-cyan-300/30 bg-cyan-300 text-[#07111f] shadow-[0_8px_0_rgba(8,68,88,0.95)]"
              : "cursor-not-allowed border border-white/8 bg-white/8 text-white/35"
          }`}
        >
          Claim ZWAP
        </motion.button>
      </div>
    </>
  );
}

function SwapCard({
  zwapBalance = 0,
  swapToSymbol = "ETH",
  estimatedOutput = "",
  onPrimaryAction,
}) {
  const [amount, setAmount] = useState("");

  const safeZwapBalance = Number(zwapBalance || 0);
  const safeAmount = Number(amount || 0);
  const canSwap =
    Number.isFinite(safeAmount) &&
    safeAmount > 0 &&
    safeAmount <= safeZwapBalance;

  const displayOutput = useMemo(() => {
    if (estimatedOutput !== "") return estimatedOutput;
    if (!canSwap) return "0";
    return "0";
  }, [canSwap, estimatedOutput]);

  function handleMax() {
    setAmount(String(safeZwapBalance || ""));
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.26em] text-white/45">
          Swap
        </p>

        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10">
          <Repeat2 className="h-4 w-4 text-amber-300" />
        </div>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
          <div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                ZWAP Balance
              </p>

              <button
                type="button"
                onClick={handleMax}
                className="rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-[10px] font-semibold text-white/65 transition active:scale-[0.98]"
              >
                Max
              </button>
            </div>

            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0"
              className="mt-2 w-full rounded-[18px] border border-white/10 bg-black/20 px-3 py-3 text-[20px] font-semibold text-white outline-none placeholder:text-white/20"
            />

            <p className="mt-1 text-[10px] text-white/35">
              {formatNumber(safeZwapBalance)} ZWAP
            </p>
          </div>

          <div className="pb-6 text-lg font-semibold text-white/35">→</div>

          <div>
            <p className="text-right text-[10px] uppercase tracking-[0.2em] text-white/40">
              {swapToSymbol}
            </p>

            <div className="mt-2 rounded-[18px] border border-white/10 bg-black/20 px-3 py-3 text-right text-[20px] font-semibold text-white">
              {displayOutput}
            </div>
          </div>
        </div>

        <motion.button
          type="button"
          onClick={() => onPrimaryAction?.({ amount, toSymbol: swapToSymbol })}
          disabled={!canSwap}
          whileTap={canSwap ? { scale: 0.98 } : {}}
          className={`mt-5 inline-flex w-full items-center justify-center rounded-[22px] px-4 py-3 text-sm font-semibold transition ${
            canSwap
              ? "border border-amber-300/30 bg-amber-300 text-[#171007] shadow-[0_8px_0_rgba(92,64,14,0.95)]"
              : "cursor-not-allowed border border-white/8 bg-white/8 text-white/35"
          }`}
        >
          Swap Now
        </motion.button>
      </div>
    </>
  );
}

export default function SwapCoreCard({
  activeMode = "convert",
  zptsBalance = 0,
  claimableZwap = 0,
  zwapBalance = 0,
  isConversionReady = false,
  swapToSymbol = "ETH",
  estimatedSwapOutput = "",
  onConvert,
  onClaim,
  onSwap,
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(52,211,153,0.12),transparent_34%),linear-gradient(180deg,rgba(9,22,19,0.98),rgba(7,13,16,0.98))] p-4">
      {activeMode === "claim" ? (
        <ClaimCard claimableZwap={claimableZwap} onPrimaryAction={onClaim} />
      ) : activeMode === "swap" ? (
        <SwapCard
          zwapBalance={zwapBalance}
          swapToSymbol={swapToSymbol}
          estimatedOutput={estimatedSwapOutput}
          onPrimaryAction={onSwap}
        />
      ) : (
        <ConvertCard
          zptsBalance={zptsBalance}
          isConversionReady={isConversionReady}
          onPrimaryAction={onConvert}
        />
      )}
    </div>
  );
}