// 🎮 GAME REGISTRY — SINGLE SOURCE OF TRUTH
// All systems must reference THIS file for valid game IDs

import brainzLogo from "@/assets/games/brainz_game_logo.PNG";
import breakerzLogo from "@/assets/games/breakerz_game_logo.PNG";
import pulzeLogo from "@/assets/games/pulze_game_logo.PNG";
import stackzLogo from "@/assets/games/stackz_game_logo.PNG";
import triplezLogo from "@/assets/games/triplez_game_logo.PNG";
import werdzLogo from "@/assets/games/werdz_game_logo.PNG";

/**
 * ✅ CANONICAL GAME DEFINITIONS
 * Only these IDs are valid across the entire system
 */
export const GAMES = [
  {
    id: "brainz",
    name: "Brainz",
    icon: "🧠",
    logo: brainzLogo,
    mechanic: "Think fast. Answer sharp.",
    status: "live",
  },
  {
    id: "breakerz",
    name: "Breakerz",
    icon: "🧱",
    logo: breakerzLogo,
    mechanic: "Shatter walls. Clear the grid.",
    status: "live",
  },
  {
    id: "pulze",
    name: "Pulze",
    icon: "⚡",
    logo: pulzeLogo,
    mechanic: "Time the spin. Ride the rhythm.",
    status: "live",
  },
  {
    id: "stackz",
    name: "Stackz",
    icon: "🟦",
    logo: stackzLogo,
    mechanic: "Stack fast. Survive the drop.",
    status: "live",
  },
  {
    id: "triplez",
    name: "Triplez",
    icon: "💎",
    logo: triplezLogo,
    mechanic: "Match. Chain. Multiply.",
    status: "coming",
  },
  {
    id: "werdz",
    name: "Werdz",
    icon: "🔤",
    logo: werdzLogo,
    mechanic: "Find the pattern. Unlock the words.",
    status: "coming",
  },
];

/**
 * 🔁 LEGACY GAME ID TRANSLATION (READ-ONLY)
 *
 * These exist ONLY to translate old backend data.
 * They must NEVER be used as primary IDs.
 */
export const GAME_ALIASES = {
  ztrivia: "brainz",
  zbrickles: "breakerz",
  ztetris: "stackz",
  zslots: "pulze",
};

/**
 * 🧠 NORMALIZER (MANDATORY USAGE)
 * Converts ANY incoming game_id into canonical ID
 */
export function normalizeGameId(gameId) {
  if (!gameId) return null;

  const normalized = String(gameId).toLowerCase();

  // If already valid → return as-is
  if (GAMES.some((g) => g.id === normalized)) {
    return normalized;
  }

  // If legacy → translate
  if (GAME_ALIASES[normalized]) {
    return GAME_ALIASES[normalized];
  }

  return null;
}

/**
 * 🔍 SAFE GAME LOOKUP
 */
export function getGameById(gameId) {
  const normalized = normalizeGameId(gameId);
  if (!normalized) return null;

  return GAMES.find((g) => g.id === normalized) || null;
}

/**
 * 🎮 LIVE GAMES ONLY (for UI filtering)
 */
export function getLiveGames() {
  return GAMES.filter((g) => g.status === "live");
}