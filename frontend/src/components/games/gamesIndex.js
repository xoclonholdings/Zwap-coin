// GAME REGISTRY (single source of truth)

import brainzLogo from "@/assets/games/brainz_game_logo.PNG";
import breakerzLogo from "@/assets/games/breakerz_game_logo.PNG";
import pulzeLogo from "@/assets/games/pulze_game_logo.PNG";
import stackzLogo from "@/assets/games/stackz_game_logo.PNG";
import triplezLogo from "@/assets/games/triplez_game_logo.PNG";
import werdzLogo from "@/assets/games/werdz_game_logo.PNG";

export const GAMES = [
  {
    id: "brainz",
    name: "Brainz",
    icon: "🧠",
    logo: brainzLogo,
    status: "live",
  },
  {
    id: "breakerz",
    name: "Breakerz",
    icon: "🧱",
    logo: breakerzLogo,
    status: "live",
  },
  {
    id: "pulze",
    name: "Pulze",
    icon: "⚡",
    logo: pulzeLogo,
    status: "live",
  },
  {
    id: "stackz",
    name: "Stackz",
    icon: "🟦",
    logo: stackzLogo,
    status: "live",
  },
  {
    id: "triplez",
    name: "Triplez",
    icon: "💎",
    logo: triplezLogo,
    status: "coming",
  },
  {
    id: "werdz",
    name: "Werdz",
    icon: "🔤",
    logo: werdzLogo,
    status: "coming",
  },
];

// 🔁 BACKWARD COMPATIBILITY (OLD → NEW)
export const GAME_ALIASES = {
  ztrivia: "brainz",
  zbrickles: "breakerz",
  ztetris: "stackz",
  zslots: "pulze",
};