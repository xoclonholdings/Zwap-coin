import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Info,
  Sparkles,
  X,
} from "lucide-react";

const FEEDBACK_STYLES = {
  success: {
    icon: CheckCircle2,
    iconClass:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    cardClass:
      "border-emerald-400/20 bg-[linear-gradient(180deg,rgba(10,39,30,0.96),rgba(7,22,17,0.98))]",
    eyebrow: "Completed",
  },
  error: {
    icon: AlertTriangle,
    iconClass:
      "border-rose-400/20 bg-rose-400/10 text-rose-300",
    cardClass:
      "border-rose-400/20 bg-[linear-gradient(180deg,rgba(44,15,22,0.96),rgba(24,10,14,0.98))]",
    eyebrow: "Issue",
  },
  pending: {
    icon: Clock3,
    iconClass:
      "border-amber-400/20 bg-amber-400/10 text-amber-300",
    cardClass:
      "border-amber-400/20 bg-[linear-gradient(180deg,rgba(43,31,12,0.96),rgba(22,17,8,0.98))]",
    eyebrow: "In Progress",
  },
  route: {
    icon: Sparkles,
    iconClass:
      "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    cardClass:
      "border-cyan-400/20 bg-[linear-gradient(180deg,rgba(11,34,45,0.96),rgba(8,18,24,0.98))]",
    eyebrow: "Route Ready",
  },
  info: {
    icon: Info,
    iconClass:
      "border-white/10 bg-white/6 text-white/75",
    cardClass:
      "border-white/10 bg-[linear-gradient(180deg,rgba(24,24,30,0.96),rgba(14,14,18,0.98))]",
    eyebrow: "Update",
  },
};

export default function SwapFeedback({ feedback, onClose }) {
  return (
    <AnimatePresence>
      {feedback ? (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.985 }}
          className={`rounded-[24px] border p-4 shadow-[0_20px_45px_rgba(0,0,0,0.28)] ${
            (FEEDBACK_STYLES[feedback.type] || FEEDBACK_STYLES.info).cardClass
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${
                  (FEEDBACK_STYLES[feedback.type] || FEEDBACK_STYLES.info)
                    .iconClass
                }`}
              >
                {(() => {
                  const Icon =
                    (FEEDBACK_STYLES[feedback.type] || FEEDBACK_STYLES.info)
                      .icon;
                  return <Icon className="h-5 w-5" />;
                })()}
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">
                  {
                    (FEEDBACK_STYLES[feedback.type] || FEEDBACK_STYLES.info)
                      .eyebrow
                  }
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {feedback.title}
                </p>
                <p className="mt-1 text-sm leading-5 text-white/60">
                  {feedback.message}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/55 transition hover:bg-white/10 hover:text-white"
              aria-label="Close feedback"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
