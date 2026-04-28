import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  BookOpen,
  Lightbulb,
  Loader2,
  Sparkles,
  WifiOff,
} from "lucide-react";
import api from "@/lib/api";
import useNetworkStatus from "@/hooks/useNetworkStatus";
import { queuePendingReward } from "@/hooks/pendingRewards";

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000";
const API = `${BACKEND_URL}/api`;

const categoryColors = {
  foundations: {
    border: "border-cyan-500/30",
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    iconBg: "bg-cyan-500/20",
    panelBg: "bg-cyan-500/10",
    panelBorder: "border-cyan-500/20",
    panelText: "text-cyan-300",
  },
  tokens: {
    border: "border-purple-500/30",
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    iconBg: "bg-purple-500/20",
    panelBg: "bg-purple-500/10",
    panelBorder: "border-purple-500/20",
    panelText: "text-purple-300",
  },
  zwap: {
    border: "border-green-500/30",
    bg: "bg-green-500/10",
    text: "text-green-400",
    iconBg: "bg-green-500/20",
    panelBg: "bg-green-500/10",
    panelBorder: "border-green-500/20",
    panelText: "text-green-300",
  },
};

export default function ModuleCard({
  module,
  index,
  defaultOpen = false,
  walletAddress,
}) {
  const { isOnline } = useNetworkStatus();

  const [expanded, setExpanded] = useState(defaultOpen);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completedReward, setCompletedReward] = useState(null);
  const [pendingSync, setPendingSync] = useState(false);

  const colors = categoryColors[module.category] || categoryColors.foundations;
  const display = details || module;

  async function loadDetails() {
    if (details || loading || !isOnline) return;

    setLoading(true);
    try {
      const res = await fetch(`${API}/learn/modules/${module.id}`);
      if (!res.ok) throw new Error("Failed to load module");
      const data = await res.json();
      setDetails(data);
    } catch (err) {
      console.error("Error loading learn module:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (defaultOpen) {
      loadDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleToggle() {
    const next = !expanded;
    setExpanded(next);

    if (next && !details) {
      await loadDetails();
    }
  }

  async function handleComplete() {
    if (completing || completedReward !== null || pendingSync) return;

    setCompleting(true);

    try {
      // Offline or not wallet-connected: save locally and sync later
      if (!walletAddress || !isOnline) {
        queuePendingReward({
          type: "learn_module_completion",
          source: "learn",
          walletAddress: walletAddress || null,
          payload: {
            moduleId: module.id,
            title: module.title,
          },
        });

        setPendingSync(true);
        setCompletedReward(0);
        return;
      }

      // Online and wallet-connected: complete immediately
      const result = await api.completeLearnModule(walletAddress, module.id);
      setCompletedReward(result?.reward ?? 0);
    } catch (err) {
      console.error("Error completing learn module:", err);

      // Fallback: save locally if live completion fails
      queuePendingReward({
        type: "learn_module_completion",
        source: "learn",
        walletAddress: walletAddress || null,
        payload: {
          moduleId: module.id,
          title: module.title,
        },
      });

      setPendingSync(true);
      setCompletedReward(0);
    } finally {
      setCompleting(false);
    }
  }

  return (
    <motion.div
      className={`rounded-2xl border ${colors.border} ${colors.bg} overflow-hidden`}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <button
        onClick={handleToggle}
        className="w-full flex items-center gap-3 p-4 text-left"
        data-testid={`learn-module-${module.id}`}
      >
        <div
          className={`w-10 h-10 rounded-xl ${colors.iconBg} flex items-center justify-center flex-shrink-0`}
        >
          <BookOpen className={`w-5 h-5 ${colors.text}`} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            {module.level} • {module.category}
          </p>
          <h3 className="text-white font-bold text-sm">{module.title}</h3>
          {!expanded && module.short_description && (
            <p className="text-gray-400 text-xs mt-1 truncate">
              {module.short_description}
            </p>
          )}
        </div>

        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {!details && loading ? (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading lesson...
                </div>
              ) : display ? (
                <>
                  <div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {display.core ||
                        display.content?.overview ||
                        module.short_description}
                    </p>
                  </div>

                  {display.analogy && (
                    <div
                      className={`p-3 rounded-xl ${colors.panelBg} border ${colors.panelBorder}`}
                    >
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Lightbulb className="w-3 h-3" />
                        Think of it this way
                      </p>
                      <p className={`${colors.panelText} text-sm italic`}>
                        "{display.analogy}"
                      </p>
                    </div>
                  )}

                  {!!display.did_you_know?.length && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                        Did You Know?
                      </p>
                      <ul className="space-y-1.5">
                        {display.did_you_know.map((fact, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-gray-400 text-sm"
                          >
                            <span className={`${colors.text} mt-0.5`}>•</span>
                            <span>{fact}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {display.content?.zwap_context && (
                    <div
                      className={`p-3 rounded-xl ${colors.panelBg} border ${colors.panelBorder}`}
                    >
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Why it matters in ZWAP
                      </p>
                      <p className={`${colors.panelText} text-sm`}>
                        {display.content.zwap_context}
                      </p>
                    </div>
                  )}

                  {!!display.content?.key_points?.length && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                        Key Points
                      </p>
                      <ul className="space-y-1.5">
                        {display.content.key_points.map((point, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-gray-400 text-sm"
                          >
                            <span className={`${colors.text} mt-0.5`}>•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      onClick={handleComplete}
                      disabled={completing || completedReward !== null || pendingSync}
                      className="w-full rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20 disabled:opacity-60"
                    >
                      {completing
                        ? "Saving..."
                        : pendingSync
                        ? "Saved Offline"
                        : completedReward !== null
                        ? "Completed"
                        : "Mark as Complete"}
                    </button>

                    {pendingSync && (
                      <p className="mt-2 text-center text-xs text-yellow-400 flex items-center justify-center gap-1">
                        <WifiOff className="w-3 h-3" />
                        Saved offline • Pending sync
                      </p>
                    )}

                    {!pendingSync && completedReward !== null && (
                      <p
                        className={`mt-2 text-center text-xs ${
                          completedReward > 0
                            ? "text-green-400"
                            : "text-gray-400"
                        }`}
                      >
                        {completedReward > 0
                          ? `+${completedReward} zPts earned`
                          : "Already completed"}
                      </p>
                    )}

                    {!walletAddress && !pendingSync && completedReward === null && (
                      <p className="mt-2 text-center text-xs text-gray-500">
                        Complete now, rewards will tally once connected.
                      </p>
                    )}
                  </div>

                  {display.quick_check?.question && (
                    <div className="pt-2 border-t border-gray-800/50">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                        Quick Check
                      </p>
                      <p className={`text-sm ${colors.text} font-medium`}>
                        Q: {display.quick_check.question}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        A: {display.quick_check.answer}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-red-400">
                  Could not load this lesson.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
