import React, { useState } from "react";
import { motion } from "framer-motion";
import { Music4, Radio, Headphones, BookOpen, Play, ExternalLink, Lock } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const tabs = [
  { id: "radio", label: "ZWAP Radio", icon: Radio },
  { id: "spotify", label: "Spotify", icon: Headphones },
  { id: "library", label: "Library", icon: BookOpen },
];

const zwapPlaylists = [
  { id: "move", title: "ZWAP Move Mix", description: "Energy for walking, motion, and momentum" },
  { id: "play", title: "ZWAP Play Mode", description: "Arcade-ready sounds for game sessions" },
  { id: "focus", title: "ZWAP Focus", description: "Clean focus for building and browsing" },
  { id: "afterdark", title: "ZWAP After Dark", description: "Late-night atmosphere and neon drift" },
];

export default function AudioHub({ open, onOpenChange }) {
  const [activeTab, setActiveTab] = useState("radio");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="bg-[#0a0b1e] border-t border-cyan-500/20 rounded-t-3xl max-w-lg mx-auto h-[78vh] px-0"
      >
        <SheetHeader className="px-4 pt-2 pb-3 border-b border-cyan-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/20 flex items-center justify-center">
              <Music4 className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <SheetTitle className="text-white text-left">Audio Hub</SheetTitle>
              <p className="text-xs text-gray-400">ZWAP Radio • Spotify • Library</p>
            </div>
          </div>
        </SheetHeader>

        {/* Tabs */}
        <div className="px-4 pt-4">
          <div className="grid grid-cols-3 gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileTap={{ scale: 0.98 }}
                  className={`rounded-2xl px-3 py-3 text-xs font-medium transition-all border ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-400/30 text-white"
                      : "bg-white/[0.03] border-white/10 text-gray-400"
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-4 overflow-y-auto h-[calc(78vh-140px)]">
          {activeTab === "radio" && (
            <div className="space-y-3">
              {zwapPlaylists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="rounded-2xl border border-cyan-500/15 bg-gradient-to-br from-cyan-500/8 to-purple-500/8 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-white font-semibold">{playlist.title}</h3>
                      <p className="text-sm text-gray-400 mt-1">{playlist.description}</p>
                    </div>
                    <button className="w-10 h-10 rounded-full bg-cyan-500/15 border border-cyan-400/20 flex items-center justify-center">
                      <Play className="w-4 h-4 text-cyan-300 ml-0.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "spotify" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <h3 className="text-white font-semibold">Connect Spotify</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Link your Spotify account to use your own playlists inside ZWAP.
                </p>

                <button className="mt-4 w-full rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/20 px-4 py-3 text-sm font-medium text-green-200">
                  Connect Spotify
                </button>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Coming next</p>
                <ul className="mt-3 space-y-2 text-sm text-gray-300">
                  <li>• Choose a default playlist</li>
                  <li>• View your saved playlists</li>
                  <li>• Set a soundtrack for MOVE / PLAY</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === "library" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-purple-300" />
                  <h3 className="text-white font-semibold">Your Audio Library</h3>
                </div>
                <p className="text-sm text-gray-400">
                  Purchased audiobooks and premium spoken-word content will live here.
                </p>
              </div>

              <div className="rounded-2xl border border-dashed border-purple-400/20 bg-purple-500/5 p-5 text-center">
                <BookOpen className="w-8 h-8 text-purple-300 mx-auto mb-3" />
                <p className="text-white font-medium">Library is empty</p>
                <p className="text-sm text-gray-400 mt-1">
                  When users buy audiobooks or unlock audio modules, they’ll appear here.
                </p>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}