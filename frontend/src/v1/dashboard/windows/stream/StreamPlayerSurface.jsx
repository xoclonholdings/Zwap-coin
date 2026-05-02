import React from "react";
import { motion } from "framer-motion";
import { Headphones, Music2, Radio } from "lucide-react";
import { connectSpotify } from "@/lib/spotify";

export default function StreamPlayerSurface({ item, activeTab }) {
  if (!item) return null;

  const isRadio = activeTab === "zwap-radio";
  const isSpotify = activeTab === "spotify";
  const isApple = activeTab === "apple-music";

  return (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-br ${item.accent} p-5`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_42%)]" />

      <div className="relative">
        {/* HEADER */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-white/65">
              {isRadio && "ZWAP! Radio"}
              {isSpotify && "Spotify"}
              {isApple && "Apple Music"}
            </p>

            <h3 className="mt-2 text-lg font-semibold text-white">
              {item.title}
            </h3>

            <p className="mt-1 text-sm text-gray-200/80">
              {item.subtitle}
            </p>
          </div>
        </div>

        {/* PLAYER SURFACE */}
        <div className="mt-5 rounded-[20px] border border-white/10 bg-black/30 p-4">
          {/* ZWAP RADIO (Bandcamp) */}
          {isRadio && (
            <div className="overflow-hidden rounded-[16px] border border-white/10">
              <iframe
                style={{ border: 0, width: "100%", height: "120px" }}
                src="https://bandcamp.com/EmbeddedPlayer/size=large/bgcol=333333/linkcol=0f91ff/artwork=small/transparent=true/"
                seamless
                title="ZWAP Radio Bandcamp Player"
              />
            </div>
          )}

          {/* SPOTIFY */}
          {isSpotify && (
            <div className="space-y-4">
              <div className="flex h-[100px] items-center justify-center rounded-[16px] border border-white/10 bg-black/20">
                <Headphones className="h-6 w-6 text-green-400" />
              </div>

              <button
                onClick={connectSpotify}
                className="w-full rounded-xl border border-green-400/30 bg-gradient-to-r from-green-500/30 to-emerald-500/30 px-4 py-3 text-sm font-semibold text-white"
              >
                Connect Spotify
              </button>
            </div>
          )}

          {/* APPLE MUSIC */}
          {isApple && (
            <div className="flex h-[100px] items-center justify-center rounded-[16px] border border-white/10 bg-black/20 text-center">
              <div>
                <Music2 className="mx-auto mb-2 h-6 w-6 text-pink-300" />
                <p className="text-sm text-white/80">
                  Apple Music integration coming next
                </p>
              </div>
            </div>
          )}
        </div>

        {/* DESCRIPTION */}
        <p className="mt-4 text-sm text-gray-200/80">
          {item.description}
        </p>
      </div>
    </motion.div>
  );
}