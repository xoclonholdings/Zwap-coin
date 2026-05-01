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

export default function ModuleCard({
  module,
  index,
  defaultOpen = false,
}) {
  const { user, authUser } = useApp();

  const [expanded, setExpanded] = useState(defaultOpen);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completedReward, setCompletedReward] = useState(null);

  const userId = getUserId(user, authUser);
  const colors = categoryColors[module.category] || categoryColors.foundations;
  const display = details || module;

  async function loadDetails() {
    if (details || loading || !module?.id) return;

    setLoading(true);

    try {
      const res = await fetch(`${API}/learn/modules/${module.id}`);
      if (!res.ok) return;

      const data = await res.json();
      setDetails(data);
    } catch (err) {
      console.log("Learn module details unavailable:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (defaultOpen) {
      loadDetails();
    }
  }, []);

  async function handleToggle() {
    const next = !expanded;
    setExpanded(next);

    if (next && !details) {
      await loadDetails();
    }
  }

  async function handleComplete() {
    if (completing || completedReward !== null) return;

    setCompleting(true);

    try {
      const result = await api.completeLearnModule(userId, module.id);
      setCompletedReward(result?.reward ?? 0);
    } catch (err) {
      console.error("Error completing learn module:", err);
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
      >
        <div
          className={`w-10 h-10 rounded-xl ${colors.iconBg} flex items-center justify-center`}
        >
          <BookOpen className={`w-5 h-5 ${colors.text}`} />
        </div>

        <div className="flex-1">
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            {module.level} • {module.category}
          </p>

          <h3 className="text-white font-bold text-sm">
            {module.title}
          </h3>

          {!expanded && module.short_description && (
            <p className="text-gray-400 text-xs mt-1 truncate">
              {module.short_description}
            </p>
          )}
        </div>

        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {!details && loading ? (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading lesson...
                </div>
              ) : (
                <>
                  <p className="text-gray-300 text-sm">
                    {display.core ||
                      display.content?.overview ||
                      module.short_description}
                  </p>

                  <button
                    onClick={handleComplete}
                    disabled={completing || completedReward !== null}
                    className="w-full rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-300"
                  >
                    {completing
                      ? "Saving..."
                      : completedReward !== null
                      ? "Completed"
                      : "Mark as Complete"}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}