import React, { useMemo, useState } from "react";
import {
  BookOpen,
  Layers,
  Library,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { coreModules } from "../windows/learn/data/modules/coreModules";
import { ebooks, getReleasedEbooks } from "../windows/learn/data/ebooks";

function getModuleEbooks(module) {
  const ids = Array.isArray(module?.recommendedEbookIds)
    ? module.recommendedEbookIds
    : [];

  return ids
    .map((id) => ebooks.find((ebook) => ebook.id === id))
    .filter(Boolean)
    .sort((a, b) => a.releaseOrder - b.releaseOrder);
}

function StatCard({ icon: Icon, label, value, tone = "cyan" }) {
  const toneClass =
    tone === "purple"
      ? "border-purple-400/20 bg-purple-500/10 text-purple-200"
      : tone === "emerald"
        ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
        : "border-cyan-400/20 bg-cyan-500/10 text-cyan-200";

  return (
    <div className={`rounded-2xl border p-3 ${toneClass}`}>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <div className="text-[10px] font-black uppercase tracking-[0.16em] opacity-70">
          {label}
        </div>
      </div>

      <div className="mt-2 text-2xl font-black tracking-[-0.06em] text-white">
        {value}
      </div>
    </div>
  );
}

function CycleSelect({ month, part, onMonthChange, onPartChange }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.035] p-3">
      <div className="mb-3 text-[11px] font-black uppercase tracking-[0.16em] text-white/45">
        Archive Release State
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
            Month
          </span>
          <select
            value={month}
            onChange={(event) => onMonthChange(Number(event.target.value))}
            className="h-10 w-full rounded-xl border border-white/10 bg-[#07101d] px-3 text-sm font-semibold text-white outline-none"
          >
            <option value={1}>Month 1</option>
            <option value={2}>Month 2</option>
            <option value={3}>Month 3</option>
            <option value={4}>Month 4</option>
            <option value={5}>Month 5</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
            Part
          </span>
          <select
            value={part}
            onChange={(event) => onPartChange(Number(event.target.value))}
            className="h-10 w-full rounded-xl border border-white/10 bg-[#07101d] px-3 text-sm font-semibold text-white outline-none"
          >
            <option value={1}>Weeks 1–2</option>
            <option value={2}>Weeks 3–4</option>
          </select>
        </label>
      </div>

      <p className="mt-3 text-xs leading-5 text-white/45">
        This preview controls which eBooks are treated as released into the
        Learn Archive. Shop can rotate, but Learn Archive accumulates.
      </p>
    </div>
  );
}

