import React from "react";
import { Play, Pause, Music2, X } from "lucide-react";

export default function MiniStreamPlayer({
  visible = false,
  title = "ZWAP! Radio",
  subtitle = "Now Playing",
  artwork = null,
  isPlaying = false,
  onTogglePlay,
  onOpenStream,
  onClose,
}) {
  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-1/2 z-[210] w-full max-w-[430px] -translate-x-1/2 px-2 pb-2">
      <div className="flex items-center justify-between gap-3 rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,26,0.94),rgba(5,10,16,0.96))] px-3 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl">

        {/* LEFT: TITLE + ART */}
        <button
          type="button"
          onClick={onOpenStream}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
            {artwork ? (
              <img
                src={artwork}
                alt="artwork"
                className="h-full w-full object-cover"
              />
            ) : (
              <Music2 className="h-4 w-4 text-cyan-300" />
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate text-[12px] font-semibold text-white">
              {title}
            </p>
            <p className="truncate text-[10px] text-white/50">
              {subtitle}
            </p>
          </div>
        </button>

        {/* RIGHT: CONTROLS */}
        <div className="flex items-center gap-2">
          {/* FAKE PLAY (always routes to Stream) */}
          <button
            type="button"
            onClick={onOpenStream}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white active:scale-[0.96]"
          >
            <Play size={14} />
          </button>

          {/* REAL PLAY/PAUSE */}
          <button
            type="button"
            onClick={onTogglePlay}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white active:scale-[0.96]"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>

          {/* CLOSE */}
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/70 active:scale-[0.96]"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}