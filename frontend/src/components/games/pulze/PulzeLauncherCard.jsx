import React from "react";
import { motion } from "framer-motion";
import { Zap, Play } from "lucide-react";

export default function PulzeLauncherCard({ onLaunch, isLocked = false }) {
  return (
    <motion.div
      className="w-full rounded-2xl border border-cyan-500/20 bg-[#0f1328] p-4 relative overflow-hidden"
      whileTap={{ scale: isLocked ? 1 : 0.98 }}
      style={{
        opacity: isLocked ? 0.5 : 1,
      }}
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,245,255,0.08),transparent_45%)]" />

      {/* Content */}
      <div className="relative flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs uppercase tracking-[0.18em]">
            <Zap className="w-3.5 h-3.5" />
            Pulze
          </div>

          <p className="text-gray-500 text-[11px] mt-1">
            Precision timing
          </p>
        </div>

        <button
          onClick={onLaunch}
          disabled={isLocked}
          className="h-12 w-12 rounded-full flex items-center justify-center bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 disabled:opacity-40"
        >
          <Play className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Footer Hint */}
      <div className="mt-3 text-[10px] text-gray-500 text-center uppercase tracking-wide">
        Tap to start session
      </div>

      {/* Locked Overlay */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400 uppercase tracking-wide">
          Locked
        </div>
      )}
    </motion.div>
  );
}