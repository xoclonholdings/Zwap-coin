import React from "react";
import { BookOpen, PlayCircle, X } from "lucide-react";

function HeaderIconButton({ onClick, children, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="
        flex h-9 w-9 items-center justify-center
        rounded-full
        border border-cyan-200/15
        bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),rgba(255,255,255,0.04))]
        text-cyan-100/78
        shadow-[0_0_14px_rgba(34,211,238,0.08)]
        transition active:scale-[0.97]
      "
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
  return (
    <div className="flex h-[58px] shrink-0 items-center justify-between border-b border-cyan-200/10 px-4">
      
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
          <HeaderIconButton onClick={onLearnOpen} label="Open Learn">
            <BookOpen size={16} strokeWidth={2.2} />
          </HeaderIconButton>
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