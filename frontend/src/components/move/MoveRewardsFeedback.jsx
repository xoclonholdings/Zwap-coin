import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Coins, Sparkles } from "lucide-react";

export default function MoveRewardsFeedback({
  reward = null,
  milestone = null,
  streak = null,
  onDismiss,
  autoCloseMs = 2200,
}) {
  const isOpen = Boolean(reward || milestone || streak);

  useEffect(() => {
    if (!isOpen || !onDismiss) return;

    const timer = setTimeout(() => {
      onDismiss();
    }, autoCloseMs);

    return () => clearTimeout(timer);
  }, [isOpen, onDismiss, autoCloseMs]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.96 }}
          transition={{ duration: 0.22 }}
          className="pointer-events-none fixed right-4 top-20 z-[70] flex w-[min(92vw,360px)] justify-end"
        >
          <div className="pointer-events-auto w-full rounded-[22px] border border-cyan-400/18 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_34%),linear-gradient(180deg,rgba(10,18,24,0.96),rgba(8,12,18,0.98))] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            {reward ? (
              <div className="mb-3 flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                  <Coins className="h-5 w-5 text-cyan-300" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-200/70">
                    Reward Added
                  </p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
                    +{Number(reward.amount || 0).toFixed(2)} {reward.currency || "ZWAP"}
                  </p>
                  {reward.message ? (
                    <p className="mt-1 text-sm text-white/55">
                      {reward.message}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {milestone ? (
              <div className={`${reward ? "mt-2 border-t border-white/8 pt-3" : ""}`}>
                <div className="mb-2 flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/10">
                    <Sparkles className="h-5 w-5 text-violet-300" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-violet-200/70">
                      Milestone
                    </p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      {milestone.title || "Step threshold reached"}
                    </p>
                    <p className="mt-1 text-sm text-white/55">
                      {milestone.message ||
                        `${Number(milestone.steps || 0).toLocaleString()} steps hit.`}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {streak ? (
              <div
                className={`${
                  reward || milestone ? "mt-2 border-t border-white/8 pt-3" : ""
                }`}
              >
                <div className="rounded-2xl border border-orange-400/18 bg-orange-400/10 px-3 py-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-orange-200/70">
                    Streak Pulse
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {streak.days} day streak
                  </p>
                  <p className="mt-1 text-sm text-white/55">
                    {streak.message || "Momentum is building. Keep moving tomorrow."}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}