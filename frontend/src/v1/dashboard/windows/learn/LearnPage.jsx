import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, ChevronRight } from "lucide-react";

import { learnModules } from "./data/learnModules";
import { getEbookCarousel } from "./data/ebooks";
import { TERM_DEFINITIONS, getTermDefinition } from "./data/terms";

const LESSON_COUNT = 3;

const EXTRA_SYNONYMS = {
  wallet: ["key", "access"],
  swap: ["exchange"],
  ownership: ["own", "control"],
  reward: ["earn"],
  cryptocurrency: ["crypto"],
};

function normalize(text = "") {
  return String(text).toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
}

function buildSearchIndex() {
  const index = [];

  Object.entries(TERM_DEFINITIONS || {}).forEach(([key, definition]) => {
    const variants = new Set(
      [key, definition?.title, definition?.shortLabel, ...(EXTRA_SYNONYMS[key] || [])]
        .filter(Boolean)
        .map(normalize)
        .filter(Boolean)
    );

    variants.forEach((variant) => {
      index.push({
        key,
        variant,
        wordCount: variant.split(/\s+/).filter(Boolean).length,
      });
    });
  });

  return index.sort((a, b) => b.wordCount - a.wordCount);
}

const TERM_SEARCH_INDEX = buildSearchIndex();

function parseLessonText(text = "") {
  if (!text) return [];

  const words = String(text).split(/(\s+)/);
  const usedTerms = new Set();
  const results = [];

  let index = 0;

  while (index < words.length) {
    let matched = false;

    for (const entry of TERM_SEARCH_INDEX) {
      const candidate = words.slice(index, index + entry.wordCount * 2 - 1).join("");
      const cleanCandidate = normalize(candidate);

      if (cleanCandidate === entry.variant && !usedTerms.has(entry.key)) {
        const term = getTermDefinition(entry.key);

        if (term) {
          results.push({
            type: "term",
            value: candidate,
            term,
            key: `${entry.key}-${index}`,
          });

          usedTerms.add(entry.key);
          index += entry.wordCount * 2 - 1;
          matched = true;
          break;
        }
      }
    }

    if (!matched) {
      results.push({
        type: "text",
        value: words[index],
        key: `text-${index}`,
      });
      index += 1;
    }
  }

  return results;
}

function LessonText({ text = "" }) {
  const [activeTerm, setActiveTerm] = useState(null);
  const parts = useMemo(() => parseLessonText(text), [text]);

  return (
    <>
      <div className="text-sm leading-5 text-white">
        {parts.map((part) => {
          if (part.type === "term") {
            return (
              <button
                key={part.key}
                type="button"
                onClick={() => setActiveTerm(part.term)}
                className="font-black text-cyan-300 underline decoration-cyan-300/40 underline-offset-2"
              >
                {part.value}
              </button>
            );
          }

          return <span key={part.key}>{part.value}</span>;
        })}
      </div>

      {activeTerm ? (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 px-5">
          <div className="w-full max-w-[320px] rounded-[24px] border border-cyan-300/20 bg-[#07111f] p-4 text-white shadow-[0_0_50px_rgba(34,211,238,0.14)]">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300">
              {activeTerm.shortLabel || "Term"}
            </div>

            <h3 className="mt-1 text-lg font-black tracking-[-0.04em]">
              {activeTerm.title}
            </h3>

            <p className="mt-3 text-sm leading-5 text-white/72">
              {activeTerm.description}
            </p>

            <p className="mt-3 text-xs leading-5 text-white/48">
              {activeTerm.whyItMatters}
            </p>

            <button
              type="button"
              onClick={() => setActiveTerm(null)}
              className="mt-4 w-full rounded-2xl border border-cyan-300/20 bg-cyan-400/10 py-2 text-xs font-black text-cyan-200"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

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
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-purple-300">
            Module
          </div>

          <h2 className="mt-1 line-clamp-1 text-[18px] font-black tracking-[-0.04em] text-white">
            {module?.title}
          </h2>
        </div>

        <button
          type="button"
          onClick={onNextModule}
          className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black text-white/80"
        >
          Next Module <ChevronRight size={12} className="ml-1 inline" />
        </button>
      </div>

      <div className="mt-4 flex gap-3 rounded-[18px] border border-white/10 bg-black/30 p-3">
        <div className="flex h-[72px] w-[60px] shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-white/10 bg-white/[0.04]">
          {image ? (
            <img
              src={image}
              alt={module?.title || "Module"}
              className="h-full w-full object-cover"
            />
          ) : (
            <BookOpen className="h-6 w-6 text-purple-300" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-black uppercase text-white/50">
            {lesson.title}
          </div>

          <div className="mt-2">
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
      {[0, 1, 2].map((index) => {
        const label =
          index === 0 ? "Concept" : index === 1 ? "Application" : "Lock In";

        return (
          <button
            key={index}
            type="button"
            onClick={() => setLessonIndex(index)}
            className={[
              "flex-1 rounded-2xl border px-2 py-2 text-left text-xs font-black",
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
  const image = item?.image || item?.cover || item?.coverImage || "";

  return (
    <button
      type="button"
      onClick={() => onRead(item)}
      className="w-[31%] rounded-[18px] border border-white/10 bg-white/[0.04] p-2 text-left active:scale-[0.98]"
    >
      <div className="h-[70px] overflow-hidden rounded-[12px] bg-white/[0.04]">
        {image ? (
          <img
            src={image}
            alt={item?.title || "Ebook"}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>

      <div className="mt-2 line-clamp-2 text-[11px] font-black text-white">
        {item?.title || "TLDR"}
      </div>

      <div className="mt-1 text-[10px] font-black text-cyan-300">
        {item?.action || "Read"}
      </div>
    </button>
  );
}

export default function LearnPage({ onBack }) {
  const navigate = useNavigate();

  const [moduleIndex, setModuleIndex] = useState(0);
  const [lessonIndex, setLessonIndex] = useState(0);
  const [activeEbook, setActiveEbook] = useState(null);

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
    setActiveEbook(null);
    setModuleIndex((prev) => (prev + 1 >= modules.length ? prev : prev + 1));
    setLessonIndex(0);
  }

  function handleReadEbook(ebook) {
    setActiveEbook(ebook);
  }

  const displayLesson = activeEbook
    ? {
        title: "Read",
        content: activeEbook.title || "TLDR not available.",
      }
    : currentLesson;

  return (
    <div className="flex h-[100dvh] flex-col bg-[#050510] text-white">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <button
          type="button"
          onClick={handleBack}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05]"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="text-center">
          <div className="text-[13px] tracking-[0.22em] text-white/60">
            Learn
          </div>
          <div className="text-sm font-black text-white">Overview</div>
        </div>

        <div className="h-10 w-10" />
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-hidden p-3">
        <MainCard
          module={currentModule}
          lesson={displayLesson}
          onNextModule={handleNextModule}
        />

        <LessonToggles
          lessonIndex={lessonIndex}
          setLessonIndex={(index) => {
            setActiveEbook(null);
            setLessonIndex(index);
          }}
        />

        <div>
          <div className="text-[13px] font-black text-white">
            Recommended for you
          </div>
          <div className="text-[10px] text-white/50">
            Pulled from your Learn Archive.
          </div>

          <div className="mt-2 flex gap-2">
            {ebooks.map((item) => (
              <RecommendedEbookCard
                key={item.id}
                item={item}
                onRead={handleReadEbook}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}