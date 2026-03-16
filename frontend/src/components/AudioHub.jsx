import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Music4,
  Radio,
  Headphones,
  BookOpen,
  Play,
  Lock,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const tabs = [
  { id: "radio", label: "ZWAP! Radio", icon: Radio },
  { id: "spotify", label: "Spotify", icon: Headphones },
  { id: "library", label: "Library", icon: BookOpen },
];

const zwapPlaylists = [
  {
    id: "move",
    title: "ZWAP! Move Mix",
    description: "Energy for walking, motion, and momentum",
  },
  {
    id: "play",
    title: "ZWAP! Play Mode",
    description: "Arcade-ready sound for game sessions",
  },
  {
    id: "focus",
    title: "ZWAP! Focus",
    description: "Clean focus for building, browsing, and flow",
  },
  {
    id: "afterdark",
    title: "ZWAP! After Dark",
    description: "Late-night atmosphere and neon drift",
  },
];

export default function AudioHub({ open, onOpenChange }) {
  const [activeTab, setActiveTab] = useState("radio");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto mb-4 flex h-[76vh] w-[calc(100%-24px)] max-w-md flex-col overflow-hidden rounded-[28px] border border-cyan-400/20 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.08),_rgba(10,11,30,0.98)_38%,_rgba(10,11,30,1)_100%)] px-0 text-white shadow-[0_-20px_60px_rgba(0,0,0,0.55)]"
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
              <Music4 className="h-5 w-5 text-cyan-300" />
            </motion.div>

            <div className="min-w-0">
              <SheetTitle className="text-left text-xl font-semibold tracking-wide text-white">
                Audio Hub
              </SheetTitle>
            </div>
          </div>
        </SheetHeader>

        <div className="shrink-0 px-5 pt-4">
          <div className="grid grid-cols-3 gap-2 rounded-[22px] border border-white/6 bg-white/[0.03] p-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileTap={{ scale: 0.98 }}
                  className={`rounded-2xl px-3 py-3 text-xs font-medium transition-all ${
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
          {activeTab === "radio" && (
            <div className="space-y-3">
              <div className="rounded-2xl border border-cyan-400/15 bg-gradient-to-r from-cyan-500/8 to-purple-500/8 p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-300/80">
                  Curated by ZWAP!
                </p>
                <p className="mt-2 text-sm text-gray-300">
                  Soundtracks built for movement, play, focus, and vibe.
                </p>
              </div>

              {zwapPlaylists.map((playlist) => (
                <motion.div
                  key={playlist.id}
                  whileHover={{ scale: 1.01 }}
                  className="rounded-2xl border border-cyan-500/15 bg-gradient-to-br from-cyan-500/[0.07] via-sky-500/[0.04] to-purple-500/[0.08] p-4 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-white">
                        {playlist.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-gray-400">
                        {playlist.description}
                      </p>
                    </div>

                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cyan-400/25 bg-cyan-500/12"
                    >
                      <Play className="ml-0.5 h-4 w-4 text-cyan-300" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === "spotify" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Headphones className="h-4 w-4 text-green-300" />
                  <h3 className="font-semibold text-white">Connect Spotify</h3>
                </div>

                <p className="text-sm leading-relaxed text-gray-400">
                  Link your Spotify account so users can bring their own playlists
                  into ZWAP! and set the vibe their way.
                </p>

                <button className="mt-4 w-full rounded-xl border border-green-400/20 bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-4 py-3 text-sm font-medium text-green-200 transition hover:brightness-110">
                  Connect Spotify
                </button>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">
                  Planned features
                </p>

                <ul className="mt-3 space-y-2 text-sm text-gray-300">
                  <li>• Choose a default playlist</li>
                  <li>• Browse saved playlists</li>
                  <li>• Set different soundtracks for MOVE / PLAY</li>
                  <li>• Blend personal listening with ZWAP! discovery</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === "library" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-purple-300" />
                  <h3 className="font-semibold text-white">Your Audio Library</h3>
                </div>

                <p className="text-sm leading-relaxed text-gray-400">
                  Purchased audiobooks, premium spoken-word content, and future
                  ZWAP! audio releases will live here.
                </p>
              </div>

              <div className="rounded-2xl border border-dashed border-purple-400/20 bg-purple-500/[0.05] p-6 text-center">
                <BookOpen className="mx-auto mb-3 h-8 w-8 text-purple-300" />
                <p className="font-medium text-white">Library is empty</p>
                <p className="mt-1 text-sm text-gray-400">
                  When users buy audiobooks or unlock audio modules, they’ll
                  appear here.
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-500/10 bg-gradient-to-r from-cyan-500/[0.04] to-purple-500/[0.04] p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-300/80">
                  Coming into focus
                </p>
                <p className="mt-2 text-sm text-gray-400">
                  Audiobook previews, owned content, and continue-listening states
                  can all live in this lane without relying on external platforms.
                </p>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}