import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, ChevronRight } from "lucide-react";

import { learnModules } from "./data/learnModules";

const LESSON_COUNT = 3;

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

function getModuleImage(module) {
  return module?.image || module?.coverImage || module?.cover_image || "";
}

function getRecommendedEbooks(module) {
  const direct =
    module?.recommendedEbooks ||
    module?.recommended_ebooks ||
    module?.recommendedBooks ||
    module?.recommended_books ||
    [];

  return Array.isArray(direct) ? direct.slice(0, 3) : [];
}

function buildLessons(module) {
  const source = Array.isArray(module?.lessons) ? module.lessons.slice(0, 3) : [];

  if (source.length >= LESSON_COUNT) {
    return source.map((lesson, index) => ({
      id: lesson?.id || `${module?.id || "module"}-lesson-${index + 1}`,
      title: lesson?.title || `Lesson ${index + 1}`,
      description:
        lesson?.description ||
        lesson?.short_description ||
        lesson?.summary ||
        module?.short_description ||
        module?.core ||
        "Continue this lesson.",
    }));
  }

  return [0, 1, 2].map((_, index) => ({
    id: `${module?.id || "module"}-lesson-${index + 1}`,
    title:
      index === 0
        ? "Concept"
        : index === 1
        ? "Application"
        : "Lock In",
    description:
      index === 0
        ? module?.short_description || module?.core || "Learn the core idea."
        : index === 1
        ? "Connect the idea to your daily action."
        : "Complete the lesson and move forward.",
  }));
}

function LessonIndicators({ lessonIndex }) {
  return (
    <div className="mt-2 flex gap-2">
      {[0, 1, 2].map((item) => {
        const completed = item < lessonIndex;
        const active = item === lessonIndex;

        return (
          <div
            key={item}
            className={[
              "h-7 flex-1 rounded-xl border transition",
              completed
                ? "border-cyan-300/35 bg-cyan-300/20"
                : active
                ? "border-purple-300/40 bg-purple-400/18"
                : "border-white/10 bg-white/[0.035]",
            ].join(" ")}
          />
        );
      })}
    </div>
  );
}

