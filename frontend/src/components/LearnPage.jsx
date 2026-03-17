import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Lightbulb,
  Loader2,
  Compass,
  Sparkles,
  GraduationCap,
} from "lucide-react";

const API = process.env.REACT_APP_BACKEND_URL + "/api";

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

function ModuleCard({ module, index, defaultOpen = false }) {
  const [expanded, setExpanded] = useState(defaultOpen);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const colors = categoryColors[module.category] || categoryColors.foundations;

  async function loadDetails() {
    if (details || loading) return;
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

  const display = details || module;

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
                      {display.core || display.content?.overview || module.short_description}
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

function SectionHeader({ icon: Icon, title, subtitle, colorClass = "text-cyan-300" }) {
  return (
    <div className="mb-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${colorClass}`} />
        <h3 className="text-white font-semibold">{title}</h3>
      </div>
      {subtitle ? <p className="text-sm text-gray-400">{subtitle}</p> : null}
    </div>
  );
}

export default function LearnPage() {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadModules() {
      try {
        const res = await fetch(`${API}/learn/modules`);
        if (!res.ok) throw new Error("Failed to load modules");
        const data = await res.json();
        if (active) setModules(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loading learn modules:", err);
        if (active) setModules([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadModules();

    return () => {
      active = false;
    };
  }, []);

  const startHereIds = useMemo(
    () => ["web3-basics", "utility-token-basics", "zwap-token-utility"],
    []
  );

  const startHereModules = modules.filter((m) => startHereIds.includes(m.id));
  const exploreModules = modules.filter((m) => !startHereIds.includes(m.id));

  return (
    <div className="min-h-screen bg-[#050510] text-white">
      <div className="fixed top-0 left-0 right-0 z-40 bg-[#0a0b1e]/95 backdrop-blur-lg border-b border-cyan-500/20">
        <div className="flex items-center px-4 py-3 max-w-lg mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mr-3 text-gray-400 hover:text-white"
            data-testid="learn-back-button"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <h1 className="text-lg font-bold text-white">Learn</h1>
          </div>
        </div>
      </div>

      <div className="pt-20 pb-10 px-4 max-w-lg mx-auto">
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2 className="text-xl font-bold mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              Crypto Made Simple
            </span>
          </h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Start with the essentials, then explore the deeper parts of Web3,
            tokens, wallets, and how ZWAP fits together.
          </p>
        </motion.div>

        <motion.div
          className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Start here first</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                New to crypto or Web3? Begin with the first three modules below.
                They cover the minimum you need before the rest of the page starts
                making deeper sense.
              </p>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading lessons...
          </div>
        ) : (
          <>
            <section className="mb-8">
              <SectionHeader
                icon={Sparkles}
                title="Start Here"
                subtitle="The beginner runway. These are the essentials."
                colorClass="text-cyan-300"
              />
              <div className="space-y-3" data-testid="learn-start-here-list">
                {startHereModules.map((module, i) => (
                  <ModuleCard
                    key={module.id}
                    module={module}
                    index={i}
                    defaultOpen={i === 0}
                  />
                ))}
              </div>
            </section>

            <section>
              <SectionHeader
                icon={Compass}
                title="Explore More"
                subtitle="Deeper context you can open whenever you're ready."
                colorClass="text-purple-300"
              />
              <div className="space-y-3" data-testid="learn-explore-more-list">
                {exploreModules.map((module, i) => (
                  <ModuleCard
                    key={module.id}
                    module={module}
                    index={i + startHereModules.length}
                  />
                ))}
              </div>
            </section>
          </>
        )}

        <motion.p
          className="text-center text-gray-600 text-xs mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Learn first. Move with confidence after.
        </motion.p>
      </div>
    </div>
  );
}