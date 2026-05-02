import React from "react";
import { motion } from "framer-motion";
import { Coins, Wallet, Lock } from "lucide-react";

function formatNumber(value) {
  const safe = Math.floor(Number(value || 0));
  if (!Number.isFinite(safe)) return "0";
  return safe.toLocaleString();
}

function formatZwap(value) {
  const safe = Number(value || 0);
  if (!Number.isFinite(safe)) return "0";
  return safe.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  });
}

/* =========================
   CONVERT (MINIMAL)
========================= */
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
        <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">
          zPts Balance → ZWAP
        </p>

        <p className="mt-3 text-[22px] font-semibold text-white">
          {formatNumber(safeZpts)} → {formatZwap(estimatedZwap)}
        </p>

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

/* =========================
   CLAIM (MINIMAL)
========================= */
function ClaimCard({
  claimableZwap = 0,
  walletAddress = "",
  hasWallet = false,
  onCreateWallet,
  onPrimaryAction,
}) {
  const canClaim = Number(claimableZwap || 0) > 0 && hasWallet;

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
        <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">
          Claimable
        </p>

        <p className="mt-3 text-[24px] font-semibold text-white">
          {formatZwap(claimableZwap)} ZWAP
        </p>

        {!hasWallet ? (
          <button
            type="button"
            onClick={onCreateWallet}
            className="mt-5 inline-flex w-full items-center justify-center rounded-[22px] border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-200 transition active:scale-[0.98]"
          >
            Create Wallet
          </button>
        ) : (
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
        )}
      </div>
    </>
  );
}

/* =========================
   SWAP LOCKED (MINIMAL)
========================= */
function SwapLockedCard({ swapUnlocked = false, onPrimaryAction }) {
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.26em] text-white/45">
          Swap
        </p>

        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10">
          <Lock className="h-4 w-4 text-amber-300" />
        </div>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
        <p className="text-sm text-white/70">
          Swap is locked. Keep building.
        </p>

        <button
          type="button"
          onClick={onPrimaryAction}
          className="mt-5 inline-flex w-full items-center justify-center rounded-[22px] border border-white/10 bg-white/6 px-4 py-3 text-sm font-semibold text-white/70 transition active:scale-[0.98]"
        >
          Swap Locked
        </button>
      </div>
    </>
  );
}

/* =========================
   CORE SWITCH
========================= */
export default function SwapCoreCard({
  activeMode = "convert",
  zptsBalance = 0,
  claimableZwap = 0,
  isConversionReady = false,
  walletAddress = "",
  hasWallet = false,
  swapUnlocked = false,
  onConvert,
  onClaim,
  onCreateWallet,
  onLockedSwap,
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(52,211,153,0.12),transparent_34%),linear-gradient(180deg,rgba(9,22,19,0.98),rgba(7,13,16,0.98))] p-4">
      {activeMode === "claim" ? (
        <ClaimCard
          claimableZwap={claimableZwap}
          walletAddress={walletAddress}
          hasWallet={hasWallet}
          onCreateWallet={onCreateWallet}
          onPrimaryAction={onClaim}
        />
      ) : activeMode === "swap" ? (
        <SwapLockedCard
          swapUnlocked={swapUnlocked}
          onPrimaryAction={onLockedSwap}
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