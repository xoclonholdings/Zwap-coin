import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  BookOpen,
  Lightbulb,
  Loader2,
  Sparkles,
} from "lucide-react";

import { useApp } from "@/app/AppProvider";
import api from "@/lib/api";
import { queuePendingReward } from "@/hooks/pendingRewards";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";
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

function getUserId(user, authUser) {
  return (
    user?.id ||
    user?._id ||
    user?.userId ||
    user?.user_id ||
    user?.email ||
    authUser?.email ||
    ""
  );
}

function getIsOnline() {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
}

function shouldLoadRemoteDetails(module) {
  return Boolean(
    module?.loadRemoteDetails ||
      module?.load_remote_details ||
      module?.remoteDetails ||
      module?.remote_details
  );
}

export default function ModuleCard({ module, index, defaultOpen = false }) {
  const { user, authUser } = useApp();

  const [expanded, setExpanded] = useState(defaultOpen);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completedReward, setCompletedReward] = useState(null);
  const [pendingSync, setPendingSync] = useState(false);

  const isOnline = getIsOnline();
  const userId = getUserId(user, authUser);
  const safeModule = module || {};
  const colors =
    categoryColors[safeModule.category] || categoryColors.foundations;
  const display = details || safeModule;

  async function loadDetails() {
    if (!shouldLoadRemoteDetails(safeModule)) return;
    if (details || loading || !isOnline || !safeModule.id) return;

    setLoading(true);

    try {
      const res = await fetch(`${API}/learn/modules/${safeModule.id}`);

      if (!res.ok) {
        setDetails(null);
        return;
      }

      const data = await res.json();
      setDetails(data);
    } catch (err) {
      console.log("Learn module details unavailable:", err?.message || err);
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
      if (!userId || !isOnline) {
        queuePendingReward({
          type: "learn_module_completion",
          source: "learn",
          userId: userId || null,
          payload: {
            moduleId: safeModule.id,
            title: safeModule.title,
          },
        });

        setPendingSync(true);
        setCompletedReward(0);
        return;
      }

      const result = await api.completeLearnModule(userId, safeModule.id);
      setCompletedReward(result?.reward ?? 0);
    } catch (err) {
      console.error("Error completing learn module:", err);

      queuePendingReward({
        type: "learn_module_completion",
        source: "learn",
        userId: userId || null,
        payload: {
          moduleId: safeModule.id,
          title: safeModule.title,
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
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center gap-3 p-4 text-left"
        data-testid={`learn-module-${safeModule.id}`}
      >
        <div
          className={`w-10 h-10 rounded-xl ${colors.iconBg} flex items-center justify-center flex-shrink-0`}
        >
          <BookOpen className={`w-5 h-5 ${colors.text}`} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            {safeModule.level} • {safeModule.category}
          </p>

          <h3 className="text-white font-bold text-sm">
            {safeModule.title || "Learn Module"}
          </h3>

          {!expanded && safeModule.short_description && (
            <p className="text-gray-400 text-xs mt-1 truncate">
              {safeModule.short_description}
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
            initial={{ height: 0, opacity: 1 }}
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
                        safeModule.short_description}
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
                        &quot;{display.analogy}&quot;
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
                        Why it matters in ZWAP!
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
                      type="button"
                      onClick={handleComplete}
                      disabled={
                        completing || completedReward !== null || pendingSync
                      }
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
                      <p className="mt-2 text-center text-xs text-yellow-400">
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

                    {!userId && !pendingSync && completedReward === null && (
                      <p className="mt-2 text-center text-xs text-gray-500">
                        Sign in to save Learn progress.
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