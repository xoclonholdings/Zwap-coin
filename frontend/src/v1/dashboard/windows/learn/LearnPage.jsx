import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, ChevronRight } from "lucide-react";

import { learnModules } from "./data/learnModules";
import { getArchivedRecommendedEbooks } from "./data/ebooks";

const LESSON_COUNT = 3;
const DEFAULT_ARCHIVE_MONTH = 5;
const DEFAULT_ARCHIVE_PART = 2;

const LEARN_PROGRESSION_ORDER = [
  "movement-benefits",
  "breaking-a-sweat",
  "focus-discipline",
  "mental-patterns",
  "self-awareness",
  "ai-fears-reality",
  "personal-conduct",
  "presence-focus",
  "belief-outcome",
  "value-wealth-thinking",
  "financial-awareness",
  "ownership-control",
];

function normalizeModules(source) {
  if (Array.isArray(source)) return source;

  return [
    ...(source?.beginner || []),
    ...(source?.intermediate || []),
    ...(source?.advanced || []),
    ...(source?.expert || []),
  ];
}

function orderModules(modules) {
  const map = new Map(modules.map((module) => [module.id, module]));
  const ordered = LEARN_PROGRESSION_ORDER.map((id) => map.get(id)).filter(Boolean);
  const orderedIds = new Set(ordered.map((module) => module.id));
  const remaining = modules.filter((module) => !orderedIds.has(module.id));

  return [...ordered, ...remaining];
}

function getModuleImage(module) {
  return module?.image || module?.coverImage || module?.cover_image || "";
}

