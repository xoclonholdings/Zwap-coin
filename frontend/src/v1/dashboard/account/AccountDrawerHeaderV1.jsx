import React, { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, PlayCircle, X } from "lucide-react";

import { getSavedArchivedEbookCards } from "../windows/learn/data/ebooks";

function HeaderIconButton({ onClick, children, label, active = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={[
        "flex h-9 w-9 items-center justify-center rounded-full border bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),rgba(255,255,255,0.04))] text-cyan-100/78 shadow-[0_0_14px_rgba(34,211,238,0.08)] transition active:scale-[0.97]",
        active
          ? "border-cyan-300/35 bg-cyan-400/10 text-cyan-100"
          : "border-cyan-200/15",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function AccountDrawerHeaderV1({
  title = "Account",
  onClose,
  onAdminTap,
  learnUnlocked = false,
  streamUnlocked = false,
  onLearnOpen,
  onStreamOpen,
}) {
  const [learnArchiveOpen, setLearnArchiveOpen] = useState(false);
  const [archiveVersion, setArchiveVersion] = useState(0);
  const learnMenuRef = useRef(null);

  const archivedEbooks = useMemo(() => {
    archiveVersion;

    return getSavedArchivedEbookCards().sort((a, b) => {
      return Number(a?.releaseOrder || 999) - Number(b?.releaseOrder || 999);
    });
  }, [archiveVersion]);

  useEffect(() => {
    if (!learnArchiveOpen) return undefined;

    setArchiveVersion((current) => current + 1);

    function handlePointerDown(event) {
      if (
        learnMenuRef.current &&
        !learnMenuRef.current.contains(event.target)
      ) {
        setLearnArchiveOpen(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [learnArchiveOpen]);

  const handleToggleLearnArchive = () => {
    setLearnArchiveOpen((current) => !current);
  };

  const handleOpenArchivedEbook = (ebook) => {
    setLearnArchiveOpen(false);

    onLearnOpen?.({
      mode: "archive",
      ebook,
    });
  };

  return (
    <div className="relative flex h-[58px] shrink-0 items-center justify-between border-b border-cyan-200/10 px-4">
      {/* LEFT: ICON + TITLE */}
      <button
        type="button"
        onClick={onAdminTap}
        className="flex items-center gap-2"
      >
        {/* ICON (matches SHOP style) */}
        <div
          className="
            flex h-7 w-7 items-center justify-center
            rounded-full
            border border-cyan-200/20
            bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),rgba(255,255,255,0.05))]
            text-[13px]
            shadow-[0_0_12px_rgba(34,211,238,0.10)]
          "
        >
          👤
        </div>

        {/* PREMIUM TITLE */}
        <span
          className="
            text-[15px] font-semibold
            tracking-[0.08em]
            text-white/92
            drop-shadow-[0_0_8px_rgba(255,255,255,0.12)]
          "
        >
          {title}
        </span>
      </button>

      {/* RIGHT: ACTIONS */}
      <div className="flex items-center gap-2">
        {learnUnlocked ? (
          <div ref={learnMenuRef} className="relative">
            <HeaderIconButton
              onClick={handleToggleLearnArchive}
              label="Open Learn Archive"
              active={learnArchiveOpen}
            >
              <BookOpen size={16} strokeWidth={2.2} />
            </HeaderIconButton>

            {learnArchiveOpen ? (
              <div className="absolute right-0 top-11 z-[60] w-[238px] overflow-hidden rounded-2xl border border-cyan-200/15 bg-[#06111d]/95 p-2 shadow-[0_0_28px_rgba(34,211,238,0.12)] backdrop-blur-xl">
                <div className="px-2 pb-2 pt-1">
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-200/70">
                    Learn Archive
                  </div>
                  <div className="mt-0.5 text-[10px] leading-3 text-white/45">
                    Saved eBooks appear here.
                  </div>
                </div>

                <div className="max-h-[260px] overflow-y-auto pr-1">
                  {archivedEbooks.length > 0 ? (
                    archivedEbooks.map((ebook) => (
                      <button
                        key={ebook.id}
                        type="button"
                        onClick={() => handleOpenArchivedEbook(ebook)}
                        className="mb-1 w-full rounded-xl border border-cyan-200/10 bg-white/[0.035] px-3 py-2 text-left transition active:scale-[0.98]"
                      >
                        <div className="line-clamp-1 text-xs font-black text-white">
                          {ebook.title}
                        </div>

                        <div className="mt-1 flex items-center justify-between gap-2">
                          <span className="text-[9px] uppercase tracking-[0.12em] text-white/35">
                            Archived
                          </span>

                          <span className="text-[10px] font-black text-cyan-300">
                            Read
                          </span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-3 text-[11px] leading-4 text-white/45">
                      No saved eBooks yet.
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {streamUnlocked ? (
          <HeaderIconButton onClick={onStreamOpen} label="Open Stream">
            <PlayCircle size={16} strokeWidth={2.2} />
          </HeaderIconButton>
        ) : null}

        {/* CLOSE — NO CONTAINER */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close account drawer"
          className="
            flex items-center justify-center
            text-white/70
            transition active:scale-[0.95]
          "
        >
          <X size={20} strokeWidth={2.6} />
        </button>
      </div>
    </div>
  );
}