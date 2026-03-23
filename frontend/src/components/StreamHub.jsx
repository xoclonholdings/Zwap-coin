import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Headphones,
  Lock,
  PlayCircle,
  Radio,
  Sparkles,
  Video,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { connectSpotify } from "@/lib/spotify";

// Placeholder connection hooks until backend wiring is ready
const connectYouTube = () => {
  alert("YouTube connection coming next");
};

const connectTwitch = () => {
  alert("Twitch connection coming next");
};

const tabs = [
  { id: "watch", label: "Watch", icon: Video },
  { id: "listen", label: "Listen", icon: Headphones },
  { id: "live", label: "Live", icon: Radio },
  { id: "library", label: "Library", icon: BookOpen },
];

const watchItems = [
  {
    id: "watch-youtube",
    title: "YouTube",
    subtitle: "Connect your primary video source",
    type: "youtube",
    duration: "CONNECT",
    reward: null,
    description:
      "Bring creator clips, tutorials, trailers, Shorts-style content, and featured media into Stream.",
    accent: "from-red-500/20 via-fuchsia-500/10 to-purple-500/20",
  },
  {
    id: "watch-featured",
    title: "ZWAP! Feature Drop",
    subtitle: "Platform update preview",
    type: "video",
    duration: "01:18",
    reward: "+5 zPts",
    description:
      "Feature drops, creator content, sponsor media, and campaign previews can live here in a visual lane.",
    accent: "from-fuchsia-500/20 via-cyan-500/10 to-purple-500/20",
  },
  {
    id: "watch-recap",
    title: "Move Challenge Recap",
    subtitle: "Community highlight reel",
    type: "video",
    duration: "00:42",
    reward: "+3 zPts",
    description:
      "Short-form highlight content keeps the platform feeling active and gives events a stronger pulse.",
    accent: "from-cyan-500/20 via-sky-500/10 to-blue-500/20",
  },
];

const listenItems = [
  {
    id: "listen-spotify",
    title: "Spotify",
    subtitle: "Connect your personal audio source",
    type: "spotify",
    duration: "CONNECT",
    reward: null,
    description:
      "Bring your playlists into ZWAP! and soundtrack MOVE, PLAY, and focused sessions without leaving the experience.",
    accent: "from-green-500/20 via-emerald-500/10 to-lime-500/20",
  },
  {
    id: "listen-radio",
    title: "ZWAP! Radio",
    subtitle: "Curated stations and branded mixes",
    type: "radio",
    duration: "SOON",
    reward: null,
    description:
      "Mood lanes like MOVE, PLAY, FOCUS, and AFTER DARK can live here as native listening experiences.",
    accent: "from-cyan-500/20 via-sky-500/10 to-purple-500/20",
  },
];

const liveItems = [
  {
    id: "live-twitch",
    title: "Twitch",
    subtitle: "Connect your live stream source",
    type: "twitch",
    duration: "CONNECT",
    reward: null,
    description:
      "Bring gaming streams, live creator sessions, tournaments, and event broadcasts into the Stream experience.",
    accent: "from-violet-500/20 via-purple-500/10 to-fuchsia-500/20",
  },
  {
    id: "live-arena",
    title: "ZWAP! Arena",
    subtitle: "Competition stream lane",
    type: "live",
    duration: "LIVE",
    reward: "+8 zPts",
    description:
      "Perfect for tournaments, sponsor activations, countdown events, and community competitions.",
    accent: "from-red-500/20 via-pink-500/10 to-purple-500/20",
  },
  {
    id: "live-spotlight",
    title: "Creator Spotlight",
    subtitle: "Live event format",
    type: "live",
    duration: "LIVE",
    reward: "+10 zPts",
    description:
      "AMAs, launch moments, community check-ins, and featured live sessions can be surfaced here.",
    accent: "from-rose-500/20 via-orange-500/10 to-fuchsia-500/20",
  },
];

