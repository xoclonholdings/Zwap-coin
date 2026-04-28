import React, { useMemo, useState } from "react";
import {
  Gamepad2,
  Lock,
  Unlock,
  Plus,
  Image,
  Save,
  Trash2,
} from "lucide-react";

import AdminSectionCardV1 from "./AdminSectionCardV1";
import AdminStatusPillV1 from "./AdminStatusPillV1";

const DEFAULT_GAMES = [
  {
    id: "stackz",
    name: "Stackz",
    status: "unlocked",
    phase: "Phase A",
    logoUrl: "",
    rewardProfile: "Standard progression",
  },
  {
    id: "breakerz",
    name: "Breakerz",
    status: "unlocked",
    phase: "Phase A",
    logoUrl: "",
    rewardProfile: "Standard progression",
  },
  {
    id: "pulze",
    name: "Pulze",
    status: "unlocked",
    phase: "Phase A",
    logoUrl: "",
    rewardProfile: "Standard progression",
  },
  {
    id: "zap-man",
    name: "Zap-Man",
    status: "unlocked",
    phase: "Phase A",
    logoUrl: "",
    rewardProfile: "Standard progression",
  },
  {
    id: "brainz",
    name: "Brainz",
    status: "locked",
    phase: "Phase B",
    logoUrl: "",
    rewardProfile: "Learn-linked",
  },
  {
    id: "werdz",
    name: "Werdz",
    status: "locked",
    phase: "Phase B",
    logoUrl: "",
    rewardProfile: "Learn-linked",
  },
  {
    id: "triplez",
    name: "Triplez",
    status: "locked",
    phase: "Phase B",
    logoUrl: "",
    rewardProfile: "Future unlock",
  },
];

