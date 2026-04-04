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
        className="h-full w-[380px] border-r border-cyan-400/20 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.08),_rgba(10,11,30,0.98)_38%,_rgba(10,11,30,1)_100%)] text-white"
      >
        <div className="flex h-full flex-col">
          <div className="px-4 pt-4">
            <StreamTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </div>

          <div className="px-4 pt-4">
            <StreamPlayerSurface
              item={selectedItem}
              activeTab={activeTab}
            />
          </div>

          <div className="flex-1 overflow-y-auto px-4 pt-4 space-y-3">
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

          <div className="border-t border-white/10 p-4">
            <ActivityStreamSection />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}