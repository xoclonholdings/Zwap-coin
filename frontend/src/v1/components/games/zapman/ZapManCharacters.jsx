import React from "react";

export function ZapManPlayer({ direction = "right", powered = false }) {
  const rotationMap = {
    right: "rotate-0",
    down: "rotate-90",
    left: "rotate-180",
    up: "-rotate-90",
  };

  return (
    <div
      className={[
        "relative h-[82%] w-[82%] rounded-full transition-transform",
        rotationMap[direction] || "rotate-0",
        powered
          ? "bg-[conic-gradient(from_35deg,transparent_0deg,transparent_55deg,#fef08a_56deg,#67f2ff_210deg,#a855f7_360deg)] shadow-[0_0_18px_rgba(250,204,21,0.75)]"
          : "bg-[conic-gradient(from_35deg,transparent_0deg,transparent_55deg,#67f2ff_56deg,#8b5cf6_360deg)] shadow-[0_0_14px_rgba(103,242,255,0.75)]",
      ].join(" ")}
    >
      <div className="absolute right-[18%] top-[22%] h-1.5 w-1.5 rounded-full bg-white/90" />
    </div>
  );
}

export function ZapManEnemy({ character = "glitch", vulnerable = false }) {
  const colorMap = {
    glitch: "from-fuchsia-400 via-pink-400 to-violet-600",
    spark: "from-cyan-300 via-sky-400 to-blue-600",
    phantom: "from-violet-300 via-purple-500 to-fuchsia-700",
    volt: "from-yellow-300 via-orange-400 to-pink-600",
    shade: "from-slate-300 via-slate-500 to-violet-700",
    byte: "from-emerald-300 via-cyan-400 to-violet-600",
  };

  return (
    <div
      className={[
        "relative h-[82%] w-[82%] rounded-t-full rounded-b-[35%] shadow-[0_0_12px_rgba(217,70,239,0.65)]",
        vulnerable
          ? "bg-gradient-to-br from-blue-300 via-cyan-300 to-white animate-pulse"
          : `bg-gradient-to-br ${colorMap[character] || colorMap.glitch}`,
      ].join(" ")}
    >
      <div className="absolute left-[24%] top-[32%] h-1 w-1 rounded-full bg-white/90" />
      <div className="absolute right-[24%] top-[32%] h-1 w-1 rounded-full bg-white/90" />
      <div className="absolute bottom-[-1px] left-0 h-2 w-full rounded-b-[35%] bg-[repeating-linear-gradient(90deg,transparent_0_5px,rgba(255,255,255,0.22)_5px_8px)]" />
    </div>
  );
}

export function ZapManPellet() {
  return (
    <div className="h-1.5 w-1.5 rounded-full bg-cyan-200 shadow-[0_0_8px_rgba(165,243,252,0.8)]" />
  );
}

export function ZapManPowerPellet() {
  return (
    <div className="h-3 w-3 rounded-full bg-yellow-200 shadow-[0_0_14px_rgba(250,204,21,0.9)] animate-pulse" />
  );
}