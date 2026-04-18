import React from "react";
import { BookOpen, PlayCircle, X } from "lucide-react";

function HeaderIconButton({ onClick, children, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={[
        "flex h-9 w-9 items-center justify-center rounded-full border",
        "border-white/10 bg-white/[0.04] text-white/70 transition",
        "active:scale-[0.98]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function AccountHeaderV1({
  title = "Account",
  onClose,
  onAdminTap,
  learnUnlocked = false,
  streamUnlocked = false,
  onLearnOpen,
  onStreamOpen,
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/8 px-4 py-4">
      <button
        type="button"
        onClick={onAdminTap}
        className="text-left text-sm font-semibold tracking-[-0.02em] text-white/88"
      >
        {title}
      </button>

      <div className="flex items-center gap-2">
        {learnUnlocked ? (
          <HeaderIconButton onClick={onLearnOpen} label="Open Learn">
            <BookOpen size={16} strokeWidth={2} />
          </HeaderIconButton>
        ) : null}

        {streamUnlocked ? (
          <HeaderIconButton onClick={onStreamOpen} label="Open Stream">
            <PlayCircle size={16} strokeWidth={2} />
          </HeaderIconButton>
        ) : null}

        <HeaderIconButton onClick={onClose} label="Close account drawer">
          <X size={16} strokeWidth={2} />
        </HeaderIconButton>
      </div>
    </div>
  );
}