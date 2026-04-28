import React from "react";
import StreamTabs from "./StreamTabs";
import StreamPlayerSurface from "./StreamPlayerSurface";
import StreamCard from "./StreamCard";
import ActivityStreamSection from "./ActivityStreamSection";

export default function StreamPanelContent({
  activeTab,
  setActiveTab,
  activeItems,
  selectedItem,
  setSelectedForActiveTab,
  setMediaModalOpen,
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
              Watch, listen, go live, and feel the pulse of ZWAP.
            </p>
          </div>

          <StreamTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
      ) : (
        <div className="px-1 pb-3">
          <StreamTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-5 px-4 py-4">
          <div className="space-y-3">
            <div className="px-1">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] uppercase tracking-[0.22em] text-gray-500">
                  Featured Lane
                </p>

                {selectedItem ? (
                  <button
                    type="button"
                    onClick={() => setMediaModalOpen?.(true)}
                    className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200 transition hover:bg-cyan-500/15"
                  >
                    Open
                  </button>
                ) : null}
              </div>
            </div>

            <button
              type="button"
              onClick={() => selectedItem && setMediaModalOpen?.(true)}
              className="block w-full text-left"
            >
              <StreamPlayerSurface
                item={selectedItem}
                activeTab={activeTab}
              />
            </button>

            <div className="space-y-3">
              {activeItems.map((item) => (
                <StreamCard
                  key={item.id}
                  item={item}
                  tabId={activeTab}
                  active={selectedItem?.id === item.id}
                  onClick={() => setSelectedForActiveTab(item.id)}
                />
              ))}
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />

          <div className="pb-2">
            <ActivityStreamSection />
          </div>
        </div>
      </div>
    </div>
  );
}
