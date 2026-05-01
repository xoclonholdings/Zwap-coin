import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, ChevronRight } from "lucide-react";

import { learnModules } from "./data/learnModules";
import { getEbookCarousel } from "@/data/ebooks";
import LessonText from "@/components/lesson/LessonText";

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

function MainCard({ module, lesson, onNextModule }) {
  const image = getModuleImage(module);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[24px] border border-purple-400/25 bg-[radial-gradient(circle_at_18%_0%,rgba(168,85,247,0.18),transparent_36%),linear-gradient(180deg,rgba(17,20,38,0.96),rgba(7,10,20,0.98))] p-4"
    >
      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-purple-300">
            Module
          </div>

          <h2 className="mt-1 text-[18px] font-black tracking-[-0.04em] text-white">
            {module?.title}
          </h2>
        </div>

        <button
          onClick={onNextModule}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black text-white/80"
        >
          Next Module <ChevronRight size={12} className="inline ml-1" />
        </button>
      </div>

      {/* LESSON CONTENT */}
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

          <div className="mt-2 text-sm leading-5 text-white">
            <LessonText text={lesson.content} />
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function LessonToggles({ lessonIndex, setLessonIndex }) {
  return (
    <div className="flex gap-2">
      {[0, 1, 2].map((i) => (
        <button
          key={i}
          onClick={() => setLessonIndex(i)}
          className={[
            "flex-1 rounded-2xl border py-2 text-xs font-black",
            lessonIndex === i
              ? "border-cyan-300/40 bg-cyan-400/15 text-white"
              : "border-white/10 bg-white/[0.04] text-white/50",
          ].join(" ")}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
}

function RecommendedEbookCard({ item }) {
  const image =
    item?.image || item?.cover || item?.coverImage || "";

  return (
    <div className="w-[31%] rounded-[18px] border border-white/10 bg-white/[0.04] p-2">
      <div className="h-[70px] rounded-[12px] overflow-hidden">
        {image ? (
          <img src={image} className="h-full w-full object-cover" />
        ) : null}
      </div>

      <div className="mt-2 text-[11px] font-black text-white line-clamp-2">
        {item?.title}
      </div>

      <button className="mt-1 text-[10px] text-cyan-300 font-black">
        {item?.action || "Read"}
      </button>
    </div>
  );
}

export default function LearnPage({ onBack }) {
  const navigate = useNavigate();

  const [moduleIndex, setModuleIndex] = useState(0);
  const [lessonIndex, setLessonIndex] = useState(0);

  const modules = useMemo(() => normalizeModules(learnModules), []);

  const currentModule = modules[moduleIndex];
  const lessons = useMemo(() => buildLessons(currentModule), [currentModule]);
  const currentLesson = lessons[lessonIndex];

  const ebooks = useMemo(() => {
    return getEbookCarousel({
      recommendedEbookIds: currentModule?.recommendedEbookIds || [],
      currentMonth: 1,
      currentPart: 1,
    });
  }, [currentModule]);

  function handleBack() {
    if (onBack) return onBack();
    navigate("/v1/dashboard");
  }

  function handleNextModule() {
    setModuleIndex((prev) =>
      prev + 1 >= modules.length ? prev : prev + 1
    );
    setLessonIndex(0);
  }

  return (
    <div className="flex h-[100dvh] flex-col bg-[#050510] text-white">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <button
          onClick={handleBack}
          className="h-10 w-10 rounded-full border border-white/10 bg-white/[0.05]"
        >
          <ArrowLeft className="h-5 w-5 m-auto" />
        </button>

        <div className="text-center">
          <div className="text-[13px] tracking-[0.22em] text-white/60">
            Learn
          </div>
          <div className="text-sm font-black text-white">
            Overview
          </div>
        </div>

        <div className="h-10 w-10" />
      </div>

      {/* BODY */}
      <div className="flex flex-1 flex-col gap-3 p-3 overflow-hidden">
        <MainCard
          module={currentModule}
          lesson={currentLesson}
          onNextModule={handleNextModule}
        />

        <LessonToggles
          lessonIndex={lessonIndex}
          setLessonIndex={setLessonIndex}
        />

        {/* RECOMMENDED */}
        <div>
          <div className="text-[13px] font-black text-white">
            Recommended for you
          </div>
          <div className="text-[10px] text-white/50">
            Pulled from your Learn Archive.
          </div>

          <div className="mt-2 flex gap-2">
            {ebooks.map((item) => (
              <RecommendedEbookCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}