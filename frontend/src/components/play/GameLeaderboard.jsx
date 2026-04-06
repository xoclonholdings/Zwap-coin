import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { useApp } from "@/App";
import { Trophy, RefreshCw, Loader2, BarChart3 } from "lucide-react";

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

function normalizeRows(rows = []) {
  return rows.map((row, index) => ({
    rank: Number(row.rank ?? index + 1),
    username: row.username || "",
    value: Number(row.value ?? 0),
    wallet: String(row.wallet || row.wallet_address || "").toLowerCase(),
    tier: row.tier || "starter",
  }));
}

function buildDisplayRows(topRows = [], currentUserRow = null, wallet = "") {
  const top5 = topRows.slice(0, 5);

  if (!wallet) {
    return top5.map((row) => ({ ...row, isCurrentUser: false }));
  }

  const topWithFlag = top5.map((row) => ({
    ...row,
    isCurrentUser: row.wallet === wallet,
  }));

  const userAlreadyInTop = topWithFlag.some((row) => row.isCurrentUser);
  if (userAlreadyInTop) {
    return topWithFlag;
  }

  if (!currentUserRow) {
    return topWithFlag;
  }

  return [
    ...topWithFlag.slice(0, 4),
    {
      ...currentUserRow,
      isCurrentUser: true,
      username: "You",
    },
  ];
}

export default function GameLeaderboard() {
  const { walletAddress } = useApp();

  const [gameIndex, setGameIndex] = useState(0);
  const [rows, setRows] = useState([]);
  const [userRow, setUserRow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const activeGame = GAME_ROTATION[gameIndex];
  const theme = THEMES[activeGame.color];
  const wallet = String(walletAddress || "").toLowerCase();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const topResponse = await api.getGameLeaderboard(activeGame.id, 5);
      const normalizedTop = normalizeRows(
        Array.isArray(topResponse) ? topResponse : []
      );
      setRows(normalizedTop);

      if (!wallet) {
        setUserRow(null);
        return;
      }

      const userResponse = await api.getUserGameRank(wallet, activeGame.id);

      if (userResponse?.found) {
        setUserRow({
          rank: Number(userResponse.global_rank || 0),
          value: Number(userResponse.value || 0),
          wallet,
          username: "You",
          tier: userResponse.tier || "starter",
        });
      } else {
        setUserRow(null);
      }
    } catch (err) {
      setRows([]);
      setUserRow(null);
      setError(err?.message || "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  }, [activeGame.id, wallet]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const displayRows = useMemo(() => {
    return buildDisplayRows(rows, userRow, wallet);
  }, [rows, userRow, wallet]);

  return (
    <div
      className={`rounded-[24px] border p-4 backdrop-blur-sm shadow-[0_14px_40px_rgba(0,0,0,0.28)] ${theme.shell}`}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${theme.iconBg}`}
          >
            <Trophy className={`h-4 w-4 ${theme.accent}`} />
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white">Leaderboard</h3>
            <p className="truncate text-xs text-white/50">{activeGame.label}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition hover:bg-white/10"
            aria-label="Refresh leaderboard"
          >
            <RefreshCw className="h-3 w-3 text-white/70" />
          </button>

          <button
            onClick={() =>
              setGameIndex((prev) => (prev + 1) % GAME_ROTATION.length)
            }
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/85 transition hover:bg-white/10"
          >
            {activeGame.label}
          </button>
        </div>
      </div>

      <div className={`rounded-[20px] border p-4 ${theme.panel}`}>
        {loading ? (
          <div className="flex items-center justify-center py-10 text-white/60">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </div>
        ) : error ? (
          <div className="py-10 text-center text-white/50">
            <BarChart3 className="mx-auto mb-2 h-5 w-5" />
            {error}
          </div>
        ) : displayRows.length > 0 ? (
          <div className="space-y-3">
            {displayRows.map((entry) => {
              const maxValue = Math.max(
                ...displayRows.map((row) => Number(row.value || 0)),
                1
              );
              const width = Math.max((entry.value / maxValue) * 100, 8);

              return (
                <div
                  key={`${entry.rank}-${entry.wallet || entry.username}`}
                  className={`rounded-xl border p-3 ${
                    entry.isCurrentUser
                      ? theme.userRow
                      : "border-white/10 bg-black/20"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[11px] font-semibold text-white/75">
                        {entry.rank}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {entry.isCurrentUser ? "You" : entry.username}
                        </p>
                        <p className="truncate text-[11px] text-white/38">
                          {entry.wallet || entry.tier}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-white">
                        {entry.value}
                      </p>
                    </div>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${theme.bar}`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-10 text-center text-white/50">
            <BarChart3 className="mx-auto mb-2 h-5 w-5" />
            No data yet
          </div>
        )}
      </div>
    </div>
  );
}