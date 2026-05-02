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
  showHeader = true,
}) {
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
          <div className="space-y-3">
            <div className="px-1">
              <p className="text-[11px] uppercase tracking-[0.22em] text-gray-500">
                Main Player
              </p>
            </div>

            <StreamPlayerSurface item={activeMode} activeTab={activeTab} />
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />

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
                <StreamCard
                  key={item.id}
                  item={item}
                  tabId={activeTab}
                  active={selectedPlaylist?.id === item.id}
                  onClick={() => setSelectedPlaylist?.(item)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}