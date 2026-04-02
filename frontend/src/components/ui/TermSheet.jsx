import { useEffect } from "react";
import { getTermDefinition } from "@/data/termDefinitions";

export default function TermSheet({ term, isOpen, onClose }) {
  const data = getTermDefinition(term);

  // Close on ESC
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !data) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
      onClick={onClose}
    >
      {/* Sheet */}
      <div
        className="w-full max-w-md rounded-t-2xl bg-[#0f172a] p-5 shadow-xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-500/40" />

        {/* Title */}
        <h2 className="text-xl font-bold text-white mb-2">
          {data.title}
        </h2>

        {/* Description */}
        <p className="text-sm text-gray-300 mb-3">
          {data.description}
        </p>

        {/* Why it matters */}
        <p className="text-sm text-blue-400 mb-5">
          {data.whyItMatters}
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-gray-700 py-2 text-white"
          >
            Close
          </button>

          {data.learnMorePath && (
            <button
              onClick={() => {
                onClose();
                window.location.href = data.learnMorePath;
              }}
              className="flex-1 rounded-lg bg-gradient-to-r from-cyan-400 to-purple-500 py-2 font-semibold text-black"
            >
              Learn More
            </button>
          )}
        </div>
      </div>
    </div>
  );
}