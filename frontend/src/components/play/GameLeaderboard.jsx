import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { useApp } from "@/App";
import {
  Trophy,
  RefreshCw,
  Globe,
  Loader2,
  BarChart3,
} from "lucide-react";

// ---------------------------------------------------------------------------
// CONFIG
// ---------------------------------------------------------------------------

const GAME_ROTATION = [
  { id: "breakerz", label: "Breakerz", color: "cyan" },
  { id: "brainz", label: "Brainz", color: "purple" },
  { id: "stackz", label: "Stackz", color: "pink" },
  { id: "pulze", label: "Pulze", color: "cyan" },
];

const THEMES = {
  cyan: {
    shell:
      "border-cyan-400/20 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_34%),linear-gradient(180deg,rgba(7,20,28,0.96),rgba(7,14,20,0.98))]",
    panel:
      "border-cyan-400/14 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.10),_transparent_30%),linear-gradient(180deg,rgba(8,16,23,0.92),rgba(7,12,18,0.98))]",
    iconBg: "border-cyan-400/20 bg-cyan-400/10",
    accent: "text-cyan-300",
    bar: "from-cyan-400 via-teal-400 to-violet-400",
    userRow:
      "border-cyan-400/24 bg-cyan-400/[0.08] shadow-[0_0_24px_rgba(34,211,238,0.08)]",
  },
  purple: {
    shell:
      "border-violet-400/20 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),_transparent_34%),linear-gradient(180deg,rgba(18,11,36,0.96),rgba(10,10,22,0.98))]",
    panel:
      "border-violet-400/14 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.10),_transparent_30%),linear-gradient(180deg,rgba(16,10,31,0.92),rgba(11,10,22,0.98))]",
    iconBg: "border-violet-400/20 bg-violet-400/10",
    accent: "text-violet-300",
    bar: "from-violet-400 via-fuchsia-400 to-cyan-400",
    userRow:
      "border-violet-400/24 bg-violet-400/[0.08] shadow-[0_0_24px_rgba(168,85,247,0.08)]",
  },
  pink: {
    shell:
      "border-pink-400/20 bg-[radial-gradient(circle_at_top,_rgba(244,114,182,0.18),_transparent_34%),linear-gradient(180deg,rgba(27,10,24,0.96),rgba(14,9,18,0.98))]",
    panel:
      "border-pink-400/14 bg-[radial-gradient(circle_at_top,_rgba(244,114,182,0.10),_transparent_30%),linear-gradient(180deg,rgba(27,10,24,0.92),rgba(14,9,18,0.98))]",
    iconBg: "border-pink-400/20 bg-pink-400/10",
    accent: "text-pink-300",
    bar: "from-pink-400 via-fuchsia-400 to-violet-400",
    userRow:
      "border-pink-400/24 bg-pink-400/[0.08] shadow-[0_0_24px_rgba(244,114,182,0.08)]",
  },
};

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

function normalizeRows(rows = []) {
  return rows.map((row, index) => ({
    rank: Number(row.rank ?? index + 1),
    username: row.username || "zwapper",
    value: Number(row.value ?? 0),
    wallet: (row.wallet || row.wallet_address || "").toLowerCase(),
    tier: row.tier || "starter",
  }));
}

function buildDisplayRows(topRows, currentUserRow, wallet) {
  const top5 = topRows.slice(0, 5);

  if (!wallet) return top5;

  const inTop = top5.some((r) => r.wallet === wallet);
  if (inTop) return top5.map((r) => ({ ...r, isCurrentUser: r.wallet === wallet }));

  if (!currentUserRow) return top5;

  return [
    ...top5.slice(0, 4),
    { ...currentUserRow, isCurrentUser: true, username: "You" },
  ];
}

// ---------------------------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------------------------

export default function GameLeaderboard() {
  const { walletAddress } = useApp();

  const [gameIndex, setGameIndex] = useState(0);
  const [rows, setRows] = useState([]);
  const [userRow, setUserRow] = useState(null);
  const [loading, setLoading] = useState(false);

  const activeGame = GAME_ROTATION[gameIndex];
  const theme = THEMES[activeGame.color];
  const wallet = (walletAddress || "").toLowerCase();

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      const top = await api.getGameLeaderboard(activeGame.id, 5);
      const normalized = normalizeRows(top);

      setRows(normalized);

      if (wallet) {
        const user = await api.getUserGameRank(wallet, activeGame.id);
        if (user?.found) {
          setUserRow({
            rank: user.global_rank,
            value: user.value,
            wallet,
            username: "You",
            tier: user.tier,
          });
        }
      }
    } catch {
      setRows([]);
      setUserRow(null);
    } finally {
      setLoading(false);
    }
  }, [activeGame.id, wallet]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const displayRows = useMemo(
    () => buildDisplayRows(rows, userRow, wallet),
    [rows, userRow, wallet]
  );

  return (
    <div className={`rounded-[24px] border p-4 ${theme.shell}`}>
      {/* HEADER */}
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl border ${theme.iconBg}`}>
            <Trophy className={`h-4 w-4 ${theme.accent}`} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Leaderboard</h3>
            <p className="text-xs text-white/50">{activeGame.label}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="h-8 w-8 flex items-center justify-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10"
          >
            <RefreshCw className="h-3 w-3 text-white/70" />
          </button>

          <button
            onClick={() => setGameIndex((i) => (i + 1) % GAME_ROTATION.length)}
            className="text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10"
          >
            {activeGame.label}
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className={`rounded-[20px] border p-4 ${theme.panel}`}>
        {loading ? (
          <div className="text-center py-10 text-white/60">
            <Loader2 className="animate-spin inline mr-2" />
            Loading...
          </div>
        ) : displayRows.length > 0 ? (
          <div className="space-y-3">
            {displayRows.map((r) => {
              const max = Math.max(...displayRows.map((x) => x.value), 1);
              const width = (r.value / max) * 100;

              return (
                <div
                  key={r.rank}
                  className={`p-3 rounded-xl border ${
                    r.isCurrentUser
                      ? theme.userRow
                      : "border-white/10 bg-black/20"
                  }`}
                >
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-white">
                      {r.isCurrentUser ? "You" : r.username}
                    </span>
                    <span className="text-sm text-white">{r.value}</span>
                  </div>

                  <div className="h-2 bg-white/10 rounded-full">
                    <div
                      className={`h-full bg-gradient-to-r ${theme.bar}`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 text-white/50">
            <BarChart3 className="mx-auto mb-2" />
            No data yet
          </div>
        )}
      </div>
    </div>
  );
}