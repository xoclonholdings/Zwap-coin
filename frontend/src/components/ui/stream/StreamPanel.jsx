import React, { useMemo, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import StreamMediaModal from "./StreamMediaModal";
import StreamPanelContent from "./StreamPanelContent";

import {
  watchItems,
  listenItems,
  liveItems,
  libraryItems,
} from "./streamData";

export default function StreamPanel({ open, onOpenChange }) {
  const [activeTab, setActiveTab] = useState("watch");
  const [mediaModalOpen, setMediaModalOpen] = useState(false);

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
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="left"
          className="h-full w-[calc(100vw-20px)] max-w-[420px] border-r border-cyan-400/20 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.08),_rgba(10,11,30,0.98)_38%,_rgba(10,11,30,1)_100%)] p-0 text-white sm:w-[400px] lg:w-[420px]"
        >
          <StreamPanelContent
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            activeItems={activeItems}
            selectedItem={selectedItem}
            setSelectedForActiveTab={setSelectedForActiveTab}
            setMediaModalOpen={setMediaModalOpen}
            showHeader={true}
          />
        </SheetContent>
      </Sheet>

      <StreamMediaModal
        open={mediaModalOpen}
        item={selectedItem}
        activeTab={activeTab}
        onClose={() => setMediaModalOpen(false)}
      />
    </>
  );
}