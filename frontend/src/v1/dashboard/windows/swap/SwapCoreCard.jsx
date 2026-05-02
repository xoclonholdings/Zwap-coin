import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Coins,
  Lock,
  Repeat2,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from "lucide-react";

function formatZwap(value) {
  const safe = Number(value || 0);
  if (!Number.isFinite(safe)) return "0";
  return safe.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  });
}

function ConvertCard({
  zptsBalance = 0,
  claimableZwap = 0,
  isConversionReady = false,
  progressZone = "Building",
  onPrimaryAction,
}) {
  const safeZpts = Math.floor(Number(zptsBalance ?? 0));
  const helperText = isConversionReady
    ? "Your balance is ready to unlock conversion."
    : "Keep building your balance to reach the next conversion unlock.";

  return (
    <>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[11px] uppercase tracking-[0.26em] text-emerald-100/45">
              Progress Checkpoint
            </p>
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
              Convert
            </div>
          </div>

          <h3 className="mt-1 text-xl font-semibold tracking-tight text-white">
            Build Toward ZWAP
          </h3>
          <p className="mt-1 text-sm text-emerald-50/60">{helperText}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10">
          <TrendingUp className="h-5 w-5 text-emerald-300" />
        </div>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">
              Current Zone
            </p>
            <p className="mt-2 text-sm font-semibold text-emerald-300">
              {progressZone}
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">
              zPts Balance
            </p>
            <p className="mt-2 text-sm font-semibold text-violet-300">
              {safeZpts.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-4 border-t border-white/10 pt-3">
          <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">
            Unlock Path
          </p>
          <p className="mt-2 text-sm font-semibold leading-5 text-white">
            zPts progress can unlock ZWAP conversion.
          </p>
          <p className="mt-1 text-xs leading-5 text-white/55">
            Build your balance, then convert once the threshold is available.
          </p>
        </div>

        <div className="mt-4 border-t border-white/10 pt-3">
          <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">
            Status
          </p>
          <p className="mt-2 text-sm font-semibold leading-5 text-white">
            {isConversionReady
              ? "Conversion available now"
              : "Still building momentum"}
          </p>
          <p className="mt-1 text-xs leading-5 text-white/55">
            {isConversionReady
              ? "You can continue into conversion now."
              : "Keep accumulating zPts to unlock the next conversion step."}
          </p>
        </div>

        <div className="mt-4 border-t border-white/10 pt-3">
          <p className="text-[11px] uppercase tracking-wide text-white/45">
            Claimable ZWAP
          </p>
          <p className="mt-2 text-[22px] font-semibold leading-none text-white">
            {formatZwap(claimableZwap)} ZWAP
          </p>
          <p className="mt-2 text-xs leading-5 text-white/45">
            Converted ZWAP must be claimed before it can move to your wallet.
          </p>
        </div>

        <motion.button
          type="button"
          onClick={onPrimaryAction}
          disabled={!isConversionReady}
          whileTap={isConversionReady ? { scale: 0.985, y: 2 } : {}}
          className={`mt-4 inline-flex w-full items-center justify-center rounded-[22px] px-4 py-3.5 text-sm font-semibold transition ${
            isConversionReady
              ? "border border-emerald-300/30 bg-emerald-400 text-[#071511] shadow-[0_10px_0_rgba(10,84,64,0.95),0_16px_28px_rgba(52,211,153,0.24),inset_0_1px_0_rgba(255,255,255,0.35)]"
              : "cursor-not-allowed border border-white/8 bg-white/8 text-white/35"
          }`}
        >
          <Coins className="mr-2 h-4 w-4" />
          {isConversionReady ? "Convert Now" : "Keep Building"}
        </motion.button>
      </div>
    </>
  );
}

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
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[11px] uppercase tracking-[0.26em] text-emerald-100/45">
              Claim
            </p>
            <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-medium text-cyan-300">
              Privy Wallet
            </div>
          </div>

          <h3 className="mt-1 text-xl font-semibold tracking-tight text-white">
            Claim ZWAP
          </h3>
          <p className="mt-1 text-sm text-emerald-50/60">
            Claiming makes your ZWAP available for wallet ownership.
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
          <Wallet className="h-5 w-5 text-cyan-300" />
        </div>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-white/45">
            Claimable
          </p>
          <p className="mt-2 text-[28px] font-semibold leading-none text-white">
            {formatZwap(claimableZwap)} ZWAP
          </p>
          <p className="mt-2 text-xs leading-5 text-white/45">
            Claimable ZWAP must be claimed to your Privy wallet before future Swap access.
          </p>
        </div>

        <div className="mt-4 border-t border-white/10 pt-3">
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-300" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-white/80">
                Wallet Status
              </p>
              <p className="mt-0.5 break-all text-[11px] text-white/55">
                {hasWallet
                  ? walletAddress || "Privy wallet ready"
                  : "Create your Privy wallet to claim ZWAP."}
              </p>
            </div>
          </div>
        </div>

        {!hasWallet ? (
          <button
            type="button"
            onClick={onCreateWallet}
            className="mt-4 inline-flex w-full items-center justify-center rounded-[20px] border border-cyan-300/20 bg-cyan-400/10 px-3 py-3 text-sm font-semibold text-cyan-200 transition active:scale-[0.98]"
          >
            <Wallet className="mr-2 h-4 w-4" />
            Create Wallet
          </button>
        ) : (
          <motion.button
            type="button"
            onClick={onPrimaryAction}
            disabled={!canClaim}
            whileTap={canClaim ? { scale: 0.985, y: 2 } : {}}
            className={`mt-4 inline-flex w-full items-center justify-center rounded-[22px] px-4 py-3.5 text-sm font-semibold transition ${
              canClaim
                ? "border border-cyan-300/30 bg-cyan-300 text-[#07111f] shadow-[0_10px_0_rgba(8,68,88,0.95),0_16px_28px_rgba(34,211,238,0.20),inset_0_1px_0_rgba(255,255,255,0.35)]"
                : "cursor-not-allowed border border-white/8 bg-white/8 text-white/35"
            }`}
          >
            <Wallet className="mr-2 h-4 w-4" />
            {canClaim ? "Claim ZWAP" : "Nothing to Claim"}
          </motion.button>
        )}
      </div>
    </>
  );
}

