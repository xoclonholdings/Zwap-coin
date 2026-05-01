import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, ChevronRight } from "lucide-react";

import { learnModules } from "./data/learnModules";
import { getEbookCarousel, getReleasedEbooks } from "./data/ebooks";

const LESSON_COUNT = 3;
const CURRENT_ARCHIVE_MONTH = 5;
const CURRENT_ARCHIVE_PART = 2;

function normalizeModules(source) {
  if (Array.isArray(source)) return source;

  return [
    ...(source?.beginner || []),
    ...(source?.intermediate || []),
    ...(source?.advanced || []),
    ...(source?.expert || []),
  ];
}

function getModuleImage(module) {
  return module?.image || module?.coverImage || module?.cover_image || "";
}

function buildLessons(module) {
  const source = Array.isArray(module?.lessons)
    ? module.lessons.slice(0, 3)
    : [];

  return [0, 1, 2].map((_, index) => {
    const lesson = source[index] || {};

    return {
      id: lesson?.id || `${module?.id}-lesson-${index}`,
      title:
        index === 0
          ? "Concept"
          : index === 1
          ? "Application"
          : "Lock In",
      content: lesson?.content || "Lesson content not yet available.",
    };
  });
}

function buildReleasedEbookCarousel({ module }) {
  const recommended = getEbookCarousel({
    recommendedEbookIds: module?.recommendedEbookIds || [],
    currentMonth: CURRENT_ARCHIVE_MONTH,
    currentPart: CURRENT_ARCHIVE_PART,
  });

  const released = getReleasedEbooks({
    currentMonth: CURRENT_ARCHIVE_MONTH,
    currentPart: CURRENT_ARCHIVE_PART,
  }).map((ebook) => ({
    id: ebook.id,
    title: `TLDR: ${ebook.title}`,
    action: "Read",
  }));

  const recommendedIds = new Set(recommended.map((ebook) => ebook.id));

  const merged = [
    ...recommended,
    ...released.filter((ebook) => !recommendedIds.has(ebook.id)),
  ];

  return merged.slice(0, 6);
}

function MainCard({ module, lesson, onNextModule }) {
  const image = getModuleImage(module);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[24px] border border-purple-400/25 bg-[radial-gradient(circle_at_18%_0%,rgba(168,85,247,0.18),transparent_36%),linear-gradient(180deg,rgba(17,20,38,0.96),rgba(7,10,20,0.98))] p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-purple-300">
            Module
          </div>

          <h2 className="mt-1 text-[18px] font-black text-white">
            {module?.title}
          </h2>
        </div>

        <button
          type="button"
          onClick={onNextModule}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black text-white/80"
        >
          Next Module <ChevronRight size={12} className="ml-1 inline" />
        </button>
      </div>

      <div className="mt-4 flex gap-3 rounded-[18px] border border-white/10 bg-black/30 p-3">
        <div className="flex h-[72px] w-[60px] items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.04]">
          {image ? (
            <img src={image} className="h-full w-full object-cover" />
          ) : (
            <BookOpen className="h-6 w-6 text-purple-300" />
          )}
        </div>

        <div className="flex-1">
          <div className="text-[10px] font-black uppercase text-white/50">
            {lesson.title}
          </div>

          <div className="mt-2 text-sm text-white">
            {lesson.content}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function LessonToggles({ lessonIndex, setLessonIndex }) {
  return (
    <div className="flex gap-2">
      {[0, 1, 2].map((index) => {
        const label =
          index === 0 ? "Concept" : index === 1 ? "Application" : "Lock In";

        return (
          <button
            key={index}
            onClick={() => setLessonIndex(index)}
            className={[
              "flex-1 rounded-2xl border py-2 text-xs font-black",
              lessonIndex === index
                ? "border-cyan-300/40 bg-cyan-400/15 text-white"
                : "border-white/10 bg-white/[0.04] text-white/50",
            ].join(" ")}
          >
            {index + 1}. {label}
          </button>
        );
      })}
    </div>
  );
}

function RecommendedEbookCard({ item, onRead }) {
  return (
    <button
      onClick={() => onRead(item)}
      className="w-[31%] rounded-[18px] border border-white/10 bg-white/[0.04] p-2 text-left"
    >
      <div className="text-[11px] font-black text-white line-clamp-2">
        {item.title}
      </div>

      <div className="mt-1 text-[10px] text-cyan-300 font-black">
        Read
      </div>
    </button>
  );
}

export default function LearnPage({
  onBack,
  email,
  apiBase,
  refreshActivitySnapshot,
  setActivitySignal,
  onBalanceUpdate,
}) {
  const navigate = useNavigate();

  const [moduleIndex, setModuleIndex] = useState(0);
  const [lessonIndex, setLessonIndex] = useState(0);
  const [activeEbook, setActiveEbook] = useState(null);

  const modules = useMemo(() => normalizeModules(learnModules), []);
  const currentModule = modules[moduleIndex];
  const lessons = useMemo(() => buildLessons(currentModule), [currentModule]);
  const currentLesson = lessons[lessonIndex];

  const ebooks = useMemo(
    () => buildReleasedEbookCarousel({ module: currentModule }),
    [currentModule]
  );

  async function completeModule() {
    if (!email || !apiBase) return;

    try {
      const res = await fetch(
        `${apiBase}/learn/complete/${email}/${currentModule.id}`,
        { method: "POST" }
      );

      const data = await res.json();

      if (data?.new_zpts_balance !== undefined) {
        onBalanceUpdate?.(data.new_zpts_balance);
      }

      refreshActivitySnapshot?.();
      setActivitySignal?.(Date.now());
    } catch (err) {
      console.error("Learn completion error", err);
    }
  }

  function handleNextModule() {
    completeModule(); // 🔥 TASK + REWARD TRIGGER

    setActiveEbook(null);
    setModuleIndex((prev) =>
      prev + 1 >= modules.length ? prev : prev + 1
    );
    setLessonIndex(0);
  }

  function handleBack() {
    if (onBack) return onBack();
    navigate("/v1/dashboard");
  }

  const displayLesson = activeEbook
    ? { title: "Read", content: activeEbook.title }
    : currentLesson;

  return (
    <div className="flex h-[100dvh] flex-col bg-[#050510] text-white">
      <div className="mb-5 flex items-center justify-between px-4 pt-3">
        <button
          onClick={handleBack}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.18em] text-white/40">
            Learn
          </div>
          <div className="text-[15px] font-semibold text-white">
            Overview
          </div>
        </div>

        <div className="w-10" />
      </div>

      <div className="flex flex-1 flex-col gap-3 px-3 pb-3">
        <MainCard
          module={currentModule}
          lesson={displayLesson}
          onNextModule={handleNextModule}
        />

        <LessonToggles
          lessonIndex={lessonIndex}
          setLessonIndex={(i) => {
            setActiveEbook(null);
            setLessonIndex(i);
          }}
        />

        <div>
          <div className="text-[13px] font-black text-white">
            Recommended for you
          </div>

          <div className="mt-2 flex gap-2 overflow-x-auto">
            {ebooks.map((item) => (
              <RecommendedEbookCard
                key={item.id}
                item={item}
                onRead={setActiveEbook}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}