import React from "react";
import { motion } from "framer-motion";
import { ArrowRightLeft, TrendingUp } from "lucide-react";

const ZPTS_STEP = 1000;

function clamp(value, min = 0, max = 100) {
  return Math.min(Math.max(value, min), max);
}

function getProgressData(zptsBalance) {
  const safeBalance = Math.max(0, Math.floor(Number(zptsBalance || 0)));
  const cappedBalance = Math.min(safeBalance, ZPTS_STEP);
  const progressPercent = clamp((cappedBalance / ZPTS_STEP) * 100);
  const remainingZpts = Math.max(ZPTS_STEP - cappedBalance, 0);

  let progressZone = "Starting";
  if (progressPercent >= 100) progressZone = "Conversion Ready";
  else if (progressPercent >= 95) progressZone = "Near Conversion";
  else if (progressPercent >= 70) progressZone = "Approaching";
  else if (progressPercent >= 30) progressZone = "Building";

  let progressHint = `${cappedBalance.toLocaleString()} zPts toward next ZWAP`;

  if (progressPercent >= 100) {
    progressHint = "Conversion available now";
  } else if (progressPercent >= 85) {
    progressHint = "Next unlock nearing";
  } else if (remainingZpts > 0) {
    progressHint = `${remainingZpts.toLocaleString()} zPts left to unlock`;
  }

  return {
    progressPercent,
    progressZone,
    progressHint,
  };
}

function getEstimatedUnlockValue(zptsBalance) {
  const safeBalance = Math.max(0, Math.floor(Number(zptsBalance || 0)));
  const estimated = safeBalance / ZPTS_STEP;

  if (!Number.isFinite(estimated) || estimated <= 0) return "0.00";

  return estimated.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export default function SwapHistory({
  zptsBalance = 0,
  isConversionReady = false,
  onOpenConvertModal,
}) {
  const { progressPercent, progressZone, progressHint } =
    getProgressData(zptsBalance);

  const estimatedUnlockValue = getEstimatedUnlockValue(zptsBalance);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(52,211,153,0.14),transparent_35%),linear-gradient(180deg,rgba(11,24,20,0.96),rgba(7,15,13,0.98))] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.35)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-emerald-200/70">
            Progress
          </p>

          <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">
            {progressZone}
          </h3>

          <p className="mt-1 text-sm text-emerald-50/65">
            Your next unlock builds as your zPts balance grows.
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/25 bg-[radial-gradient(circle_at_top,rgba(52,211,153,0.22),rgba(52,211,153,0.10))] shadow-[0_0_20px_rgba(52,211,153,0.12)]">
          <TrendingUp className="h-5 w-5 text-emerald-300" />
        </div>
      </div>

      <div className="mt-4 rounded-[22px] border border-white/10 bg-white/5 p-3">
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-emerald-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <p className="mt-3 text-xs text-white/60">{progressHint}</p>
      </div>

      <div className="mt-3 rounded-[22px] border border-white/10 bg-black/20 p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">
              Convert zPts to ZWAP
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              Estimated unlock value
            </p>
            <p className="mt-1 text-xs text-white/55">
              Conversion becomes available once your build reaches the next threshold.
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10">
            <ArrowRightLeft className="h-4 w-4 text-emerald-300" />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-white/40">
              zPts
            </p>
            <p className="mt-1 text-sm font-medium text-white/85">
              {Math.floor(Number(zptsBalance || 0)).toLocaleString()}
            </p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-white/40">
              Est. ZWAP
            </p>
            <p className="mt-1 text-sm font-medium text-white/85">
              {estimatedUnlockValue}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenConvertModal}
          className={`mt-3 inline-flex w-full items-center justify-center rounded-[20px] px-4 py-3 text-sm font-semibold transition ${
            isConversionReady
              ? "border border-emerald-300/30 bg-emerald-400 text-[#071511] shadow-[0_8px_0_rgba(10,84,64,0.95),0_14px_24px_rgba(52,211,153,0.22),inset_0_1px_0_rgba(255,255,255,0.35)] hover:translate-y-[1px] hover:shadow-[0_6px_0_rgba(10,84,64,0.95),0_12px_20px_rgba(52,211,153,0.20),inset_0_1px_0_rgba(255,255,255,0.35)]"
              : "border border-white/10 bg-white/8 text-white/80 hover:bg-white/12"
          }`}
        >
          <ArrowRightLeft className="mr-2 h-4 w-4" />
          {isConversionReady ? "Convert Now" : "Keep Building"}
        </button>
      </div>
    </motion.div>
  );
}