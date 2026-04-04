import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Headphones,
  Lock,
  PlayCircle,
  Radio,
  Sparkles,
  Video,
} from "lucide-react";
import { connectSpotify } from "@/lib/spotify";

const connectYouTube = () => {
  alert("YouTube connection coming next");
};

const connectTwitch = () => {
  alert("Twitch connection coming next");
};

export default function StreamPlayerSurface({ item, activeTab }) {
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
      className={`relative overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-br ${item.accent || "from-cyan-500/20 via-sky-500/10 to-purple-500/20"} p-5`}
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
      </div>
    </motion.div>
  );
}