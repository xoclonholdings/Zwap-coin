import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, ChevronRight } from "lucide-react";

import { learnModules } from "./data/learnModules";
import { getEbookCarousel, getReleasedEbooks } from "./data/ebooks";

const LESSON_COUNT = 3;
const CURRENT_ARCHIVE_MONTH = 5;
const CURRENT_ARCHIVE_PART = 2;

const TERM_DEFINITIONS = {
  web3: {
    title: "Web3",
    shortLabel: "Web3",
    description:
      "Web3 is a version of the internet where users can own and control their data, assets, and identity instead of relying only on platforms.",
    whyItMatters:
      "ZWAP! introduces Web3 so your rewards and progress can eventually belong to you, not just the app.",
  },
  cryptocurrency: {
    title: "Cryptocurrency",
    shortLabel: "Crypto",
    description:
      "Cryptocurrency is digital money that exists on the internet and is not controlled by one single bank.",
    whyItMatters:
      "ZWAP! connects to this system, helping you understand how digital value works beyond traditional money.",
  },
  blockchain: {
    title: "Blockchain",
    shortLabel: "Blockchain",
    description:
      "A blockchain is a digital record that stores transactions across many computers so it cannot easily be changed.",
    whyItMatters:
      "It is the system that tracks ownership and transactions for crypto and tokens like ZWAP.",
  },
  wallet: {
    title: "Wallet",
    shortLabel: "Wallet",
    description:
      "A wallet is a digital tool that gives you access to your crypto and tokens.",
    whyItMatters:
      "In ZWAP!, a wallet allows you to connect your rewards to you and access full Web3 features.",
  },
  zwap: {
    title: "ZWAP",
    shortLabel: "ZWAP",
    description:
      "ZWAP is the main reward token in the ecosystem that connects to real digital value.",
    whyItMatters:
      "You earn zPts first, then ZWAP becomes accessible as your progress grows.",
  },
  zpts: {
    title: "zPts",
    shortLabel: "zPts",
    description:
      "zPts are in-app points you earn through movement, play, and learning.",
    whyItMatters:
      "They track your effort and progress before converting into deeper value systems like ZWAP.",
  },
  token: {
    title: "Token",
    shortLabel: "Token",
    description:
      "A token is a digital unit of value that exists on a blockchain.",
    whyItMatters:
      "ZWAP is a token, so understanding tokens helps you understand how value moves in the system.",
  },
  swap: {
    title: "Swap",
    shortLabel: "Swap",
    description:
      "Swap means exchanging one digital asset for another.",
    whyItMatters:
      "ZWAP! introduces swapping later so users understand value before exchanging it.",
  },
  ownership: {
    title: "Ownership",
    shortLabel: "Ownership",
    description:
      "Ownership means your assets or rewards are connected directly to you, not just stored inside an app.",
    whyItMatters:
      "A wallet allows you to truly own your rewards instead of relying only on a platform.",
  },
  value: {
    title: "Value",
    shortLabel: "Value",
    description:
      "Value is how useful or meaningful something is based on what it provides.",
    whyItMatters:
      "ZWAP! is built around creating value through action, not just assigning it.",
  },
  utility: {
    title: "Utility",
    shortLabel: "Utility",
    description:
      "Utility is how something is used and what purpose it serves.",
    whyItMatters:
      "ZWAP! focuses on utility so rewards have real use, not just speculation.",
  },
  progression: {
    title: "Progression",
    shortLabel: "Progression",
    description:
      "Progression is moving forward step by step over time.",
    whyItMatters:
      "ZWAP! unlocks features gradually as you build consistency.",
  },
  reward: {
    title: "Reward",
    shortLabel: "Reward",
    description:
      "A reward is something you earn after completing an action.",
    whyItMatters:
      "ZWAP! uses rewards to reinforce useful behaviors like movement and learning.",
  },
  loop: {
    title: "Loop",
    shortLabel: "Loop",
    description:
      "A loop is a repeating cycle of actions and results.",
    whyItMatters:
      "ZWAP! uses loops like Move, Play, Earn to build consistency.",
  },
  habit: {
    title: "Habit",
    shortLabel: "Habit",
    description:
      "A habit is a behavior that becomes automatic through repetition.",
    whyItMatters:
      "ZWAP! helps build habits through daily actions and rewards.",
  },
  consistency: {
    title: "Consistency",
    shortLabel: "Consistency",
    description:
      "Consistency means repeating an action regularly over time.",
    whyItMatters:
      "Progress in ZWAP! comes from showing up repeatedly, not one-time effort.",
  },
  focus: {
    title: "Focus",
    shortLabel: "Focus",
    description:
      "Focus is directing your attention toward a specific task.",
    whyItMatters:
      "Better focus leads to better execution and stronger results.",
  },
  discipline: {
    title: "Discipline",
    shortLabel: "Discipline",
    description:
      "Discipline is taking action even when you do not feel like it.",
    whyItMatters:
      "Discipline turns intention into real progress.",
  },
  identity: {
    title: "Identity",
    shortLabel: "Identity",
    description:
      "Identity is how you see yourself based on repeated actions.",
    whyItMatters:
      "ZWAP! reinforces identity through streaks and consistent behavior.",
  },
  ai: {
    title: "AI",
    shortLabel: "AI",
    description:
      "AI is technology that can generate, analyze, and automate tasks.",
    whyItMatters:
      "ZWAP! introduces AI so users can learn to use tools instead of avoiding them.",
  },
  automation: {
    title: "Automation",
    shortLabel: "Automation",
    description:
      "Automation is using technology to complete tasks with less manual effort.",
    whyItMatters:
      "Automation changes how work is done, making efficiency more important.",
  },
  prompt: {
    title: "Prompt",
    shortLabel: "Prompt",
    description:
      "A prompt is the instruction you give to an AI system.",
    whyItMatters:
      "Clear prompts lead to better AI results and more control.",
  },
};