const libraryItems = [
  {
    id: "library-saved",
    title: "Saved Media",
    subtitle: "Your ZWAP collection lives here",
    type: "library",
    duration: "READY",
    reward: null,
    description:
      "Saved videos, unlocked content, premium drops, continue-watching states, and future ZWAP-exclusive media all land here.",
    accent: "from-violet-500/20 via-purple-500/10 to-cyan-500/20",
  },
  {
    id: "library-audio",
    title: "Owned Audio",
    subtitle: "Future premium and unlocked audio",
    type: "library",
    duration: "VAULT",
    reward: null,
    description:
      "Audiobooks, spoken-word content, exclusive drops, and purchased audio can live here as ZWAP expands.",
    accent: "from-cyan-500/20 via-indigo-500/10 to-purple-500/20",
  },
];

function PlayerSurface({ item, activeTab }) {
  if (!item) {
    return (
      <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.12),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(168,85,247,0.10),_transparent_35%)]" />
        <div className="relative flex min-h-[168px] flex-col justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-300/75">
              Stream Surface
            </p>
            <h3 className="mt-2 text-lg font-semibold text-white">
              Watch. Listen. Live.
            </h3>
            <p className="mt-2 max-w-[28ch] text-sm leading-relaxed text-gray-400">
              An optional amenity layer for media, live events, and ZWAP-owned
              content.
            </p>
          </div>

          <div className="mt-5 flex items-center gap-2 text-xs text-gray-400">
            <Sparkles className="h-4 w-4 text-cyan-300" />
            Select a card below to preview the lane
          </div>
        </div>
      </div>
    );
  }

  const isWatch = activeTab === "watch";
  const isListen = activeTab === "listen";
  const isLive = activeTab === "live";
  const isLibrary = activeTab === "library";

  return (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.22 }}
      className={`relative overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-br ${item.accent} p-5`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_42%)]" />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.24em] text-white/65">
              {isWatch
                ? "Watch Lane"
                : isListen
                  ? "Listen Lane"
                  : isLive
                    ? "Live Lane"
                    : "Library Lane"}
            </p>

            <h3 className="mt-2 truncate text-lg font-semibold text-white">
              {item.title}
            </h3>

            <p className="mt-1 text-sm text-gray-200/85">{item.subtitle}</p>
          </div>

          <div
            className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium ${
              isLive && item.duration === "LIVE"
                ? "border-red-300/20 bg-red-500/15 text-red-100"
                : "border-white/15 bg-black/20 text-white/80"
            }`}
          >
            {item.duration || "READY"}
          </div>
        </div>

        <div className="mt-5 rounded-[20px] border border-white/10 bg-black/20 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          {(isWatch || isLive) &&
            item.type !== "youtube" &&
            item.type !== "twitch" && (
              <div className="flex min-h-[132px] items-center justify-center rounded-[18px] border border-white/10 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.08),_rgba(0,0,0,0.22))]">
                <motion.div
                  whileTap={{ scale: 0.96 }}
                  className="flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-white/10 backdrop-blur"
                >
                  <PlayCircle className="h-8 w-8 text-white" />
                </motion.div>
              </div>
            )}

          {isWatch && item.type === "youtube" && (
            <div className="space-y-4">
              <div className="flex min-h-[108px] items-center justify-center rounded-[18px] border border-red-400/20 bg-[radial-gradient(circle_at_center,_rgba(239,68,68,0.14),_rgba(0,0,0,0.22))] px-4 text-center">
                <div>
                  <Video className="mx-auto mb-3 h-8 w-8 text-red-300" />
                  <p className="font-medium text-white">Primary Video Source</p>
                  <p className="mt-1 text-sm text-gray-300">
                    Connect YouTube to anchor the Watch experience.
                  </p>
                </div>
              </div>

              <button
                onClick={connectYouTube}
                className="w-full rounded-xl border border-red-400/30 bg-gradient-to-r from-red-500/30 to-fuchsia-500/30 px-4 py-3 text-sm font-semibold text-white shadow-[0_0_18px_rgba(239,68,68,0.18)] transition hover:brightness-110"
              >
                Connect YouTube
              </button>
            </div>
          )}

          {isListen && (
            <div className="space-y-4">
              <div className="flex h-[84px] items-center justify-center rounded-[18px] border border-white/10 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.08),_rgba(0,0,0,0.22))] px-4">
                <div className="flex w-full items-end gap-1">
                  {[18, 28, 22, 38, 26, 45, 20, 34, 24, 30, 16, 36].map(
                    (height, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 rounded-full bg-white/70"
                        animate={{ height: [height, height + 14, height] }}
                        transition={{
                          duration: 1.2 + (i % 4) * 0.15,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        style={{ height }}
                      />
                    ),
                  )}
                </div>
              </div>

              {item.type === "spotify" && (
                <button
                  onClick={connectSpotify}
                  className="w-full rounded-xl border border-green-400/30 bg-gradient-to-r from-green-500/30 to-emerald-500/30 px-4 py-3 text-sm font-semibold text-white shadow-[0_0_18px_rgba(34,197,94,0.18)] transition hover:brightness-110"
                >
                  Connect Spotify
                </button>
              )}
            </div>
          )}

          {isLive && item.type === "twitch" && (
            <div className="space-y-4">
              <div className="flex min-h-[108px] items-center justify-center rounded-[18px] border border-violet-400/20 bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.16),_rgba(0,0,0,0.22))] px-4 text-center">
                <div>
                  <Radio className="mx-auto mb-3 h-8 w-8 text-violet-300" />
                  <p className="font-medium text-white">Primary Live Source</p>
                  <p className="mt-1 text-sm text-gray-300">
                    Connect Twitch for creator streams, gaming, and live events.
                  </p>
                </div>
              </div>

              <button
                onClick={connectTwitch}
                className="w-full rounded-xl border border-violet-400/30 bg-gradient-to-r from-violet-500/30 to-purple-500/30 px-4 py-3 text-sm font-semibold text-white shadow-[0_0_18px_rgba(139,92,246,0.18)] transition hover:brightness-110"
              >
                Connect Twitch
              </button>
            </div>
          )}

          {isLibrary && (
            <div className="flex min-h-[132px] flex-col items-center justify-center rounded-[18px] border border-dashed border-white/12 bg-black/15 px-4 text-center">
              <Lock className="mb-3 h-7 w-7 text-purple-200/90" />
              <p className="font-medium text-white">ZWAP-owned media lives here</p>
              <p className="mt-1 max-w-[26ch] text-sm text-gray-300/75">
                Saved, unlocked, purchased, and exclusive ZWAP content can all
                live in this lane.
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="max-w-[28ch] text-sm leading-relaxed text-gray-200/80">
            {item.description}
          </p>

          {item.reward ? (
            <div className="shrink-0 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">
              {item.reward}
            </div>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}

function StreamCard({ item, active, onClick, tabId }) {
  const iconMap = {
    watch: Video,
    listen: Headphones,
    live: Radio,
    library: BookOpen,
  };

  const Icon = iconMap[tabId] || PlayCircle;
  const isLiveBadge = item.duration === "LIVE";

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.985 }}
      className={`w-full rounded-[22px] border p-4 text-left transition-all ${
        active
          ? "border-cyan-400/30 bg-white/[0.06] shadow-[0_0_24px_rgba(34,211,238,0.10)]"
          : "border-white/8 bg-white/[0.03] hover:bg-white/[0.05]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
            active
              ? "border-cyan-400/25 bg-gradient-to-br from-cyan-500/20 to-purple-500/20"
              : "border-white/10 bg-white/[0.04]"
          }`}
        >
          <Icon
            className={`h-5 w-5 ${active ? "text-cyan-300" : "text-gray-300"}`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="truncate font-semibold text-white">{item.title}</h4>

            {item.duration ? (
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${
                  isLiveBadge
                    ? "border border-red-400/30 bg-red-500/15 text-red-200"
                    : "border border-white/10 bg-white/5 text-gray-300"
                }`}
              >
                {item.duration}
              </span>
            ) : null}
          </div>

          <p className="mt-1 text-sm text-gray-400">{item.subtitle}</p>

          {item.reward ? (
            <div className="mt-3 inline-flex rounded-full border border-cyan-300/15 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-medium text-cyan-200">
              {item.reward}
            </div>
          ) : null}
        </div>
      </div>
    </motion.button>
  );
}

