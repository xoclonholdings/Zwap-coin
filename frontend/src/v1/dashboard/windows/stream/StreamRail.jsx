import React, { useMemo, useState } from "react";
import StreamMediaModal from "./StreamMediaModal";
import StreamPanelContent from "./StreamPanelContent";
import {
  watchItems,
  listenItems,
  liveItems,
  libraryItems,
} from "./streamData";

export default function StreamRail() {
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
      <StreamPanelContent
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeItems={activeItems}
        selectedItem={selectedItem}
        setSelectedForActiveTab={setSelectedForActiveTab}
        setMediaModalOpen={setMediaModalOpen}
        showHeader={false}
      />

      <StreamMediaModal
        open={mediaModalOpen}
        item={selectedItem}
        activeTab={activeTab}
        onClose={() => setMediaModalOpen(false)}
      />
    </>
  );
}
