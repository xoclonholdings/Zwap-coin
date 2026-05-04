import React from "react";
import { Music2, Pause, Play, VolumeX } from "lucide-react";

export default function MiniStreamPlayer({
  visible = false,
  title = "ZWAP! Radio",
  subtitle = "Now Playing",
  artwork = null,
  onOpenStream,
  variant = "floating",
}) {
  if (!visible) return null;

  if (variant === "header") {
    return (
      <div className="flex h-8 shrink-0 items-center gap-1 rounded-full border border-cyan-400/35 bg-cyan-500/10 px-1 shadow-[0_0_14px_rgba(34,211,238,0.16)]">
        <button
          type="button"
          onClick={onOpenStream}
          aria-label={title}
          className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.04] active:scale-[0.96]"
        >
          {artwork ? (
            <img
              src={artwork}
              alt=""
              className="h-full w-full object-cover"
              draggable={false}
            />
          ) : (
            <Music2 size={12} className="text-cyan-300" />
          )}
        </button>

        <button
          type="button"
          onClick={onOpenStream}
          aria-label="Open Stream"
          className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.05] text-white/80 active:scale-[0.96]"
        >
          <Play size={12} />
        </button>

        <button
          type="button"
          onClick={onOpenStream}
          aria-label="Open Stream controls"
          className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.05] text-white/80 active:scale-[0.96]"
        >
          <Pause size={12} />
        </button>

        <button
          type="button"
          onClick={onOpenStream}
          aria-label="Open Stream audio"
          className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.05] text-white/60 active:scale-[0.96]"
        >
          <VolumeX size={12} />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-1/2 z-[210] w-full max-w-[430px] -translate-x-1/2 px-2 pb-2">
      <button
        type="button"
        onClick={onOpenStream}
        className="flex w-full items-center gap-3 rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,26,0.94),rgba(5,10,16,0.96))] px-3 py-2 text-left shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl active:scale-[0.98]"
      >
        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
          {artwork ? (
            <img
              src={artwork}
              alt=""
              className="h-full w-full object-cover"
              draggable={false}
            />
          ) : (
            <Music2 className="h-4 w-4 text-cyan-300" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-semibold text-white">
            {title}
          </p>
          <p className="truncate text-[10px] text-white/50">{subtitle}</p>
        </div>
      </button>
    </div>
  );
}