function getRecommendedEbookIds(module) {
  const direct =
    module?.recommendedEbookIds ||
    module?.recommended_ebook_ids ||
    module?.recommendedEbooks ||
    module?.recommended_ebooks ||
    module?.recommendedBooks ||
    module?.recommended_books ||
    [];

  if (!Array.isArray(direct)) return [];

  return direct
    .map((item) => (typeof item === "string" ? item : item?.id))
    .filter(Boolean);
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

function LessonIndicators({ lessonIndex, onSelectLesson }) {
  return (
    <div className="mt-3 grid grid-cols-3 gap-2">
      {[0, 1, 2].map((item) => {
        const active = item === lessonIndex;

        return (
          <button
            key={item}
            type="button"
            onClick={() => onSelectLesson(item)}
            className={[
              "h-8 rounded-xl border text-[10px] font-black uppercase tracking-[0.12em] transition active:scale-[0.98]",
              active
                ? "border-cyan-300/45 bg-cyan-400/18 text-cyan-100 shadow-[0_0_14px_rgba(34,211,238,0.14)]"
                : "border-white/10 bg-white/[0.035] text-white/34",
            ].join(" ")}
          >
            {item + 1}
          </button>
        );
      })}
    </div>
  );
}

function ContinueLearningCard({
  module,
  lesson,
  lessonIndex,
  onSelectLesson,
  onNextModule,
}) {
  const image = getModuleImage(module);
  const progressPercent = Math.max(
    0,
    Math.min(100, ((lessonIndex + 1) / LESSON_COUNT) * 100)
  );

  return (
    <motion.section
      className="shrink-0 overflow-hidden rounded-[26px] border border-cyan-300/16 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.12),transparent_35%),radial-gradient(circle_at_86%_22%,rgba(168,85,247,0.18),transparent_36%),linear-gradient(180deg,rgba(10,18,30,0.96),rgba(5,8,17,0.98))] p-3 shadow-[0_18px_46px_rgba(0,0,0,0.34)]"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300/70">
        Module
      </div>

      <h2 className="mt-1 line-clamp-1 text-[20px] font-black tracking-[-0.05em] text-white">
        {module?.title || "Learn Module"}
      </h2>

      <div className="mt-3 rounded-[20px] border border-white/10 bg-black/24 p-3">
        <div className="flex gap-3">
          <div className="flex h-[96px] w-[76px] shrink-0 items-center justify-center overflow-hidden rounded-[16px] border border-cyan-300/14 bg-white/[0.035] shadow-[0_0_18px_rgba(34,211,238,0.08)]">
            {image ? (
              <img
                src={image}
                alt={module?.title || "Module"}
                className="h-full w-full object-cover"
              />
            ) : (
              <BookOpen className="h-7 w-7 text-cyan-200/70" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-[9px] font-black uppercase tracking-[0.12em] text-purple-200/75">
              Lesson {lessonIndex + 1}
            </div>

            <h3 className="mt-2 line-clamp-1 text-[15px] font-black tracking-[-0.04em] text-white">
              {lesson?.title || "Lesson"}
            </h3>

            <p className="mt-1 line-clamp-3 text-xs leading-4 text-white/58">
              {lesson?.description ||
                module?.short_description ||
                module?.core ||
                "Continue this lesson."}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-purple-400 to-fuchsia-400"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="text-[10px] font-semibold text-white/58">
            {lessonIndex + 1}/{LESSON_COUNT}
          </div>
        </div>

        <LessonIndicators
          lessonIndex={lessonIndex}
          onSelectLesson={onSelectLesson}
        />

        <button
          type="button"
          onClick={onNextModule}
          className="mt-3 flex w-full items-center justify-center gap-1 rounded-[17px] bg-gradient-to-r from-cyan-400 via-purple-500 to-fuchsia-500 py-2.5 text-xs font-black text-white shadow-[0_12px_26px_rgba(168,85,247,0.22)] transition active:scale-[0.98]"
        >
          Next Module <ChevronRight size={14} />
        </button>
      </div>
    </motion.section>
  );
}

function LessonsList({ lessons, lessonIndex, onSelectLesson }) {
  return (
    <section className="shrink-0">
      <div className="mb-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-200/80">
        Lessons
      </div>

      <div className="grid grid-cols-3 gap-2">
        {lessons.map((lesson, index) => {
          const active = index === lessonIndex;

          return (
            <button
              key={lesson.id}
              type="button"
              onClick={() => onSelectLesson(index)}
              className={[
                "min-h-[64px] rounded-2xl border p-2 text-left transition active:scale-[0.98]",
                active
                  ? "border-cyan-300/35 bg-cyan-400/14 shadow-[0_0_14px_rgba(34,211,238,0.10)]"
                  : "border-white/10 bg-white/[0.035]",
              ].join(" ")}
            >
              <div className="text-[9px] font-black uppercase tracking-[0.12em] text-white/42">
                Lesson {index + 1}
              </div>

              <div className="mt-1 line-clamp-1 text-[11px] font-black tracking-[-0.03em] text-white">
                {lesson.title}
              </div>

              <p className="mt-0.5 line-clamp-2 text-[10px] leading-3 text-white/45">
                {lesson.description}
              </p>
            </button>
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
          Learn Archive
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

export default function LearnPage({
  onBack,
  archiveMonth = DEFAULT_ARCHIVE_MONTH,
  archivePart = DEFAULT_ARCHIVE_PART,
}) {
  const navigate = useNavigate();
  const [moduleIndex, setModuleIndex] = useState(0);
  const [lessonIndex, setLessonIndex] = useState(0);

  const modules = useMemo(() => normalizeModules(learnModules), []);

  const orderedModules = useMemo(() => orderModules(modules), [modules]);

  const currentModule = orderedModules[moduleIndex] || orderedModules[0];

  const lessons = useMemo(() => buildLessons(currentModule), [currentModule]);

  const currentLesson = lessons[lessonIndex] || lessons[0];

  const recommendedEbooks = useMemo(() => {
    return getArchivedRecommendedEbooks({
      recommendedEbookIds: getRecommendedEbookIds(currentModule),
      currentMonth: archiveMonth,
      currentPart: archivePart,
    }).slice(0, 3);
  }, [currentModule, archiveMonth, archivePart]);

  function handleBack() {
    if (typeof onBack === "function") {
      onBack();
      return;
    }

    navigate("/v1/dashboard");
  }

  function handleSelectLesson(index) {
    setLessonIndex(Math.max(0, Math.min(LESSON_COUNT - 1, index)));
  }

  function handleNextModule() {
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
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/75 transition active:scale-[0.97]"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="text-center">
          <div className="text-[16px] font-black uppercase tracking-[0.2em] text-white">
            Learn
          </div>
          <div className="text-xs font-black tracking-[-0.03em] text-white/48">
            Overview
          </div>
        </div>

        <div className="h-10 w-10" />
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-hidden px-3 py-3">
        {currentModule ? (
          <ContinueLearningCard
            module={currentModule}
            lesson={currentLesson}
            lessonIndex={lessonIndex}
            onSelectLesson={handleSelectLesson}
            onNextModule={handleNextModule}
          />
        ) : null}

        <LessonsList
          lessons={lessons}
          lessonIndex={lessonIndex}
          onSelectLesson={handleSelectLesson}
        />

        <section className="min-h-0 flex-1 overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.025] p-3">
          <div className="mb-2 flex items-end justify-between">
            <div>
              <div className="text-[14px] font-black tracking-[-0.04em] text-white">
                Recommended for you
              </div>
              <div className="text-[10px] text-white/45">
                Pulled from your Learn Archive.
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