export default function StreamHub({ open, onOpenChange }) {
  const [activeTab, setActiveTab] = useState("watch");
  const [selectedItems, setSelectedItems] = useState({
    watch: watchItems[0].id,
    listen: listenItems[0].id,
    live: liveItems[0].id,
    library: libraryItems[0].id,
  });

  const activeItems = useMemo(() => {
    switch (activeTab) {
      case "watch":
        return watchItems;
      case "listen":
        return listenItems;
      case "live":
        return liveItems;
      case "library":
        return libraryItems;
      default:
        return [];
    }
  }, [activeTab]);

  const selectedItem = useMemo(() => {
    const currentId = selectedItems[activeTab];
    return (
      activeItems.find((item) => item.id === currentId) || activeItems[0] || null
    );
  }, [activeItems, activeTab, selectedItems]);

  const setSelectedForActiveTab = (itemId) => {
    setSelectedItems((prev) => ({
      ...prev,
      [activeTab]: itemId,
    }));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto mb-4 flex h-[78vh] w-[calc(100%-24px)] max-w-md flex-col overflow-hidden rounded-[28px] border border-cyan-400/20 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.08),_rgba(10,11,30,0.98)_38%,_rgba(10,11,30,1)_100%)] px-0 text-white shadow-[0_-20px_60px_rgba(0,0,0,0.55)]"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
        <div className="mx-auto mt-1 h-1.5 w-12 rounded-full bg-white/12" />
        <div className="mx-auto mt-1 h-px w-24 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

        <SheetHeader className="shrink-0 border-b border-cyan-500/10 px-5 pb-3 pt-2">
          <div className="flex items-center gap-3">
            <motion.div
              className="flex h-11 w-11 items-center justify-center rounded-full border border-cyan-400/25 bg-gradient-to-br from-cyan-500/20 to-purple-500/20"
              animate={{
                boxShadow: [
                  "0 0 10px rgba(34,211,238,0.18)",
                  "0 0 22px rgba(168,85,247,0.18)",
                  "0 0 10px rgba(34,211,238,0.18)",
                ],
              }}
              transition={{ duration: 2.8, repeat: Infinity }}
            >
              <Sparkles className="h-5 w-5 text-cyan-300" />
            </motion.div>

            <div className="min-w-0">
              <SheetTitle className="text-left text-xl font-semibold tracking-wide text-white">
                Stream
              </SheetTitle>
              <p className="text-xs text-gray-400">
                Watch • Listen • Live • Library
              </p>
            </div>
          </div>
        </SheetHeader>

        <div className="shrink-0 px-5 pt-4">
          <div className="grid grid-cols-4 gap-2 rounded-[22px] border border-white/6 bg-white/[0.03] p-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileTap={{ scale: 0.98 }}
                  className={`rounded-2xl px-2 py-3 text-[11px] font-medium transition-all ${
                    isActive
                      ? "border border-cyan-400/30 bg-gradient-to-r from-cyan-500/20 via-sky-500/15 to-purple-500/20 text-white shadow-[0_0_18px_rgba(34,211,238,0.12)]"
                      : "border border-transparent bg-white/[0.02] text-gray-400 hover:bg-white/[0.05] hover:text-gray-200"
                  }`}
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <Icon className="h-4 w-4" />
                    <span className="leading-none">{tab.label}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-4 pb-6">
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              <PlayerSurface
                key={selectedItem?.id || activeTab}
                item={selectedItem}
                activeTab={activeTab}
              />
            </AnimatePresence>

            <div className="px-1">
              <p className="text-[11px] uppercase tracking-[0.22em] text-gray-500">
                {activeTab === "watch" && "Featured Watch Lane"}
                {activeTab === "listen" && "Featured Listen Lane"}
                {activeTab === "live" && "Featured Live Lane"}
                {activeTab === "library" && "Your ZWAP Library"}
              </p>
            </div>

            <div className="space-y-3">
              {activeItems.map((item) => (
                <StreamCard
                  key={item.id}
                  item={item}
                  tabId={activeTab}
                  active={selectedItem?.id === item.id}
                  onClick={() => setSelectedForActiveTab(item.id)}
                />
              ))}
            </div>

            <div className="rounded-2xl border border-cyan-500/10 bg-gradient-to-r from-cyan-500/[0.04] to-purple-500/[0.04] p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-300/80">
                Stream amenity
              </p>
              <p className="mt-2 text-sm text-gray-400">
                Stream is an optional layer. Users never need it to get full use
                from ZWAP, but it adds culture, media, and live energy to the
                ecosystem.
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}