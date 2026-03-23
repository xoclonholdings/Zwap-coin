import React, { useMemo, useState } from "react";
import { Crown, Footprints, Medal, Trophy } from "lucide-react";

const DEFAULT_ENTRIES = [
  { rank: 1, name: "NovaRunner271", steps: 18420, reward: 412.6 },
  { rank: 2, name: "PixelWalker118", steps: 16280, reward: 356.2 },
  { rank: 3, name: "EchoStrider504", steps: 14990, reward: 321.8 },
  { rank: 4, name: "HyperGlider229", steps: 13240, reward: 278.4 },
  { rank: 5, name: "SolarVoyager090", steps: 11875, reward: 241.9 },
];

function RankIcon({ rank }) {
  if (rank === 1) return <Crown className="h-4 w-4 text-amber-300" />;
  if (rank === 2) return <Trophy className="h-4 w-4 text-cyan-300" />;
  if (rank === 3) return <Medal className="h-4 w-4 text-violet-300" />;
  return (
    <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-1.5 text-[11px] font-semibold text-white/70">
      {rank}
    </span>
  );
}

export default function MoveLeaderboard({
  entries = DEFAULT_ENTRIES,
  userEntry = null,
}) {
  const [range, setRange] = useState("daily");

  const rankedEntries = useMemo(() => {
    return [...entries]
      .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999))
      .slice(0, 5);
  }, [entries]);

  return (
    <div className="rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.08),_transparent_24%),linear-gradient(180deg,rgba(10,16,23,0.96),rgba(8,12,18,0.98))] p-4 backdrop-blur-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-cyan-300" />
            <h3 className="text-sm font-semibold text-white">
              Movers Board
            </h3>
          </div>
          <p className="mt-1 text-sm text-white/50">
            Top movement momentum across ZWAP!
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.04] p-1">
          <button
            type="button"
            onClick={() => setRange("daily")}
            className={`rounded-xl px-3 py-1.5 text-[11px] font-medium transition ${
              range === "daily"
                ? "bg-cyan-400/10 text-cyan-300"
                : "text-white/45 hover:text-white/70"
            }`}
          >
            Daily
          </button>

          <button
            type="button"
            onClick={() => setRange("weekly")}
            className={`rounded-xl px-3 py-1.5 text-[11px] font-medium transition ${
              range === "weekly"
                ? "bg-violet-400/10 text-violet-300"
                : "text-white/45 hover:text-white/70"
            }`}
          >
            Weekly
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {rankedEntries.map((entry) => (
          <div
            key={`${entry.rank}-${entry.name}`}
            className="rounded-2xl border border-white/8 bg-black/20 px-3 py-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                <RankIcon rank={entry.rank} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-semibold text-white">
                    {entry.name}
                  </p>
                  <p className="shrink-0 text-[11px] font-medium text-cyan-300">
                    {Number(entry.reward || 0).toFixed(1)} ZWAP
                  </p>
                </div>

                <div className="mt-1 flex items-center gap-2 text-[11px] text-white/45">
                  <Footprints className="h-3.5 w-3.5 text-cyan-300" />
                  <span>{Number(entry.steps || 0).toLocaleString()} steps</span>
                  <span>•</span>
                  <span>{range === "daily" ? "today" : "this week"}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {userEntry ? (
        <div className="mt-3 rounded-[22px] border border-cyan-400/14 bg-cyan-400/[0.05] p-3">
          <p className="text-[11px] uppercase tracking-wide text-cyan-200/65">
            Your Position
          </p>

          <div className="mt-2 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">
                Rank #{userEntry.rank ?? "--"}
              </p>
              <p className="mt-1 text-[11px] text-white/50">
                {Number(userEntry.steps || 0).toLocaleString()} steps •{" "}
                {Number(userEntry.reward || 0).toFixed(1)} ZWAP
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] font-medium text-white/70">
              {range === "daily" ? "Daily board" : "Weekly board"}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}