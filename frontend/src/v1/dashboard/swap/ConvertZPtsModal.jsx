import React from "react";
import ReactDOM from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRightLeft, Sparkles, TrendingUp, X } from "lucide-react";

function ModalShell({ children, onClose }) {
  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div
        key="convert-zpts-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm"
      >
        <div className="flex min-h-screen items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.985 }}
            className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/10 bg-[#081017] text-white shadow-[0_24px_70px_rgba(0,0,0,0.48)]"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white"
              aria-label="Close progress modal"
            >
              <X className="h-4 w-4" />
            </button>

            {children}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

export default function ConvertZPtsModal({
  open,
  onClose,
  isReady,
  progressZone,
  zptsBalance,
  onConvert,
}) {
  if (!open) return null;

  const safeZpts = Math.floor(Number(zptsBalance ?? 0));
  const helperText = isReady
    ? "Your balance is ready to unlock conversion."
    : "Keep building your balance to reach the next conversion unlock.";

  return (
    <ModalShell onClose={onClose}>
      <div className="bg-[radial-gradient(circle_at_top,rgba(52,211,153,0.16),transparent_38%),linear-gradient(180deg,rgba(10,24,22,0.98),rgba(7,15,14,0.99))] p-5">
        <div className="pr-12">
          <div className="flex items-center gap-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/25 bg-[radial-gradient(circle_at_top,rgba(52,211,153,0.22),rgba(52,211,153,0.10))] shadow-[0_0_22px_rgba(52,211,153,0.12)]">
              <TrendingUp className="h-5 w-5 text-emerald-300" />
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-emerald-200/70">
                Progress Checkpoint
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">
                Build Toward ZWAP
              </h2>
            </div>
          </div>

          <p className="mt-4 text-sm text-emerald-50/65">
            {helperText}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-[22px] border border-white/10 bg-white/5 p-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">
              Current Zone
            </p>
            <p className="mt-2 text-sm font-semibold text-emerald-300">
              {progressZone}
            </p>
          </div>

          <div className="rounded-[22px] border border-white/10 bg-white/5 p-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">
              zPts Balance
            </p>
            <p className="mt-2 text-sm font-semibold text-violet-300">
              {safeZpts.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
              <ArrowRightLeft className="h-5 w-5 text-cyan-300" />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">
                Unlock Path
              </p>
              <p className="mt-2 text-base font-semibold text-white">
                zPts progress can unlock ZWAP conversion
              </p>
              <p className="mt-1 text-sm leading-6 text-white/60">
                Build your balance, then convert once the threshold is available.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/10">
              <Sparkles className="h-5 w-5 text-violet-300" />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">
                Status
              </p>
              <p className="mt-2 text-base font-semibold text-white">
                {isReady ? "Conversion available now" : "Still building momentum"}
              </p>
              <p className="mt-1 text-sm leading-6 text-white/60">
                {isReady
                  ? "You can continue into conversion now."
                  : "Keep accumulating zPts to unlock the next conversion step."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex flex-1 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            Close
          </button>

          <button
            type="button"
            onClick={onConvert}
            disabled={!isReady}
            className={`inline-flex flex-1 items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              isReady
                ? "border border-emerald-300/30 bg-emerald-400 text-[#071511] shadow-[0_8px_0_rgba(10,84,64,0.95),0_14px_24px_rgba(52,211,153,0.22),inset_0_1px_0_rgba(255,255,255,0.35)] hover:translate-y-[1px] hover:shadow-[0_6px_0_rgba(10,84,64,0.95),0_12px_20px_rgba(52,211,153,0.20),inset_0_1px_0_rgba(255,255,255,0.35)]"
                : "cursor-not-allowed border border-white/8 bg-white/8 text-white/35"
            }`}
          >
            {isReady ? "Convert Now" : "Keep Building"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
