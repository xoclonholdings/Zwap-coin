import React, { useMemo, useState } from "react";

import StreamPanelContent from "./StreamPanelContent";
import StreamMediaModal from "./StreamMediaModal";

import { streamModes, playlistItems } from "./streamData";

export default function StreamPanel({ open, onOpenChange }) {
  const [activeTab, setActiveTab] = useState("zwap-radio");
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const activeMode = useMemo(() => {
    return streamModes.find((mode) => mode.id === activeTab) || null;
  }, [activeTab]);

  function handleClose() {
    onOpenChange?.(false);
  }

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[220] bg-black/80 backdrop-blur-md">
        <div className="mx-auto flex h-[100dvh] w-full max-w-[430px] flex-col bg-[#050510] text-white">
          <StreamPanelContent
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            activeMode={activeMode}
            playlistItems={playlistItems}
            selectedPlaylist={selectedPlaylist}
            setSelectedPlaylist={setSelectedPlaylist}
          />
        </div>
      </div>

      <StreamMediaModal
        open={libraryOpen}
        item={selectedPlaylist}
        activeTab="library"
        onClose={() => setLibraryOpen(false)}
      />
    </>
  );
}