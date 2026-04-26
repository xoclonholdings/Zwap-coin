import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";

export default function ShopRewardsFeedback({ feedback, onDismiss }) {
  useEffect(() => {
    if (!feedback) return;

    const timeout = window.setTimeout(() => {
      onDismiss?.();
    }, 2200);

    return () => window.clearTimeout(timeout);
  }, [feedback, onDismiss]);

  return (
    <AnimatePresence>
      {feedback ? (
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.97 }}
          className="pointer-events-none fixed inset-x-0 bottom-24 z-[80] flex justify-center px-4"
        >
          <div className="w-full max-w-sm overflow-hidden rounded-[24px] border border-emerald-400/20 bg-[linear-gradient(150deg,rgba(16,185,129,0.18),rgba(8,16,23,0.96)_52%,rgba(34,211,238,0.12))] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-emerald-400/15 p-2 text-emerald-300">
                <CheckCircle2 className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
                  <Sparkles className="h-3.5 w-3.5" />
                  {feedback?.title || "Success"}
                </div>

                <div className="mt-1 text-base font-semibold text-white">
                  {feedback?.subtitle || "Item redeemed"}
                </div>

                {feedback?.priceLabel ? (
                  <div className="mt-1 text-sm text-white/70">
                    Redeemed for {feedback.priceLabel}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}