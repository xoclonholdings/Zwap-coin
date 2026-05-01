import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Sparkles, Target } from "lucide-react";

import { learnModules } from "./data/learnModules";
import ModuleCard from "./ModuleCard";
import SectionHeader from "./SectionHeader";

function normalizeModules(source) {
  if (Array.isArray(source)) return source;

  return [
    ...(source?.beginner || []),
    ...(source?.intermediate || []),
    ...(source?.advanced || []),
    ...(source?.expert || []),
  ];
}

function getLevelRank(level = "") {
  const safe = String(level || "").toLowerCase();

  if (safe === "beginner") return 1;
  if (safe === "intermediate") return 2;
  if (safe === "advanced") return 3;
  if (safe === "expert") return 4;

  return 99;
}

function getModuleProgress(module) {
  const completed = Number(
    module?.completedLessons ??
      module?.completed_lessons ??
      module?.lessonsCompleted ??
      module?.lessons_completed ??
      0
  );

  const total = Number(
    module?.totalLessons ??
      module?.total_lessons ??
      module?.lessonCount ??
      module?.lesson_count ??
      module?.lessons?.length ??
      1
  );

  const safeTotal = Number.isFinite(total) && total > 0 ? total : 1;
  const safeCompleted =
    Number.isFinite(completed) && completed > 0
      ? Math.min(completed, safeTotal)
      : 0;

  return {
    completed: safeCompleted,
    total: safeTotal,
    percent: Math.max(0, Math.min(100, (safeCompleted / safeTotal) * 100)),
  };
}

function CurrentModuleCard({ module, onContinue }) {
  const progress = getModuleProgress(module);

  return (
    <motion.section
      className="mb-4 overflow-hidden rounded-[24px] border border-purple-400/25 bg-[radial-gradient(circle_at_18%_0%,rgba(168,85,247,0.18),transparent_36%),linear-gradient(180deg,rgba(17,20,38,0.96),rgba(7,10,20,0.98))] p-3"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-purple-300">
        Learn
      </div>

      <h2 className="mt-1 text-[18px] font-black text-white">
        Continue Learning
      </h2>

      <div className="mt-3 rounded-[18px] border border-purple-400/20 bg-black/25 p-3">
        <div className="flex gap-3">
          <div className="flex h-[110px] w-[80px] shrink-0 items-center justify-center rounded-[14px] border border-purple-300/20">
            <div className="h-6 w-6 rounded-sm border border-purple-300/40" />
          </div>

          <div className="flex-1">
            <div className="text-[9px] font-black uppercase text-purple-200/80">
              In Progress
            </div>

            <h3 className="mt-2 text-[15px] font-black text-white">
              {module?.title || "Learn Module"}
            </h3>

            <p className="mt-1 line-clamp-2 text-xs text-white/60">
              {module?.short_description || module?.core}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-cyan-300"
              style={{ width: `${progress.percent}%` }}
            />
          </div>

          <div className="text-[10px] text-white/60">
            {progress.completed}/{progress.total}
          </div>
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="mt-3 w-full rounded-[16px] bg-gradient-to-r from-purple-500 to-cyan-400 py-2 text-xs font-black text-white transition active:scale-[0.98]"
        >
          Continue Lesson <ChevronRight size={14} className="ml-1 inline" />
        </button>
      </div>
    </motion.section>
  );
}

export default function LearnPage({ onBack }) {
  const navigate = useNavigate();
  const [lessonOpen, setLessonOpen] = useState(false);

  const modules = useMemo(() => normalizeModules(learnModules), []);

  const orderedModules = useMemo(() => {
    return [...modules].sort((a, b) => {
      const levelDiff = getLevelRank(a?.level) - getLevelRank(b?.level);
      if (levelDiff !== 0) return levelDiff;
      return String(a?.title || "").localeCompare(String(b?.title || ""));
    });
  }, [modules]);

  const currentModule = orderedModules[0];
  const remainingModules = orderedModules.slice(1, 4);

  function handleBack() {
    if (typeof onBack === "function") {
      onBack();
      return;
    }

    navigate("/v1/dashboard");
  }

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-[#050510] text-white">
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[#090817]/95 px-4 py-3">
        <button
          type="button"
          onClick={handleBack}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="text-center">
          <div className="text-[10px] uppercase text-white/40">Learn</div>
          <div className="text-sm font-bold text-white">Overview</div>
        </div>

        <div className="h-10 w-10" />
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-hidden px-3 py-3">
        {currentModule && (
          <CurrentModuleCard
            module={currentModule}
            onContinue={() => setLessonOpen(true)}
          />
        )}

        <div className="flex-1 overflow-hidden">
          <SectionHeader
            icon={Sparkles}
            title={lessonOpen ? "Current Lesson" : "Modules"}
            subtitle={lessonOpen ? "Continue your active module" : "Continue progression"}
            colorClass="text-cyan-300"
          />

          <div className="space-y-2">
            {lessonOpen && currentModule ? (
              <ModuleCard
                key={`current-${currentModule.id}`}
                module={currentModule}
                index={0}
                defaultOpen={true}
              />
            ) : (
              remainingModules.map((module, i) => (
                <ModuleCard key={module.id || i} module={module} index={i} />
              ))
            )}
          </div>
        </div>

        <div className="rounded-[20px] border border-white/10 bg-white/[0.04] p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-purple-300" />
              <div>
                <div className="text-xs font-bold">Today's Goal</div>
                <div className="text-[10px] text-white/50">
                  Complete 1 lesson
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setLessonOpen(true)}
              className="text-xs font-bold text-purple-300"
            >
              Start
            </button>
          </div>

          <div className="mt-2 h-1.5 rounded-full bg-white/10">
            <div className="h-full w-0 rounded-full bg-gradient-to-r from-purple-500 to-cyan-300" />
          </div>
        </div>
      </div>
    </div>
  );
}