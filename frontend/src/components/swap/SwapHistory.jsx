import React from "react";
import { motion } from "framer-motion";
import { ArrowRightLeft, Clock3, History } from "lucide-react";

function formatTimestamp(value) {
  if (!value) return "Just now";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recent";

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function SwapHistory({ history = [] }) {
  const hasItems = history.length > 0;

  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <div className="mb-3 flex items-center gap-2">
        <History className="h-4 w-4 text-violet-300" />
        <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
      </div>

      {hasItems ? (
        <div className="space-y-2">
          {history.slice(0, 5).map((item, index) => (
            <motion.div
              key={item.id || `${item.label}-${index}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="rounded-2xl border border-white/8 bg-black/20 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                    <ArrowRightLeft className="h-4 w-4 text-cyan-300" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-white">
                      {item.label || "Conversion activity"}
                    </p>
                    <p className="mt-1 text-xs text-white/50">
                      {item.status || "Recorded"}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-white/8 bg-white/5 px-2.5 py-1 text-[11px] text-white/45">
                  {item.type || "swap"}
                </div>
              </div>

              <div className="mt-3 flex items-center text-[11px] text-white/40">
                <Clock3 className="mr-1.5 h-3.5 w-3.5" />
                {formatTimestamp(item.timestamp)}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/6">
              <Clock3 className="h-4 w-4 text-white/55" />
            </div>

            <div>
              <p className="text-sm font-medium text-white/85">
                No recent conversions yet
              </p>
              <p className="mt-1 text-xs leading-5 text-white/45">
                Your latest swaps and reward conversions will appear here once
                you start moving value through the utility flow.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}