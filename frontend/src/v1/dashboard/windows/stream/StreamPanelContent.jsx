import React from "react";
import { ArrowLeft } from "lucide-react";

import StreamTabs from "./StreamTabs";
import StreamPlayerSurface from "./StreamPlayerSurface";
import StreamCard from "./StreamCard";

export default function StreamPanelContent({
  activeTab,
  setActiveTab,
  activeMode,
  playlistItems = [],
  selectedPlaylist,
  setSelectedPlaylist,
  onOpenLibrary,
  onClose,
  showHeader = true,
}) {
  function handleSelectPlaylist(item) {
    setSelectedPlaylist?.(item);
  }

  function handleOpenPlaylist(item) {
    setSelectedPlaylist?.(item);
    onOpenLibrary?.();
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {showHeader ? (
        <div className="mb-5 flex items-center justify-between px-4 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/80 transition active:scale-[0.96]"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="text-center">
            <div className="text-xs uppercase tracking-[0.18em] text-white/40">
              Stream
            </div>
            <div className="text-[15px] font-semibold tracking-[-0.02em] text-white">
              Library
            </div>
          </div>

          <div className="w-10" />
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
        <div className="flex flex-col gap-3">
          <StreamPlayerSurface item={activeMode} activeTab={activeTab} />

          <StreamTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="min-h-0">
            <div className="mb-2 px-1">
              <p className="text-[13px] font-black text-white">
                Recommended for you
              </p>
              <p className="text-[10px] text-white/50">
                Playlists for MOVE, PLAY, Focus, and Chill.
              </p>
            </div>

            <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-2">
              {playlistItems.map((item) => (
                <div key={item.id} className="w-[31%] shrink-0">
                  <StreamCard
                    item={item}
                    tabId={activeTab}
                    active={selectedPlaylist?.id === item.id}
                    onClick={() => handleSelectPlaylist(item)}
                    onOpen={() => handleOpenPlaylist(item)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}