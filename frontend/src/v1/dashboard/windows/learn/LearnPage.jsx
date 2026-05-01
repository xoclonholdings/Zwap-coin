import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Sparkles,
  Target,
} from "lucide-react";

import { learnModules } from "@/data/learnModules";
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

function CurrentModuleCard({ module }) {
  const progress = getModuleProgress(module);

  return (
    <motion.section
      className="mb-6 overflow-hidden rounded-[28px] border border-purple-400/25 bg-[radial-gradient(circle_at_18%_0%,rgba(168,85,247,0.22),transparent_36%),linear-gradient(180deg,rgba(17,20,38,0.96),rgba(7,10,20,0.98))] p-4 shadow-[0_18px_50px_rgba(168,85,247,0.16)]"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-3">
        <div className="text-[11px] font-black uppercase tracking-[0.18em] text-purple-300">
          Learn
        </div>
        <h2 className="mt-1 text-[22px] font-black tracking-[-0.05em] text-white">
          Continue Learning
        </h2>
      </div>

      <div className="rounded-[24px] border border-purple-400/20 bg-black/22 p-3">
        <div className="flex gap-4">
          <div className="flex h-[150px] w-[112px] shrink-0 items-center justify-center rounded-[18px] border border-purple-300/20 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.36),rgba(14,18,38,0.95)_58%,rgba(5,8,16,1))] shadow-[0_0_24px_rgba(168,85,247,0.16)]">
            <BookOpen className="h-10 w-10 text-purple-200" />
          </div>

          <div className="min-w-0 flex-1 pt-1">
            <div className="inline-flex rounded-full border border-purple-300/20 bg-purple-500/20 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-purple-200">
              In Progress
            </div>

            <h3 className="mt-3 text-[18px] font-black leading-5 tracking-[-0.04em] text-white">
              {module?.title || "Learn Module"}
            </h3>

            <p className="mt-2 line-clamp-3 text-sm leading-5 text-white/62">
              {module?.short_description ||
                module?.core ||
                "Continue your current learning path."}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-400 to-cyan-300"
              style={{ width: `${progress.percent}%` }}
            />
          </div>

          <div className="shrink-0 text-xs font-semibold text-white/70">
            {progress.completed} / {progress.total}
          </div>
        </div>

        <button
          type="button"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-[22px] bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 px-4 py-3 text-sm font-black tracking-[-0.03em] text-white shadow-[0_12px_28px_rgba(168,85,247,0.26)] transition active:scale-[0.98]"
        >
          Continue Lesson
          <ChevronRight size={18} strokeWidth={2.8} />
        </button>
      </div>
    </motion.section>
  );
}

function RecommendedCard({ item, index }) {
  return (
    <motion.div
      className="w-[150px] shrink-0 overflow-hidden rounded-[22px] border border-purple-300/18 bg-[linear-gradient(180deg,rgba(20,18,42,0.96),rgba(7,10,20,0.98))] shadow-[0_16px_34px_rgba(0,0,0,0.26)]"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.25) }}
    >
      <div className="h-[96px] bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.32),rgba(34,211,238,0.12)_42%,rgba(255,255,255,0.04))]">
        {item?.image || item?.coverImage || item?.cover_image ? (
          <img
            src={item.image || item.coverImage || item.cover_image}
            alt={item?.title || "Recommended"}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>

      <div className="p-3">
        <h4 className="line-clamp-2 text-sm font-black leading-4 tracking-[-0.04em] text-white">
          {item?.title || "Recommended"}
        </h4>

        <p className="mt-1 truncate text-xs text-white/48">
          {item?.author || item?.subtitle || "Based on this module"}
        </p>

        <p className="mt-2 text-xs font-bold text-purple-300">
          {item?.lessonCount || item?.lessons || item?.type || "eBook"}
        </p>
      </div>
    </motion.div>
  );
}

function RecommendedPlaceholder({ index }) {
  return (
    <motion.div
      className="w-[150px] shrink-0 rounded-[22px] border border-white/10 bg-white/[0.035] p-3"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.25) }}
    >
      <div className="h-[96px] rounded-[18px] bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.18),rgba(34,211,238,0.08)_48%,rgba(255,255,255,0.04))]" />
      <div className="mt-3 h-3 w-24 rounded-full bg-white/10" />
      <div className="mt-2 h-2 w-16 rounded-full bg-white/10" />
      <div className="mt-3 h-2 w-12 rounded-full bg-purple-400/20" />
    </motion.div>
  );
}

