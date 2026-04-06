import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { useApp } from "@/App";
import {
  Trophy,
  RefreshCw,
  Globe,
  MapPin,
  Orbit,
  Loader2,
  BarChart3,
} from "lucide-react";

const GAME_ROTATION = [
  { id: "breakerz", label: "Breakerz", color: "cyan" },
  { id: "brainz", label: "Brainz", color: "purple" },
  { id: "stackz", label: "Stackz", color: "pink" },
  { id: "pulze", label: "Pulze", color: "cyan" },
];

const SCOPE_OPTIONS = [
  { id: "local", label: "Local", icon: MapPin, enabled: false },
  { id: "regional", label: "Regional", icon: Orbit, enabled: false },
  { id: "global", label: "Global", icon: Globe, enabled: true },
];

const THEMES = {
  cyan: {
    shell:
      "border-cyan-400/20 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_34%),linear-gradient(180deg,rgba(7,20,28,0.96),rgba(7,14,20,0.98))]",
    panel:
      "border-cyan-400/14 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.10),_transparent_30%),linear-gradient(180deg,rgba(8,16,23,0.92),rgba(7,12,18,0.98))]",
    iconBg: "border-cyan-400/20 bg-cyan-400/10",
    accent: "text-cyan-300",
    activeTab:
      "border-cyan-400/35 bg-cyan-400/14 text-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.10)]",
    idleTab: "border-white/10 bg-white/5 text-white/60 hover:bg-white/10",
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
    activeTab:
      "border-violet-400/35 bg-violet-400/14 text-violet-200 shadow-[0_0_24px_rgba(168,85,247,0.10)]",
    idleTab: "border-white/10 bg-white/5 text-white/60 hover:bg-white/10",
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
    activeTab:
      "border-pink-400/35 bg-pink-400/14 text-pink-200 shadow-[0_0_24px_rgba(244,114,182,0.10)]",
    idleTab: "border-white/10 bg-white/5 text-white/60 hover:bg-white/10",
    bar: "from-pink-400 via-fuchsia-400 to-violet-400",
    userRow:
      "border-pink-400/24 bg-pink-400/[0.08] shadow-[0_0_24px_rgba(244,114,182,0.08)]",
  },
};

function normalizeRows(rows = []) {
  return rows.map((row, index) => ({
    rank: Number(row.rank ?? index + 1),
    username:
      row.username ||
      row.display_name ||
      row.name ||
      row.wallet ||
      row.wallet_address ||
      "zwapper",
    value: Number(row.value ?? row.score ?? 0),
    wallet: (row.wallet || row.wallet_address || "").toLowerCase(),
    tier: row.tier || "starter",
  }));
}

function getUserIdentity(user, walletAddress) {
  const wallet = (walletAddress || "").toLowerCase();
  const username = (user?.wallet_address || wallet)
    ? "You"
    : user?.username || "You";

  return {
    wallet,
    username,
  };
}

function buildDisplayRows(topRows = [], currentUserRow, currentWallet) {
  const normalizedTop = topRows.slice(0, 5);

  if (!currentWallet) {
    return normalizedTop.map((row) => ({
      ...row,
      isCurrentUser: false,
    }));
  }

  const topWithFlag = normalizedTop.map((row) => ({
    ...row,
    isCurrentUser: row.wallet === currentWallet,
  }));

  const userAlreadyInTop = topWithFlag.some((row) => row.isCurrentUser);
  if (userAlreadyInTop) return topWithFlag;

  if (!currentUserRow) return topWithFlag;

  return [
    ...topWithFlag.slice(0, 4),
    {
      ...currentUserRow,
      isCurrentUser: true,
      username: "You",
    },
  ];
}

