import React from "react";
import { motion } from "framer-motion";
import { Clock3, TrendingUp, Wallet } from "lucide-react";

function getProgressCopy({
  progressZone,
  isConversionReady,
  hasInternalZwapToClaim,
  hasWalletZwap,
}) {
  if (hasWalletZwap) {
    return {
      title: "Ready to Swap",
      body: "Your wallet holds ZWAP, so swap can now be activated from the main conversion flow.",
      cta: "Wallet Ready",
      tone: "emerald",
    };
  }

  if (hasInternalZwapToClaim) {
    return {
      title: "Claim to Wallet",
      body: "You have ZWAP available in-app. Claim it to your wallet before activating a swap.",
      cta: "Open Convert",
      tone: "cyan",
    };
  }

  if (isConversionReady) {
    return {
      title: "Conversion Ready",
      body: "Your zPts balance has reached the next conversion threshold. Convert to ZWAP to keep progressing.",
      cta: "Convert zPts",
      tone: "emerald",
    };
  }

  return {
    title: "Progress Zone",
    body: `You are currently in the ${progressZone} zone. Keep building zPts to unlock your next ZWAP conversion.`,
    cta: "View Progress",
    tone: "neutral",
  };
}

function getToneClasses(tone) {
  switch (tone) {
    case "emerald":
      return {
        iconWrap:
          "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
        chip:
          "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
        button:
          "border-emerald-300/30 bg-emerald-400 text-[#071511] shadow-[0_8px_0_rgba(10,84,64,0.95),0_14px_24px_rgba(52,211,153,0.22),inset_0_1px_0_rgba(255,255,255,0.35)] hover:translate-y-[1px] hover:shadow-[0_6px_0_rgba(10,84,64,0.95),0_12px_20px_rgba(52,211,153,0.20),inset_0_1px_0_rgba(255,255,255,0.35)]",
      };
    case "cyan":
      return {
        iconWrap: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
        chip: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
        button:
          "border-cyan-300/30 bg-cyan-400 text-[#07131a] shadow-[0_8px_0_rgba(8,95,111,0.95),0_14px_24px_rgba(34,211,238,0.22),inset_0_1px_0_rgba(255,255,255,0.35)] hover:translate-y-[1px] hover:shadow-[0_6px_0_rgba(8,95,111,0.95),0_12px_20px_rgba(34,211,238,0.20),inset_0_1px_0_rgba(255,255,255,0.35)]",
      };
    default:
      return {
        iconWrap: "border-white/10 bg-white/6 text-white/70",
        chip: "border-white/10 bg-white/6 text-white/70",
        button:
          "border-white/10 bg-white/8 text-white hover:bg-white/12",
      };
  }
}

export default function SwapHistory({
  progressZone,
  isConversionReady,
  hasInternalZwapToClaim,
  hasWalletZwap,
  walletZwapBalance = 0,
  internalZwapBalance = 0,
  zptsBalance = 0,
  onOpenConvertModal,
}) {
  const progress = getProgressCopy({
    progressZone,
    isConversionReady,
    hasInternalZwapToClaim,
    hasWalletZwap,
  });

  const tone = getToneClasses(progress.tone);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(52,211,153,0.14),transparent_35%),linear-gradient(180deg,rgba(11,24,20,0.96),rgba(7,15,13,0.98))] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.35)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[11px] uppercase tracking-[0.28em] text-emerald-200/70">
              Progress
            </p>

            <div
              className={`rounded-xl border px-2.5 py-1 text-[11px] font-medium ${tone.chip}`}
            >
              {progressZone}
            </div>
          </div>

          <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">
            {progress.title}
          </h3>

          <p className="mt-1 text-sm text-emerald-50/65">
            {progress.body}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${tone.iconWrap}`}
        >
          {hasWalletZwap ? (
            <Wallet className="h-5 w-5" />
          ) : (
            <TrendingUp className="h-5 w-5" />
          )}
        </div>
      </div>

      <div className="mt-4 rounded-[22px] border border-white/10 bg-white/5 p-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-2xl border border-white/8 bg-black/20 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-white/40">
              zPts
            </p>
            <p className="mt-1 text-sm font-medium text-white/85">
              {Math.floor(Number(zptsBalance || 0))}
            </p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-black/20 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-white/40">
              In App
            </p>
            <p className="mt-1 text-sm font-medium text-white/85">
              {Number(internalZwapBalance || 0).toFixed(2)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-black/20 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-white/40">
              Wallet
            </p>
            <p className="mt-1 text-sm font-medium text-white/85">
              {Number(walletZwapBalance || 0).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-black/20 px-3 py-3">
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-white/55" />
            <div>
              <p className="text-sm font-medium text-white">
                Current Zone
              </p>
              <p className="text-[11px] text-white/45">
                {progressZone}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenConvertModal}
            className={`inline-flex items-center justify-center rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${tone.button}`}
          >
            {progress.cta}
          </button>
        </div>
      </div>
    </motion.div>
  );
}