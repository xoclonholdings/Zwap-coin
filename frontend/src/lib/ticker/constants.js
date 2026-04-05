import {
  Sparkles,
  Footprints,
  Gamepad2,
  ShoppingBag,
  Bell,
  Film,
  Bitcoin,
  Newspaper,
  Globe,
  UserRound,
  HeartHandshake,
  ChevronRight,
} from "lucide-react";

export const TICKER_CATEGORY = {
  YOU: "YOU",
  MOVE: "MOVE",
  PLAY: "PLAY",
  SHOP: "SHOP",
  SYSTEM: "SYSTEM",
  ENTERTAINMENT: "ENTERTAINMENT",
  CRYPTO_MARKET: "CRYPTO_MARKET",
  CURRENT_EVENTS: "CURRENT_EVENTS",
  WORLD: "WORLD",
  DID_YOU_KNOW: "DID_YOU_KNOW",
};

export const ALWAYS_ON_CATEGORIES = [
  TICKER_CATEGORY.YOU,
  TICKER_CATEGORY.DID_YOU_KNOW,
];

export const OPTIONAL_CATEGORIES = [
  TICKER_CATEGORY.MOVE,
  TICKER_CATEGORY.PLAY,
  TICKER_CATEGORY.SHOP,
  TICKER_CATEGORY.SYSTEM,
  TICKER_CATEGORY.ENTERTAINMENT,
  TICKER_CATEGORY.CRYPTO_MARKET,
  TICKER_CATEGORY.CURRENT_EVENTS,
  TICKER_CATEGORY.WORLD,
];

export const ROTATION_MS = 12000;
export const FADE_MS = 325;
export const STORAGE_KEY = "zwap_ticker_preferences_v1";

export const TICKER_META = {
  [TICKER_CATEGORY.YOU]: {
    icon: UserRound,
    chip: "YOU",
    color: "text-fuchsia-300",
    chipClass: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-400/20",
  },
  [TICKER_CATEGORY.MOVE]: {
    icon: Footprints,
    chip: "MOVE",
    color: "text-cyan-300",
    chipClass: "bg-cyan-500/15 text-cyan-300 border-cyan-400/20",
  },
  [TICKER_CATEGORY.PLAY]: {
    icon: Gamepad2,
    chip: "PLAY",
    color: "text-violet-300",
    chipClass: "bg-violet-500/15 text-violet-300 border-violet-400/20",
  },
  [TICKER_CATEGORY.SHOP]: {
    icon: ShoppingBag,
    chip: "SHOP",
    color: "text-amber-300",
    chipClass: "bg-amber-500/15 text-amber-300 border-amber-400/20",
  },
  [TICKER_CATEGORY.SYSTEM]: {
    icon: Bell,
    chip: "SYSTEM",
    color: "text-green-300",
    chipClass: "bg-green-500/15 text-green-300 border-green-400/20",
  },
  [TICKER_CATEGORY.ENTERTAINMENT]: {
    icon: Film,
    chip: "ENT",
    color: "text-pink-300",
    chipClass: "bg-pink-500/15 text-pink-300 border-pink-400/20",
  },
  [TICKER_CATEGORY.CRYPTO_MARKET]: {
    icon: Bitcoin,
    chip: "MARKET",
    color: "text-orange-300",
    chipClass: "bg-orange-500/15 text-orange-300 border-orange-400/20",
  },
  [TICKER_CATEGORY.CURRENT_EVENTS]: {
    icon: Newspaper,
    chip: "NEWS",
    color: "text-blue-300",
    chipClass: "bg-blue-500/15 text-blue-300 border-blue-400/20",
  },
  [TICKER_CATEGORY.WORLD]: {
    icon: Globe,
    chip: "WORLD",
    color: "text-sky-300",
    chipClass: "bg-sky-500/15 text-sky-300 border-sky-400/20",
  },
  [TICKER_CATEGORY.DID_YOU_KNOW]: {
    icon: Sparkles,
    chip: "DID YOU KNOW",
    color: "text-emerald-300",
    chipClass: "bg-emerald-500/15 text-emerald-300 border-emerald-400/20",
  },
};

export const CTA_META = {
  assist: {
    icon: HeartHandshake,
    label: "Assist",
  },
  source: {
    icon: ChevronRight,
    label: "See More",
  },
};
