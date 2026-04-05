import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  RefreshCw,
  ChevronRight,
  Globe,
  MapPin,
  Orbit,
  Loader2,
  BarChart3,
} from "lucide-react";

const GAME_ROTATION = [
  { id: "zbrickles", label: "zBrickles", color: "cyan" },
  { id: "ztrivia", label: "zTrivia", color: "purple" },
  { id: "ztetris", label: "zTetris", color: "pink" },
  { id: "zslots", label: "zSpin", color: "cyan" },
];

const SCOPE_OPTIONS = [
  { id: "local", label: "Local", icon: MapPin, enabled: false },
  { id: "regional", label: "Regional", icon: Orbit, enabled: false },
  { id: "global", label: "Global", icon: Globe, enabled: true },
];

const THEMES = {
  cyan: {
    shell:
      "border-cyan-400/20 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_transparent_32%),linear-gradient(180deg,rgba(7,19,27,0.96),rgba(7,14,20,0.98))]",
    chipActive: "border-cyan-400/30 bg-cyan-400/12 text-cyan-200",
    chipIdle: "border-white/10 bg-white/5 text-white/60 hover:bg-white/10",
    accent: "text-cyan-300",
    graph: "from-cyan-400 via-teal-400 to-violet-400",
    iconBg: "border-cyan-400/20 bg-cyan-400/10",
  },
  purple: {
    shell:
      "border-violet-400/20 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),_transparent_32%),linear-gradient(180deg,rgba(16,10,31,0.96),rgba(11,10,22,0.98))]",
    chipActive: "border-violet-400/30 bg-violet-400/12 text-violet-200",
    chipIdle: "border-white/10 bg-white/5 text-white/60 hover:bg-white/10",
    accent: "text-violet-300",
    graph: "from-violet-400 via-fuchsia-400 to-cyan-400",
    iconBg: "border-violet-400/20 bg-violet-400/10",
  },
  pink: {
    shell:
      "border-pink-400/20 bg-[radial-gradient(circle_at_top,_rgba(244,114,182,0.18),_transparent_32%),linear-gradient(180deg,rgba(28,10,25,0.96),rgba(14,9,18,0.98))]",
    chipActive: "border-pink-400/30 bg-pink-400/12 text-pink-200",
    chipIdle: "border-white/10 bg-white/5 text-white/60 hover:bg-white/10",
    accent: "text-pink-300",
    graph: "from-pink-400 via-fuchsia-400 to-violet-400",
    iconBg: "border-pink-400/20 bg-pink-400/10",
  },
};

function normalizeRows(rows = []) {
  return rows.map((row, index) => ({
    rank: row.rank || index + 1,
    username: row.username || row.wallet || row.wallet_address || "zwapper",
    value: Number(row.value ?? row.score ?? 0),
    wallet: row.wallet || row.wallet_address || "",
    tier: row.tier || "starter",
  }));
}

function LeaderboardBars({ rows, gradientClass }) {
  const maxValue = Math.max(...rows.map((row) => row.value || 0), 1);

  return (
    <div className="space-y-3">
      {rows.map((entry) => {
        const width = Math.max((entry.value / maxValue) * 100, 10);

        return (
          <div key={`${entry.rank}-${entry.username}`} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3 text-xs">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[11px] font-semibold text-white/70">
                  {entry.rank}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white/85">
                    {entry.username}
                  </p>
                  <p className="truncate text-[11px] text-white/35">
                    {entry.wallet || entry.tier}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-white">{entry.value}</p>
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
  const [gameIndex, setGameIndex] = useState(0);
  const [scope, setScope] = useState("global");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [popup, setPopup] = useState({
    open: false,
    message: "",
  });

  const activeGame = GAME_ROTATION[gameIndex];
  const theme = THEMES[activeGame.color];

  const currentLabel = useMemo(() => {
    const scopeLabel =
      scope === "global" ? "Global" : scope === "regional" ? "Regional" : "Local";
    return `${activeGame.label} • ${scopeLabel}`;
  }, [activeGame, scope]);

  const cycleGame = () => {
    setGameIndex((prev) => (prev + 1) % GAME_ROTATION.length);
  };

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      if (scope !== "global") {
        setRows([]);
        setError("Local and regional game boards need location-based backend support.");
        return;
      }

      let data = [];

      if (typeof api.getGameLeaderboard === "function") {
        const res = await api.getGameLeaderboard(activeGame.id, scope, 5);
        data = Array.isArray(res) ? res : res?.entries || [];
      }

      if (!Array.isArray(data) || data.length === 0) {
        const fallback = await api.getLeaderboard("games", 5);
        data = Array.isArray(fallback) ? fallback : [];
      }

      setRows(normalizeRows(data));
    } catch (err) {
      setRows([]);
      setError(err.message || "Failed to fetch leaderboard");
    } finally {
      setLoading(false);
    }
  }, [activeGame.id, scope]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return (
    <>
      <div
        className={`rounded-[24px] border p-4 backdrop-blur-sm shadow-[0_14px_40px_rgba(0,0,0,0.24)] ${theme.shell}`}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${theme.iconBg}`}
            >
              <Trophy className={`h-4.5 w-4.5 ${theme.accent}`} />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white">Leaderboard</h3>
              <p className="text-xs text-white/45">{currentLabel}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={fetchLeaderboard}
              variant="outline"
              className="h-9 rounded-xl border-white/10 bg-white/5 px-3 text-white hover:bg-white/10"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>

            <Button
              onClick={cycleGame}
              variant="outline"
              className="h-9 rounded-xl border-white/10 bg-white/5 px-3 text-white hover:bg-white/10"
            >
              {activeGame.label}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {SCOPE_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isActive = scope === option.id;

            return (
              <button
                key={option.id}
                onClick={() => {
                  if (!option.enabled) {
                    setPopup({
                      open: true,
                      message: `${option.label} game boards need location-based backend support.`,
                    });
                    return;
                  }
                  setScope(option.id);
                }}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                  isActive
                    ? theme.chipActive
                    : option.enabled
                      ? theme.chipIdle
                      : "border-white/8 bg-white/[0.03] text-white/25"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="rounded-[22px] border border-white/8 bg-black/20 p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-white/55">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading leaderboard...
            </div>
          ) : error ? (
            <div className="py-6 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                <BarChart3 className="h-4 w-4 text-white/40" />
              </div>
              <p className="text-sm font-medium text-white/70">{error}</p>
            </div>
          ) : rows.length > 0 ? (
            <LeaderboardBars rows={rows} gradientClass={theme.graph} />
          ) : (
            <div className="py-6 text-center">
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

      {popup.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[1.75rem] border border-cyan-400/30 bg-[#0f1029] p-5 text-center shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <p className="mb-4 text-sm leading-relaxed text-white/80">
              {popup.message}
            </p>

            <Button
              onClick={() => setPopup({ open: false, message: "" })}
              className="h-11 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-base font-semibold hover:from-cyan-400 hover:to-purple-400"
            >
              Got it
            </Button>
          </div>
        </div>
      )}
    </>
  );
}