const EXTRA_SYNONYMS = {
  wallet: ["key", "access"],
  swap: ["exchange"],
  ownership: ["own", "control"],
  reward: ["earn"],
  cryptocurrency: ["crypto"],
};

function getTermDefinition(term) {
  if (!term) return null;
  return TERM_DEFINITIONS[String(term).toLowerCase()] || null;
}

function normalize(text = "") {
  return String(text).toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
}

function buildSearchIndex() {
  const index = [];

  Object.entries(TERM_DEFINITIONS || {}).forEach(([key, definition]) => {
    const variants = new Set(
      [
        key,
        definition?.title,
        definition?.shortLabel,
        ...(EXTRA_SYNONYMS[key] || []),
      ]
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
      const candidate = words
        .slice(index, index + entry.wordCount * 2 - 1)
        .join("");
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
    route: `/learn/ebook/${ebook.id}`,
    tags: ebook.tags || [],
    releaseOrder: ebook.releaseOrder || 999,
  }));

  const recommendedIds = new Set(recommended.map((ebook) => ebook.id));
  const merged = [
    ...recommended,
    ...released.filter((ebook) => !recommendedIds.has(ebook.id)),
  ];

  return merged.slice(0, 6);
}

async function completeLearnModule({
  apiBase,
  email,
  moduleId,
  refreshActivitySnapshot,
  setActivitySignal,
  onBalanceUpdate,
}) {
  if (!apiBase || !email || !moduleId) {
    return null;
  }

  try {
    const response = await fetch(
      `${apiBase}/learn/complete/${encodeURIComponent(email)}/${moduleId}`,
      {
        method: "POST",
      }
    );

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return data;
    }

    if (data?.new_zpts_balance !== undefined) {
      onBalanceUpdate?.(data.new_zpts_balance);
    }

    refreshActivitySnapshot?.();
    setActivitySignal?.(Date.now());

    return data;
  } catch {
    return null;
  }
}

function MainCard({ module, lesson, onNextModule, completing = false }) {
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
          disabled={completing}
          className={[
            "shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black text-white/80",
            completing ? "opacity-60" : "active:scale-[0.97]",
          ].join(" ")}
        >
          {completing ? "Saving" : "Next Module"}
          <ChevronRight size={12} className="ml-1 inline" />
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
            {lesson?.title}
          </div>

          <div className="mt-2">
            <LessonText text={lesson?.content || ""} />
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
      className="w-[31%] shrink-0 rounded-[18px] border border-white/10 bg-white/[0.04] p-2 text-left active:scale-[0.98]"
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

export default function LearnPage({
  onBack,
  email,
  apiBase,
  refreshActivitySnapshot,
  setActivitySignal,
  onBalanceUpdate,
  mode = "default",
  initialEbook = null,
}) {
  const navigate = useNavigate();

  const [moduleIndex, setModuleIndex] = useState(0);
  const [lessonIndex, setLessonIndex] = useState(0);
  const [activeEbook, setActiveEbook] = useState(initialEbook);
  const [completingModule, setCompletingModule] = useState(false);

  const modules = useMemo(() => normalizeModules(learnModules), []);

  const currentModule = modules[moduleIndex];
  const lessons = useMemo(() => buildLessons(currentModule), [currentModule]);
  const currentLesson = lessons[lessonIndex];

  const ebooks = useMemo(() => {
    return buildReleasedEbookCarousel({ module: currentModule });
  }, [currentModule]);

  useEffect(() => {
    if (mode === "archive" && initialEbook) {
      setActiveEbook(initialEbook);
      setLessonIndex(0);
    }
  }, [mode, initialEbook]);

  function handleBack() {
    if (onBack) return onBack();
    navigate("/v1/dashboard");
  }

  async function handleNextModule() {
    if (!currentModule || completingModule) return;

    setCompletingModule(true);

    await completeLearnModule({
      apiBase,
      email,
      moduleId: currentModule.id,
      refreshActivitySnapshot,
      setActivitySignal,
      onBalanceUpdate,
    });

    setActiveEbook(null);
    setModuleIndex((prev) => {
      const next = prev + 1;
      return next >= modules.length ? 0 : next;
    });
    setLessonIndex(0);
    setCompletingModule(false);
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
      <div className="mb-5 flex items-center justify-between px-4 pt-3">
        <button
          type="button"
          onClick={handleBack}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/80 transition active:scale-[0.96]"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.18em] text-white/40">
            Learn
          </div>
          <div className="text-[15px] font-semibold tracking-[-0.02em] text-white">
            Overview
          </div>
        </div>

        <div className="w-10" />
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-hidden px-3 pb-3">
        <MainCard
          module={currentModule}
          lesson={displayLesson}
          onNextModule={handleNextModule}
          completing={completingModule}
        />

        <LessonToggles
          lessonIndex={lessonIndex}
          setLessonIndex={(index) => {
            setActiveEbook(null);
            setLessonIndex(index);
          }}
        />

        <div className="min-h-0 flex-1 overflow-hidden">
          <div className="text-[13px] font-black text-white">
            Recommended for you
          </div>
          <div className="text-[10px] text-white/50">
            Pulled from your Learn Archive.
          </div>

          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
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