function SwapLockedCard({ swapUnlocked = false, onPrimaryAction }) {
  return (
    <>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[11px] uppercase tracking-[0.26em] text-emerald-100/45">
              Swap
            </p>
            <div className="rounded-xl border border-amber-400/25 bg-amber-400/10 px-2.5 py-1 text-[11px] font-medium text-amber-300">
              {swapUnlocked ? "Available" : "Locked"}
            </div>
          </div>

          <h3 className="mt-1 text-xl font-semibold tracking-tight text-white">
            {swapUnlocked ? "Swap Available" : "Swap Locked"}
          </h3>
          <p className="mt-1 text-sm text-emerald-50/60">
            Swap converts your progress into real value.
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10">
          {swapUnlocked ? (
            <Repeat2 className="h-5 w-5 text-amber-300" />
          ) : (
            <Lock className="h-5 w-5 text-amber-300" />
          )}
        </div>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-3">
        <p className="text-[11px] uppercase tracking-wide text-amber-300/80">
          Keep Building
        </p>

        <div className="mt-3 space-y-2 text-sm leading-5 text-white/80">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            Earn zPts
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            Complete daily activity
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            Stay consistent
          </div>
        </div>

        <div className="mt-4 border-t border-white/10 pt-3">
          <p className="text-xs leading-5 text-white/60">
            More ways to progress unlock over time.
          </p>
          <p className="mt-2 text-xs leading-5 text-white/60">
            Swap unlocks when the system is ready.
          </p>
          <p className="mt-2 text-xs font-semibold leading-5 text-white/80">
            You’re not ready yet. Keep going.
          </p>
        </div>

        <button
          type="button"
          onClick={onPrimaryAction}
          className="mt-4 inline-flex w-full items-center justify-center rounded-[22px] border border-white/10 bg-white/6 px-4 py-3.5 text-sm font-semibold text-white/72 transition active:scale-[0.98]"
        >
          <Lock className="mr-2 h-4 w-4" />
          {swapUnlocked ? "Continue to Swap" : "Swap Locked"}
        </button>
      </div>
    </>
  );
}

export default function SwapCoreCard({
  activeMode = "convert",
  zptsBalance = 0,
  claimableZwap = 0,
  isConversionReady = false,
  progressZone = "Building",
  walletAddress = "",
  hasWallet = false,
  swapUnlocked = false,
  onConvert,
  onClaim,
  onCreateWallet,
  onLockedSwap,
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(52,211,153,0.12),transparent_34%),linear-gradient(180deg,rgba(9,22,19,0.98),rgba(7,13,16,0.98))] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.30)]">
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
          claimableZwap={claimableZwap}
          isConversionReady={isConversionReady}
          progressZone={progressZone}
          onPrimaryAction={onConvert}
        />
      )}
    </div>
  );
}