export default function LearnPage() {
  const navigate = useNavigate();

  const modules = useMemo(() => normalizeModules(learnModules), []);

  const orderedModules = useMemo(() => {
    return [...modules].sort((a, b) => {
      const levelDiff = getLevelRank(a?.level) - getLevelRank(b?.level);

      if (levelDiff !== 0) return levelDiff;

      return String(a?.title || "").localeCompare(String(b?.title || ""));
    });
  }, [modules]);

  const currentModule = orderedModules[0];
  const remainingModules = orderedModules.slice(1);

  const recommendedEbooks = useMemo(() => {
    const direct =
      currentModule?.recommendedEbooks ||
      currentModule?.recommended_ebooks ||
      currentModule?.recommendedBooks ||
      currentModule?.recommended_books ||
      [];

    return Array.isArray(direct) ? direct : [];
  }, [currentModule]);

  return (
    <div className="min-h-screen bg-[#050510] text-white">
      <div className="fixed left-0 right-0 top-0 z-40 border-b border-purple-500/20 bg-[#090817]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition hover:text-white active:scale-95"
            data-testid="learn-back-button"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="text-center">
            <h1 className="text-lg font-black lowercase tracking-[-0.04em] text-white/80">
              learn
            </h1>
            <p className="text-[11px] font-semibold text-white/38">
              build the person. understand value.
            </p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70">
            <BookOpen className="h-5 w-5 text-purple-300" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 pb-12 pt-[86px]">
        <motion.div
          className="mb-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2 className="text-[28px] font-black leading-8 tracking-[-0.06em] text-white">
            Learn something
          </h2>

          <div className="bg-gradient-to-r from-fuchsia-400 via-purple-400 to-cyan-300 bg-clip-text text-[34px] font-black leading-9 tracking-[-0.07em] text-transparent">
            every day.
          </div>

          <p className="mt-2 text-sm font-semibold text-white/52">
            Wellness. Self-mastery. Web3.
          </p>
        </motion.div>

        {currentModule ? <CurrentModuleCard module={currentModule} /> : null}

        <section className="mb-7">
          <div className="mb-3 flex items-end justify-between">
            <SectionHeader
              icon={Sparkles}
              title="Recommended for You"
              subtitle="Based on your current module."
              colorClass="text-purple-300"
            />

            <button
              type="button"
              className="mb-3 text-xs font-black text-purple-300"
            >
              See All
            </button>
          </div>

          <div className="flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {recommendedEbooks.length > 0
              ? recommendedEbooks.map((item, i) => (
                  <RecommendedCard
                    key={item?.id || item?.title || i}
                    item={item}
                    index={i}
                  />
                ))
              : [0, 1, 2].map((item) => (
                  <RecommendedPlaceholder key={item} index={item} />
                ))}
          </div>
        </section>

        <section className="mb-8 rounded-[26px] border border-white/10 bg-white/[0.035] p-4">
          <div className="mb-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/15">
                <Target className="h-5 w-5 text-purple-300" />
              </div>

              <div>
                <h3 className="text-sm font-black tracking-[-0.03em] text-white">
                  Today&apos;s Goal
                </h3>
                <p className="text-xs text-white/48">Complete 1 lesson</p>
              </div>
            </div>

            <button
              type="button"
              className="rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-400 px-5 py-2.5 text-sm font-black text-white shadow-[0_10px_24px_rgba(168,85,247,0.22)] transition active:scale-[0.98]"
            >
              Start
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-0 rounded-full bg-gradient-to-r from-purple-500 to-cyan-300" />
            </div>

            <div className="text-xs font-semibold text-white/54">0 / 1</div>
          </div>
        </section>

        {remainingModules.length > 0 ? (
          <section>
            <SectionHeader
              icon={BookOpen}
              title="Modules"
              subtitle="Continue through the Learn progression."
              colorClass="text-cyan-300"
            />

            <div className="space-y-3" data-testid="learn-module-list">
              {remainingModules.map((module, i) => (
                <ModuleCard
                  key={module.id || module.title || i}
                  module={module}
                  index={i + 1}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}