function buildGameId(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function GameRow({ game, onToggle, onRemove, onUpdateLogo }) {
  const isUnlocked = game.status === "unlocked";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-cyan-400/15 bg-cyan-500/10">
          {game.logoUrl ? (
            <img
              src={game.logoUrl}
              alt={`${game.name} logo`}
              className="h-full w-full object-cover"
            />
          ) : (
            <Gamepad2 className="h-5 w-5 text-cyan-300" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">
                {game.name}
              </div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-cyan-300/55">
                {game.phase}
              </div>
            </div>

            <AdminStatusPillV1 tone={isUnlocked ? "active" : "locked"}>
              {isUnlocked ? "Unlocked" : "Locked"}
            </AdminStatusPillV1>
          </div>

          <div className="mt-2 text-xs leading-5 text-white/50">
            {game.rewardProfile}
          </div>

          <label className="mt-3 block">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
              Logo URL
            </span>
            <input
              value={game.logoUrl}
              onChange={(event) => onUpdateLogo(game.id, event.target.value)}
              placeholder="Paste logo image URL"
              className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-xs text-white outline-none placeholder:text-white/25 focus:border-cyan-400/35"
            />
          </label>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => onToggle(game.id)}
              className={[
                "flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border text-xs font-semibold transition active:scale-[0.98]",
                isUnlocked
                  ? "border-white/10 bg-white/[0.04] text-white/55"
                  : "border-cyan-400/25 bg-cyan-500/10 text-cyan-200",
              ].join(" ")}
            >
              {isUnlocked ? (
                <>
                  <Lock className="h-4 w-4" />
                  Lock
                </>
              ) : (
                <>
                  <Unlock className="h-4 w-4" />
                  Unlock
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onRemove(game.id)}
              className="flex h-10 w-11 items-center justify-center rounded-xl border border-red-400/20 bg-red-500/10 text-red-300 transition active:scale-[0.98]"
              aria-label={`Remove ${game.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPlaySectionV1() {
  const [games, setGames] = useState(DEFAULT_GAMES);
  const [newGameName, setNewGameName] = useState("");
  const [newGameLogoUrl, setNewGameLogoUrl] = useState("");
  const [newGamePhase, setNewGamePhase] = useState("Phase B");

  const stats = useMemo(() => {
    const unlocked = games.filter((game) => game.status === "unlocked").length;
    const locked = games.length - unlocked;

    return {
      total: games.length,
      unlocked,
      locked,
    };
  }, [games]);

  const handleToggleGame = (gameId) => {
    setGames((currentGames) =>
      currentGames.map((game) => {
        if (game.id !== gameId) return game;

        return {
          ...game,
          status: game.status === "unlocked" ? "locked" : "unlocked",
        };
      })
    );
  };

  const handleUpdateLogo = (gameId, logoUrl) => {
    setGames((currentGames) =>
      currentGames.map((game) => {
        if (game.id !== gameId) return game;

        return {
          ...game,
          logoUrl,
        };
      })
    );
  };

  const handleRemoveGame = (gameId) => {
    setGames((currentGames) =>
      currentGames.filter((game) => game.id !== gameId)
    );
  };

  const handleAddGame = () => {
    const safeName = newGameName.trim();
    const safeLogoUrl = newGameLogoUrl.trim();
    const id = buildGameId(safeName);

    if (!safeName || !id) return;

    setGames((currentGames) => {
      const idExists = currentGames.some((game) => game.id === id);

      if (idExists) return currentGames;

      return [
        ...currentGames,
        {
          id,
          name: safeName,
          status: "locked",
          phase: newGamePhase,
          logoUrl: safeLogoUrl,
          rewardProfile: "Pending reward profile",
        },
      ];
    });

    setNewGameName("");
    setNewGameLogoUrl("");
    setNewGamePhase("Phase B");
  };

  return (
    <div className="space-y-4">
      <AdminSectionCardV1 title="Play System">
        Manage V1 game visibility, locked games, logo references, and future
        game additions. Unlocking a game here should mirror the V1 progression
        order, not bypass it.
      </AdminSectionCardV1>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <div className="text-[10px] uppercase tracking-[0.14em] text-white/35">
            Total
          </div>
          <div className="mt-1 text-lg font-bold text-white">{stats.total}</div>
        </div>

        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3">
          <div className="text-[10px] uppercase tracking-[0.14em] text-emerald-300/70">
            Open
          </div>
          <div className="mt-1 text-lg font-bold text-emerald-200">
            {stats.unlocked}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <div className="text-[10px] uppercase tracking-[0.14em] text-white/35">
            Locked
          </div>
          <div className="mt-1 text-lg font-bold text-white">{stats.locked}</div>
        </div>
      </div>

      <div className="rounded-2xl border border-cyan-400/15 bg-cyan-500/[0.06] p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Plus className="h-4 w-4 text-cyan-300" />
          Add New Game
        </div>

        <div className="mt-3 space-y-3">
          <input
            value={newGameName}
            onChange={(event) => setNewGameName(event.target.value)}
            placeholder="Game name"
            className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-cyan-400/35"
          />

          <div className="flex items-center gap-2">
            <Image className="h-4 w-4 shrink-0 text-cyan-300/70" />
            <input
              value={newGameLogoUrl}
              onChange={(event) => setNewGameLogoUrl(event.target.value)}
              placeholder="Logo URL"
              className="h-11 min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-cyan-400/35"
            />
          </div>

          <select
            value={newGamePhase}
            onChange={(event) => setNewGamePhase(event.target.value)}
            className="h-11 w-full rounded-xl border border-white/10 bg-[#07101b] px-3 text-sm text-white outline-none focus:border-cyan-400/35"
          >
            <option value="Phase A">Phase A</option>
            <option value="Phase B">Phase B</option>
            <option value="Phase C">Phase C</option>
            <option value="Phase D">Phase D</option>
          </select>

          <button
            type="button"
            onClick={handleAddGame}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/25 bg-cyan-500/15 text-sm font-semibold text-cyan-100 transition active:scale-[0.98]"
          >
            <Save className="h-4 w-4" />
            Add Game Locked
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {games.map((game) => (
          <GameRow
            key={game.id}
            game={game}
            onToggle={handleToggleGame}
            onRemove={handleRemoveGame}
            onUpdateLogo={handleUpdateLogo}
          />
        ))}
      </div>

      <AdminSectionCardV1 title="Reward Distribution">
        Game rewards should remain progression-based. Early rounds should give
        minimal reward, stronger play should scale, and all outputs must still
        pass through reward_service.
      </AdminSectionCardV1>
    </div>
  );
}
