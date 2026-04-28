import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Headphones,
  Radio,
  Video,
  X,
  PlayCircle,
} from "lucide-react";
import { connectSpotify } from "@/lib/spotify";

const connectYouTube = () => {
  alert("YouTube connection coming next");
};

const connectTwitch = () => {
  alert("Twitch connection coming next");
};

function getTabLabel(tabId) {
  switch (tabId) {
    case "watch":
      return "Watch Lane";
    case "listen":
      return "Listen Lane";
    case "live":
      return "Live Lane";
    case "library":
      return "Library Lane";
    default:
      return "Stream Lane";
  }
}

function getTabIcon(tabId) {
  switch (tabId) {
    case "watch":
      return Video;
    case "listen":
      return Headphones;
    case "live":
      return Radio;
    case "library":
      return BookOpen;
    default:
      return PlayCircle;
  }
}

export default function StreamMediaModal({
  open,
  item,
  activeTab,
  onClose,
}) {
  if (!open || !item) return null;

  const Icon = getTabIcon(activeTab);
  const isWatch = activeTab === "watch";
  const isListen = activeTab === "listen";
  const isLive = activeTab === "live";
  const isLibrary = activeTab === "library";

  return (
    <AnimatePresence>
      <motion.div
        key="stream-media-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[120] flex items-end justify-center bg-black/70 backdrop-blur-sm md:items-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="relative max-h-[90vh] w-full max-w-lg overflow-hidden rounded-t-[28px] border border-cyan-400/20 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.10),_rgba(10,11,30,0.98)_38%,_rgba(10,11,30,1)_100%)] text-white shadow-[0_20px_80px_rgba(0,0,0,0.55)] md:rounded-[28px]"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

          <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 pb-4 pt-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/25 bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
                <Icon className="h-5 w-5 text-cyan-300" />
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-300/75">
                  {getTabLabel(activeTab)}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm text-gray-400">{item.subtitle}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[calc(90vh-96px)] overflow-y-auto px-5 py-5">
            <div
              className={`rounded-[24px] border border-white/10 bg-gradient-to-br ${
                item.accent || "from-cyan-500/20 via-sky-500/10 to-purple-500/20"
              } p-5`}
            >
              <div className="rounded-[20px] border border-white/10 bg-black/20 p-4">
                {(isWatch || isLive) &&
                  item.type !== "youtube" &&
                  item.type !== "twitch" && (
                    <div className="flex min-h-[180px] items-center justify-center rounded-[18px] border border-white/10 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.08),_rgba(0,0,0,0.22))]">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-white/10">
                        <PlayCircle className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  )}

                {isWatch && item.type === "youtube" && (
                  <div className="space-y-4">
                    <div className="flex min-h-[160px] items-center justify-center rounded-[18px] border border-red-400/20 bg-[radial-gradient(circle_at_center,_rgba(239,68,68,0.14),_rgba(0,0,0,0.22))] px-4 text-center">
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
                    <div className="flex h-[120px] items-center justify-center rounded-[18px] border border-white/10 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.08),_rgba(0,0,0,0.22))] px-4">
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
                    <div className="flex min-h-[160px] items-center justify-center rounded-[18px] border border-violet-400/20 bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.16),_rgba(0,0,0,0.22))] px-4 text-center">
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
                  <div className="flex min-h-[180px] flex-col items-center justify-center rounded-[18px] border border-dashed border-white/12 bg-black/15 px-4 text-center">
                    <BookOpen className="mb-3 h-7 w-7 text-purple-200/90" />
                    <p className="font-medium text-white">ZWAP-owned media lives here</p>
                    <p className="mt-1 max-w-[26ch] text-sm text-gray-300/75">
                      Saved, unlocked, purchased, and exclusive ZWAP content can all
                      live in this lane.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-start justify-between gap-3">
                <p className="max-w-[32ch] text-sm leading-relaxed text-gray-200/80">
                  {item.description}
                </p>

                {item.reward ? (
                  <div className="shrink-0 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                    {item.reward}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
