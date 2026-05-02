import React from "react";

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
  showHeader = true,
}) {
  function handleSelectPlaylist(item) {
    setSelectedPlaylist?.(item);
  }

  function handleOpenPlaylist(item) {
    setSelectedPlaylist?.(item);
    onOpenLibrary?.(); // 🔑 bridge to library modal
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {showHeader ? (
        <div className="border-b border-white/10 px-4 pb-4 pt-4">
          <div className="mb-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-300/80">
              Stream
            </p>
            <p className="mt-1 text-sm text-gray-400">
              ZWAP! Radio, Spotify, Apple Music, and playlist lanes.
            </p>
          </div>

          <StreamTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      ) : (
        <div className="px-1 pb-3">
          <StreamTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-5 px-4 py-4">
          {/* MAIN PLAYER */}
          <div className="space-y-3">
            <div className="px-1">
              <p className="text-[11px] uppercase tracking-[0.22em] text-gray-500">
                Main Player
              </p>
            </div>

            <StreamPlayerSurface item={activeMode} activeTab={activeTab} />
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />

          {/* PLAYLISTS */}
          <div>
            <div className="mb-2 px-1">
              <p className="text-[13px] font-black text-white">
                Recommended for you
              </p>
              <p className="text-[10px] text-white/50">
                Playlists for MOVE, PLAY, Focus, and Chill.
              </p>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {playlistItems.map((item) => (
                <div key={item.id} className="w-[78%] shrink-0">
                  <StreamCard
                    item={item}
                    tabId={activeTab}
                    active={selectedPlaylist?.id === item.id}
                    onClick={() => handleSelectPlaylist(item)}
                  />

                  {/* OPEN BUTTON (no design break) */}
                  {selectedPlaylist?.id === item.id && (
                    <button
                      type="button"
                      onClick={() => handleOpenPlaylist(item)}
                      className="mt-1 w-full rounded-xl border border-cyan-400/20 bg-cyan-500/10 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-200"
                    >
                      Open Playlist
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}