function LeaderboardRows({ rows, gradientClass, userRowClass }) {
  const maxValue = Math.max(...rows.map((row) => row.value || 0), 1);

  return (
    <div className="space-y-3">
      {rows.map((entry) => {
        const width = Math.max((entry.value / maxValue) * 100, 8);

        return (
          <div
            key={`${entry.rank}-${entry.wallet || entry.username}`}
            className={`rounded-[20px] border p-3 ${
              entry.isCurrentUser
                ? userRowClass
                : "border-white/8 bg-black/20"
            }`}
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[11px] font-semibold text-white/75">
                  {entry.rank}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {entry.isCurrentUser ? "You" : entry.username}
                  </p>
                  <p className="truncate text-[11px] text-white/38">
                    {entry.isCurrentUser
                      ? entry.wallet || entry.tier
                      : entry.wallet || entry.tier}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-white">
                  {entry.value}
                </p>
              </div>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${gradientClass}`}
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function GameLeaderboard() {
  const { user, walletAddress } = useApp();

  const [gameIndex, setGameIndex] = useState(0);
  const [scope, setScope] = useState("global");
  const [topRows, setTopRows] = useState([]);
  const [currentUserRow, setCurrentUserRow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const activeGame = GAME_ROTATION[gameIndex];
  const theme = THEMES[activeGame.color];
  const currentUser = useMemo(
    () => getUserIdentity(user, walletAddress),
    [user, walletAddress]
  );

  const currentLabel = useMemo(() => {
    const scopeLabel =
      scope === "global" ? "Global" : scope === "regional" ? "Regional" : "Local";
    return `${activeGame.label} • ${scopeLabel}`;
  }, [activeGame, scope]);

  const displayedRows = useMemo(() => {
    return buildDisplayRows(topRows, currentUserRow, currentUser.wallet);
  }, [topRows, currentUserRow, currentUser.wallet]);

  const cycleGame = () => {
    setGameIndex((prev) => (prev + 1) % GAME_ROTATION.length);
  };

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      if (scope !== "global") {
        setTopRows([]);
        setCurrentUserRow(null);
        setError("Local and regional boards need location-based backend support.");
        return;
      }

      let topData = [];
      let userData = null;

      if (typeof api.getGameLeaderboard === "function") {
        const res = await api.getGameLeaderboard(activeGame.id, scope, 5);
        topData = Array.isArray(res) ? res : res?.entries || [];
      }

      if ((!Array.isArray(topData) || topData.length === 0) && typeof api.getLeaderboard === "function") {
        const fallback = await api.getLeaderboard("games", 5);
        topData = Array.isArray(fallback) ? fallback : [];
      }

      const normalizedTop = normalizeRows(topData);
      setTopRows(normalizedTop);

      if (currentUser.wallet) {
        const foundUser = normalizedTop.find((row) => row.wallet === currentUser.wallet);

        if (foundUser) {
          setCurrentUserRow({
            ...foundUser,
            username: "You",
          });
        } else {
          userData = {
            rank: user?.games_rank || user?.rank || 999,
            username: "You",
            value: Number(user?.games_played || 0),
            wallet: currentUser.wallet,
            tier: user?.tier || "starter",
          };
          setCurrentUserRow(userData);
        }
      } else {
        setCurrentUserRow(null);
      }
    } catch (err) {
      setTopRows([]);
      setCurrentUserRow(null);
      setError(err.message || "Failed to fetch leaderboard");
    } finally {
      setLoading(false);
    }
  }, [activeGame.id, scope, currentUser.wallet, user]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return (
    <div
      className={`rounded-[24px] border p-4 backdrop-blur-sm shadow-[0_14px_40px_rgba(0,0,0,0.28)] ${theme.shell}`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${theme.iconBg}`}
          >
            <Trophy className={`h-5 w-5 ${theme.accent}`} />
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white">Leaderboard</h3>
            <p className="truncate text-xs text-white/45">{currentLabel}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLeaderboard}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          <button
            onClick={cycleGame}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10"
          >
            {activeGame.label}
          </button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2">
        {SCOPE_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isActive = scope === option.id;

          return (
            <button
              key={option.id}
              onClick={() => option.enabled && setScope(option.id)}
              className={`flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                isActive
                  ? theme.activeTab
                  : option.enabled
                  ? theme.idleTab
                  : "border-white/8 bg-white/[0.03] text-white/25"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {option.label}
            </button>
          );
        })}
      </div>

      <div className={`rounded-[22px] border p-4 ${theme.panel}`}>
        {loading ? (
          <div className="flex items-center justify-center py-12 text-white/55">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading leaderboard...
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <BarChart3 className="h-4 w-4 text-white/40" />
            </div>
            <p className="text-sm font-medium text-white/70">{error}</p>
          </div>
        ) : displayedRows.length > 0 ? (
          <LeaderboardRows
            rows={displayedRows}
            gradientClass={theme.bar}
            userRowClass={theme.userRow}
          />
        ) : (
          <div className="py-8 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <BarChart3 className="h-4 w-4 text-white/40" />
            </div>
            <p className="text-sm font-medium text-white/70">
              No leaderboard entries yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}