import React from "react";
import { motion } from "framer-motion";
import { Crown, Footprints, Flame, Zap } from "lucide-react";

const DEFAULT_MODES = [
  {
    id: "walk",
    name: "Walk",
    description: "Standard movement mode for daily steps and steady rewards.",
    badge: "Active",
    accent: "cyan",
    icon: Footprints,
    locked: false,
  },
  {
    id: "boost",
    name: "Boost Walk",
    description: "Higher-intensity reward lane reserved for Plus members.",
    badge: "Plus",
    accent: "violet",
    icon: Zap,
    locked: true,
  },
  {
    id: "streak",
    name: "Streak Mode",
    description: "Build daily consistency and keep your momentum alive.",
    badge: "Streak",
    accent: "orange",
    icon: Flame,
    locked: false,
  },
  {
    id: "challenge",
    name: "Challenge Mode",
    description: "Event-based step campaigns and sponsor challenges.",
    badge: "Soon",
    accent: "cyan",
    icon: Crown,
    locked: true,
  },
];

const THEMES = {
  cyan: {
    shell:
      "border-cyan-400/20 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_transparent_34%),linear-gradient(180deg,rgba(7,20,28,0.96),rgba(7,14,20,0.98))]",
    icon: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    accent: "text-cyan-300",
    badge: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
  },
  violet: {
    shell:
      "border-violet-400/20 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),_transparent_34%),linear-gradient(180deg,rgba(18,11,36,0.96),rgba(10,10,22,0.98))]",
    icon: "border-violet-400/20 bg-violet-400/10 text-violet-300",
    accent: "text-violet-300",
    badge: "border-violet-400/20 bg-violet-400/10 text-violet-300",
  },
  orange: {
    shell:
      "border-orange-400/20 bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.18),_transparent_34%),linear-gradient(180deg,rgba(28,16,10,0.96),rgba(20,12,8,0.98))]",
    icon: "border-orange-400/20 bg-orange-400/10 text-orange-300",
    accent: "text-orange-300",
    badge: "border-orange-400/20 bg-orange-400/10 text-orange-300",
  },
};

export default function MoveModesCarousel({
  modes = DEFAULT_MODES,
  activeMode = "walk",
  isPlus = false,
  onSelectMode,
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.08),_transparent_24%),linear-gradient(180deg,rgba(10,16,23,0.96),rgba(8,12,18,0.98))] p-4 backdrop-blur-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Footprints className="h-4 w-4 text-cyan-300" />
            <h3 className="text-sm font-semibold text-white">
              Movement Modes
            </h3>
          </div>
          <p className="mt-1 text-sm text-white/50">
            Pick your movement style and shape your reward loop.
          </p>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {modes.map((mode) => {
          const Icon = mode.icon || Footprints;
          const theme = THEMES[mode.accent] || THEMES.cyan;
          const isLocked = mode.id === "boost" ? !isPlus : Boolean(mode.locked);
          const isActive = activeMode === mode.id;

          return (
            <motion.button
              key={mode.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => !isLocked && onSelectMode?.(mode.id)}
              className={`min-w-[260px] max-w-[260px] rounded-[22px] border p-4 text-left shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition ${theme.shell} ${
                isLocked ? "opacity-65" : ""
              } ${
                isActive ? "ring-1 ring-white/20" : ""
              }`}
              disabled={isLocked}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${theme.icon}`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate text-[15px] font-semibold text-white">
                      {mode.name}
                    </h3>

                    <div
                      className={`rounded-xl border px-2.5 py-1 text-[11px] font-medium ${theme.badge}`}
                    >
                      {isLocked ? "Locked" : mode.badge}
                    </div>
                  </div>

                  <p className="mt-1 line-clamp-2 text-sm text-white/60">
                    {mode.description}
                  </p>

                  <div className="mt-3 flex items-center justify-between">
                    <span className={`text-[11px] font-medium ${theme.accent}`}>
                      {isLocked ? "Upgrade to unlock" : isActive ? "Selected mode" : "Tap to switch"}
                    </span>

                    <span className="inline-flex items-center gap-1 text-sm font-medium text-white">
                      {isLocked ? (
                        <>
                          {mode.id === "boost" ? "Plus" : "Soon"}
                          <Crown className="h-4 w-4 text-amber-300" />
                        </>
                      ) : isActive ? (
                        "Active"
                      ) : (
                        "Select"
                      )}
                    </span>
                  </div>

                  <p className="mt-1 text-[11px] uppercase tracking-wide text-white/35">
                    {mode.id === "walk" && "Balanced reward flow"}
                    {mode.id === "boost" && "Higher multiplier lane"}
                    {mode.id === "streak" && "Consistency-focused"}
                    {mode.id === "challenge" && "Event-ready system"}
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}