function ContinueLearningCard({ module, lessonIndex, onContinue }) {
  const image = getModuleImage(module);
  const progressPercent = Math.max(
    0,
    Math.min(100, (lessonIndex / LESSON_COUNT) * 100)
  );

  return (
    <motion.section
      className="shrink-0 overflow-hidden rounded-[24px] border border-purple-400/25 bg-[radial-gradient(circle_at_18%_0%,rgba(168,85,247,0.18),transparent_36%),linear-gradient(180deg,rgba(17,20,38,0.96),rgba(7,10,20,0.98))] p-3"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-purple-300">
        Learn
      </div>

      <h2 className="mt-1 text-[18px] font-black tracking-[-0.04em] text-white">
        Continue Learning
      </h2>

      <div className="mt-3 rounded-[18px] border border-purple-400/20 bg-black/25 p-3">
        <div className="flex gap-3">
          <div className="flex h-[92px] w-[74px] shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-purple-300/20 bg-white/[0.035]">
            {image ? (
              <img
                src={image}
                alt={module?.title || "Module"}
                className="h-full w-full object-cover"
              />
            ) : (
              <BookOpen className="h-7 w-7 text-purple-200/70" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-[9px] font-black uppercase tracking-[0.12em] text-purple-200/80">
              In Progress
            </div>

            <h3 className="mt-2 line-clamp-1 text-[15px] font-black tracking-[-0.04em] text-white">
              {module?.title || "Learn Module"}
            </h3>

            <p className="mt-1 line-clamp-2 text-xs leading-4 text-white/60">
              {module?.short_description || module?.core || "Continue this module."}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="text-[10px] text-white/60">
            {lessonIndex}/{LESSON_COUNT}
          </div>
        </div>

        <LessonIndicators lessonIndex={lessonIndex} />

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

function LessonsList({ lessons, lessonIndex }) {
  return (
    <section className="shrink-0">
      <div className="mb-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-200/80">
        Lessons
      </div>

      <div className="grid grid-cols-3 gap-2">
        {lessons.map((lesson, index) => {
          const completed = index < lessonIndex;
          const active = index === lessonIndex;

          return (
            <div
              key={lesson.id}
              className={[
                "min-h-[58px] rounded-2xl border p-2",
                completed
                  ? "border-cyan-300/30 bg-cyan-400/12"
                  : active
                  ? "border-purple-300/35 bg-purple-400/14"
                  : "border-white/10 bg-white/[0.035]",
              ].join(" ")}
            >
              <div className="text-[9px] font-black uppercase tracking-[0.12em] text-white/42">
                Lesson {index + 1}
              </div>

              <div className="mt-1 line-clamp-1 text-[11px] font-black tracking-[-0.03em] text-white">
                {lesson.title}
              </div>

              <p className="mt-0.5 line-clamp-1 text-[10px] leading-3 text-white/45">
                {lesson.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function RecommendedEbookCard({ item, index }) {
  const image = getModuleImage(item);

  return (
    <div className="w-[31%] min-w-0 shrink-0 overflow-hidden rounded-[18px] border border-purple-300/18 bg-[linear-gradient(180deg,rgba(20,18,42,0.96),rgba(7,10,20,0.98))]">
      <div className="h-[76px] bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.28),rgba(34,211,238,0.12)_42%,rgba(255,255,255,0.04))]">
        {image ? (
          <img
            src={image}
            alt={item?.title || `Recommended ${index + 1}`}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>

      <div className="p-2">
        <div className="line-clamp-2 text-[11px] font-black leading-3 tracking-[-0.03em] text-white">
          {item?.title || "Recommended"}
        </div>

        <div className="mt-1 truncate text-[9px] text-white/45">
          {item?.author || item?.subtitle || "Based on this module"}
        </div>
      </div>
    </div>
  );
}

function RecommendedPlaceholder({ index }) {
  return (
    <div className="w-[31%] min-w-0 shrink-0 rounded-[18px] border border-white/10 bg-white/[0.035] p-2">
      <div className="h-[76px] rounded-[14px] bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.18),rgba(34,211,238,0.08)_48%,rgba(255,255,255,0.04))]" />
      <div className="mt-2 h-2 w-16 rounded-full bg-white/10" />
      <div className="mt-1.5 h-2 w-11 rounded-full bg-white/10" />
    </div>
  );
}

export default function LearnPage({ onBack }) {
  const navigate = useNavigate();
  const [moduleIndex, setModuleIndex] = useState(0);
  const [lessonIndex, setLessonIndex] = useState(0);

  const modules = useMemo(() => normalizeModules(learnModules), []);

  const orderedModules = useMemo(() => {
    return [...modules].sort((a, b) => {
      const levelDiff = getLevelRank(a?.level) - getLevelRank(b?.level);
      if (levelDiff !== 0) return levelDiff;
      return String(a?.title || "").localeCompare(String(b?.title || ""));
    });
  }, [modules]);

  const currentModule = orderedModules[moduleIndex] || orderedModules[0];
  const lessons = useMemo(() => buildLessons(currentModule), [currentModule]);
  const recommendedEbooks = useMemo(
    () => getRecommendedEbooks(currentModule),
    [currentModule]
  );

  function handleBack() {
    if (typeof onBack === "function") {
      onBack();
      return;
    }

    navigate("/v1/dashboard");
  }

  function handleContinueLesson() {
    if (lessonIndex < LESSON_COUNT - 1) {
      setLessonIndex((current) => current + 1);
      return;
    }

    setLessonIndex(0);
    setModuleIndex((current) => {
      const next = current + 1;
      return next >= orderedModules.length ? current : next;
    });
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
          <div className="text-[13px] font-black uppercase tracking-[0.22em] text-white/70">
            Learn
          </div>
          <div className="text-sm font-black tracking-[-0.03em] text-white">
            Overview
          </div>
        </div>

        <div className="h-10 w-10" />
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-hidden px-3 py-3">
        {currentModule ? (
          <ContinueLearningCard
            module={currentModule}
            lessonIndex={lessonIndex}
            onContinue={handleContinueLesson}
          />
        ) : null}

        <LessonsList lessons={lessons} lessonIndex={lessonIndex} />

        <section className="min-h-0 flex-1 overflow-hidden">
          <div className="mb-2 flex items-end justify-between">
            <div>
              <div className="text-[13px] font-black tracking-[-0.03em] text-white">
                Recommended for you
              </div>
              <div className="text-[10px] text-white/45">
                Based on your current module.
              </div>
            </div>

            <button
              type="button"
              className="text-[10px] font-black text-purple-300"
            >
              See All
            </button>
          </div>

          <div className="flex gap-2 overflow-x-hidden">
            {recommendedEbooks.length > 0
              ? recommendedEbooks.map((item, index) => (
                  <RecommendedEbookCard
                    key={item?.id || item?.title || index}
                    item={item}
                    index={index}
                  />
                ))
              : [0, 1, 2].map((item) => (
                  <RecommendedPlaceholder key={item} index={item} />
                ))}
          </div>
        </section>
      </div>
    </div>
  );
}