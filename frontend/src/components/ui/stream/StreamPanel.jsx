import React, { useMemo, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";

import StreamTabs from "./StreamTabs";
import StreamPlayerSurface from "./StreamPlayerSurface";
import StreamCard from "./StreamCard";
import ActivityStreamSection from "./ActivityStreamSection";

import {
  watchItems,
  listenItems,
  liveItems,
  libraryItems,
} from "./streamData";

export default function StreamPanel({ open, onOpenChange }) {
  const [activeTab, setActiveTab] = useState("watch");

  const [selectedItems, setSelectedItems] = useState({
    watch: watchItems[0].id,
    listen: listenItems[0].id,
    live: liveItems[0].id,
    library: libraryItems[0].id,
  });

  const activeItems = useMemo(() => {
    switch (activeTab) {
      case "watch":
        return watchItems;
      case "listen":
        return listenItems;
      case "live":
        return liveItems;
      case "library":
        return libraryItems;
      default:
        return [];
    }
  }, [activeTab]);

  const selectedItem = useMemo(() => {
    const currentId = selectedItems[activeTab];
    return (
      activeItems.find((item) => item.id === currentId) ||
      activeItems[0] ||
      null
    );
  }, [activeItems, activeTab, selectedItems]);

  const setSelectedForActiveTab = (itemId) => {
    setSelectedItems((prev) => ({
      ...prev,
      [activeTab]: itemId,
    }));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="h-full w-[380px] border-r border-cyan-400/20 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.08),_rgba(10,11,30,0.98)_38%,_rgba(10,11,30,1)_100%)] p-0 text-white"
      >
        <div className="flex h-full min-h-0 flex-col">
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

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="space-y-5 px-4 py-4">
              <div className="space-y-3">
                <div className="px-1">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-gray-500">
                    Featured Lane
                  </p>
                </div>

                <StreamPlayerSurface
                  item={selectedItem}
                  activeTab={activeTab}
                />

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
      </SheetContent>
    </Sheet>
  );
}