import React from "react";

export function ZapManPlayer({ direction = "right" }) {
  const rotationMap = {
    right: "rotate-0",
    down: "rotate-90",
    left: "rotate-180",
    up: "-rotate-90",
  };

  return (
    <div
      className={[
        "relative h-[82%] w-[82%] rounded-full",
        "bg-[conic-gradient(from_35deg,transparent_0deg,transparent_58deg,#67F2FF_59deg,#A78BFA_360deg)]",
        "shadow-[0_0_14px_rgba(103,242,255,0.75)]",
        rotationMap[direction] || "rotate-0",
      ].join(" ")}
    >
      <div className="absolute right-[21%] top-[22%] h-1.5 w-1.5 rounded-full bg-white/90" />
    </div>
  );
}

export function ZapManEnemy({ index = 0 }) {
  const colors = [
    "from-fuchsia-400 via-pink-400 to-violet-600",
    "from-orange-300 via-pink-400 to-fuchsia-600",
    "from-cyan-300 via-blue-400 to-violet-600",
    "from-lime-300 via-cyan-300 to-blue-500",
  ];

  return (
    <div
      className={[
        "relative h-[82%] w-[82%] rounded-t-full rounded-b-[35%]",
        "shadow-[0_0_12px_rgba(217,70,239,0.65)]",
        "bg-gradient-to-br",
        colors[index % colors.length],
      ].join(" ")}
    >
      <div className="absolute left-[24%] top-[32%] h-1 w-1 rounded-full bg-white/90" />
      <div className="absolute right-[24%] top-[32%] h-1 w-1 rounded-full bg-white/90" />
      <div className="absolute bottom-[-1px] left-0 h-2 w-full rounded-b-[35%] bg-[repeating-linear-gradient(90deg,transparent_0_5px,rgba(255,255,255,0.25)_5px_8px)]" />
    </div>
  );
}