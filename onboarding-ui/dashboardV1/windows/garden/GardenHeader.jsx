import React from "react";

export default function GardenHeader({
  plantName = "Garden",
  statusLine = "Growing steadily.",
  rarePlantUnlocked = false,
  view = "plant",
  onToggleView,
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-emerald-300/75">
          Garden
        </p>
        <h3 className="mt-1 text-lg font-semibold text-white">
          {plantName || "Garden"}
        </h3>
        <p className="mt-1 text-sm text-white/72">{statusLine}</p>
      </div>

      <div className="flex items-center gap-2">
        {rarePlantUnlocked && (
          <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-cyan-200">
            Rare
          </span>
        )}

        <button
          type="button"
          onClick={onToggleView}
          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-white/65"
        >
          {view === "plant" ? "Stats" : "Plant"}
        </button>
      </div>
    </div>
  );
}