function EbookArchiveList({ releasedIds }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.035] p-3">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-black tracking-[-0.03em] text-white">
            eBook Archive
          </div>
          <div className="text-[11px] text-white/40">
            Released books stay available in Learn.
          </div>
        </div>

        <Library className="h-5 w-5 text-purple-300" />
      </div>

      <div className="space-y-2">
        {ebooks.map((ebook) => {
          const released = releasedIds.has(ebook.id);

          return (
            <div
              key={ebook.id}
              className={[
                "rounded-2xl border p-3",
                released
                  ? "border-emerald-300/18 bg-emerald-500/8"
                  : "border-white/8 bg-black/16",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-white">
                    {ebook.title}
                  </div>

                  <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/38">
                    Month {ebook.releaseMonth} · Part {ebook.releasePart} · #
                    {ebook.releaseOrder}
                  </div>
                </div>

                <div
                  className={[
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
                    released
                      ? "border-emerald-300/25 bg-emerald-400/12 text-emerald-300"
                      : "border-white/10 bg-white/[0.03] text-white/30",
                  ].join(" ")}
                >
                  {released ? <Unlock size={14} /> : <Lock size={14} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ModuleCard({ module, index, releasedIds }) {
  const [open, setOpen] = useState(index === 0);
  const moduleEbooks = getModuleEbooks(module);
  const visibleEbooks = moduleEbooks.filter((ebook) => releasedIds.has(ebook.id));
  const lockedEbooks = moduleEbooks.filter((ebook) => !releasedIds.has(ebook.id));

  return (
    <div className="overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.035]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-start justify-between gap-3 p-3 text-left"
      >
        <div className="min-w-0">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-300/70">
            Module {index + 1}
          </div>

          <div className="mt-1 truncate text-sm font-black tracking-[-0.03em] text-white">
            {module.title}
          </div>

          <div className="mt-1 text-xs text-white/42">
            {module.lessons?.length || 0} lessons ·{" "}
            {visibleEbooks.length} archive matches
          </div>
        </div>

        <div className="shrink-0 text-white/35">
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {open ? (
        <div className="border-t border-white/8 p-3">
          <div className="mb-3">
            <div className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/35">
              Lessons
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(module.lessons || []).slice(0, 3).map((lesson, lessonIndex) => (
                <div
                  key={lesson.id || lessonIndex}
                  className="rounded-2xl border border-purple-300/16 bg-purple-500/8 p-2"
                >
                  <div className="text-[9px] font-black uppercase tracking-[0.12em] text-purple-200/65">
                    Lesson {lessonIndex + 1}
                  </div>

                  <div className="mt-1 line-clamp-2 text-[11px] font-bold leading-4 text-white">
                    {lesson.title}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/35">
              Recommended eBooks from Learn Archive
            </div>

            {visibleEbooks.length > 0 ? (
              <div className="space-y-2">
                {visibleEbooks.map((ebook) => (
                  <div
                    key={ebook.id}
                    className="rounded-2xl border border-emerald-300/15 bg-emerald-500/8 p-2"
                  >
                    <div className="text-xs font-bold text-white">
                      {ebook.title}
                    </div>
                    <div className="mt-0.5 text-[10px] text-emerald-200/65">
                      Available in Archive
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/8 bg-black/16 p-3 text-xs text-white/42">
                No mapped eBooks have entered the Learn Archive yet.
              </div>
            )}

            {lockedEbooks.length > 0 ? (
              <div className="mt-3">
                <div className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/25">
                  Future matches
                </div>

                <div className="space-y-2">
                  {lockedEbooks.map((ebook) => (
                    <div
                      key={ebook.id}
                      className="rounded-2xl border border-white/8 bg-white/[0.025] p-2"
                    >
                      <div className="text-xs font-semibold text-white/45">
                        {ebook.title}
                      </div>
                      <div className="mt-0.5 text-[10px] text-white/25">
                        Releases Month {ebook.releaseMonth}, Part{" "}
                        {ebook.releasePart}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function AdminLearnSection() {
  const [currentMonth, setCurrentMonth] = useState(1);
  const [currentPart, setCurrentPart] = useState(1);

  const releasedEbooks = useMemo(
    () =>
      getReleasedEbooks({
        currentMonth,
        currentPart,
      }),
    [currentMonth, currentPart]
  );

  const releasedIds = useMemo(
    () => new Set(releasedEbooks.map((ebook) => ebook.id)),
    [releasedEbooks]
  );

  return (
    <div className="space-y-4">
      <div>
        <div className="text-[11px] font-black uppercase tracking-[0.18em] text-cyan-300/70">
          Learn Control
        </div>
        <h2 className="mt-1 text-2xl font-black tracking-[-0.06em] text-white">
          Learn Archive
        </h2>
        <p className="mt-1 text-sm leading-6 text-white/48">
          Modules stay stable. eBooks enter the archive as Shop cycles release
          them. Recommendations pull only from the released archive.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatCard icon={Layers} label="Modules" value={coreModules.length} />
        <StatCard
          icon={BookOpen}
          label="Lessons"
          value={coreModules.length * 3}
          tone="purple"
        />
        <StatCard
          icon={Library}
          label="Archive"
          value={releasedEbooks.length}
          tone="emerald"
        />
      </div>

      <CycleSelect
        month={currentMonth}
        part={currentPart}
        onMonthChange={setCurrentMonth}
        onPartChange={setCurrentPart}
      />

      <div className="rounded-[22px] border border-white/10 bg-white/[0.035] p-3">
        <div className="mb-3">
          <div className="text-sm font-black tracking-[-0.03em] text-white">
            Module Progression
          </div>
          <div className="text-[11px] text-white/40">
            Canonical Learn order. Recommendations are archive-filtered.
          </div>
        </div>

        <div className="space-y-2">
          {coreModules.map((module, index) => (
            <ModuleCard
              key={module.id}
              module={module}
              index={index}
              releasedIds={releasedIds}
            />
          ))}
        </div>
      </div>

      <EbookArchiveList releasedIds={releasedIds} />
    </div>
  );
}