import React, { useMemo } from "react";
import {
  ChevronRight,
  Footprints,
  Flame,
  Clock3,
  Trophy,
} from "lucide-react";

const DEFAULT_GAME_BESTS = [
  { id: "stackz", label: "STACKZ High Score" },
  { id: "breakerz", label: "BREAKERZ High Score" },
  { id: "pulze", label: "PULZE High Score" },
  { id: "zap-man", label: "ZAP-MAN High Score" },
];

function formatValue(value) {
  if (value === null || value === undefined || value === "") return "--";
  if (typeof value === "number") return value.toLocaleString();
  return value;
}

function normalizeGameId(value = "") {
  return String(value || "").toLowerCase().trim();
}

function buildPersonalBestRows(personalBests = []) {
  const bestsByGame = {};

  if (Array.isArray(personalBests)) {
    personalBests.forEach((item) => {
      const gameId = normalizeGameId(item?.gameId || item?.game || item?.id);

      if (item?.type === "game" && gameId) {
        bestsByGame[gameId] = item;
      }
    });
  }

  return DEFAULT_GAME_BESTS.map((game) => {
    const saved = bestsByGame[game.id];

    return {
      type: "trophy",
      label: game.label,
      value: saved?.value ?? saved?.score ?? 0,
      date: saved?.date || "",
    };
  });
}

const ICONS = {
  steps: Footprints,
  calories: Flame,
  time: Clock3,
  trophy: Trophy,
  game: Trophy,
};

export default function ActivityPersonalBestsV1({
  personalBests = [],
  onViewAll,
}) {
  const rows = useMemo(
    () => buildPersonalBestRows(personalBests),
    [personalBests]
  );

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold text-white/70">
          Personal Bests
        </div>

        {typeof onViewAll === "function" ? (
          <button
            type="button"
            onClick={onViewAll}
            className="flex items-center gap-1 text-xs text-purple-300/80 transition active:scale-[0.97]"
          >
            View All
            <ChevronRight size={12} />
          </button>
        ) : null}
      </div>

      <div className="grid gap-2">
        {rows.map((item, index) => {
          const Icon = ICONS[item.type] || Trophy;

          return (
            <div
              key={`${item.label || "best"}-${index}`}
              className="flex items-center gap-2.5 rounded-[1.15rem] border border-white/10 bg-white/[0.03] px-3 py-2"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-cyan-300">
                <Icon size={16} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="truncate text-[11px] font-semibold text-white/58">
                  {item.label || "Personal Best"}
                </div>

                <div className="mt-0.5 truncate text-[13px] font-black text-white">
                  {formatValue(item.value)}
                </div>

                {item.date ? (
                  <div className="mt-0.5 truncate text-[9px] text-white/35">
                    {item.date}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}