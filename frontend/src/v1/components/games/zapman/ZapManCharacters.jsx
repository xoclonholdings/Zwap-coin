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
        "relative h-[118%] w-[118%] transition-transform duration-150",
        rotationMap[direction] || "rotate-0",
      ].join(" ")}
    >
      <div
        className={[
          "absolute inset-[7%] rounded-full",
          powered
            ? "bg-[radial-gradient(circle_at_32%_28%,#ffffff_0%,#fff7ad_18%,#67f2ff_48%,#a855f7_100%)] shadow-[0_0_18px_rgba(250,204,21,0.95),0_0_30px_rgba(34,211,238,0.50)]"
            : "bg-[radial-gradient(circle_at_32%_28%,#ffffff_0%,#dffbff_18%,#67f2ff_48%,#7c3aed_100%)] shadow-[0_0_18px_rgba(103,242,255,0.88),0_0_28px_rgba(124,58,237,0.45)]",
        ].join(" ")}
      />

      <div className="absolute left-[36%] top-[21%] h-[13%] w-[13%] rounded-full bg-slate-950 shadow-[0_0_4px_rgba(255,255,255,0.8)]" />

      <div className="absolute bottom-[16%] left-[31%] h-[30%] w-[38%] rounded-[30%] bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(30,41,59,0.96))] shadow-[inset_0_0_8px_rgba(103,242,255,0.35)]">
        <div className="absolute left-1/2 top-1/2 h-[54%] w-[30%] -translate-x-1/2 -translate-y-1/2 rotate-12 bg-[linear-gradient(180deg,#ffffff,#67f2ff_48%,#a855f7)] [clip-path:polygon(58%_0,18%_50%,47%_50%,34%_100%,84%_38%,55%_38%)]" />
      </div>

      <div className="absolute bottom-[7%] left-[21%] h-[22%] w-[17%] -rotate-12 rounded-full bg-[linear-gradient(180deg,#eef6ff,#67f2ff)] shadow-[0_0_8px_rgba(103,242,255,0.75)]" />
      <div className="absolute bottom-[7%] right-[21%] h-[22%] w-[17%] rotate-12 rounded-full bg-[linear-gradient(180deg,#eef6ff,#67f2ff)] shadow-[0_0_8px_rgba(103,242,255,0.75)]" />
    </div>
  );
}

export function ZapManEnemy({ character = "glitch", vulnerable = false }) {
  const colorMap = {
    glitch: "from-fuchsia-400 via-pink-500 to-violet-700",
    spark: "from-cyan-200 via-sky-400 to-blue-700",
    phantom: "from-violet-200 via-purple-500 to-fuchsia-800",
    volt: "from-yellow-200 via-orange-400 to-pink-700",
    shade: "from-slate-200 via-slate-500 to-violet-800",
    byte: "from-emerald-200 via-cyan-400 to-violet-700",
  };

  return (
    <div className="relative h-[112%] w-[112%]">
      <div
        className={[
          "absolute inset-x-[8%] bottom-[6%] top-[2%] rounded-t-full rounded-b-[30%] shadow-[0_0_16px_rgba(217,70,239,0.72),0_0_26px_rgba(34,211,238,0.20)]",
          vulnerable
            ? "animate-pulse bg-gradient-to-br from-blue-200 via-cyan-300 to-white"
            : `bg-gradient-to-br ${colorMap[character] || colorMap.glitch}`,
        ].join(" ")}
      >
        <div className="absolute left-[22%] top-[31%] h-[18%] w-[18%] rounded-full bg-white shadow-[0_0_5px_rgba(255,255,255,0.85)]">
          <div className="absolute left-[28%] top-[34%] h-[38%] w-[38%] rounded-full bg-slate-950" />
        </div>

        <div className="absolute right-[22%] top-[31%] h-[18%] w-[18%] rounded-full bg-white shadow-[0_0_5px_rgba(255,255,255,0.85)]">
          <div className="absolute left-[28%] top-[34%] h-[38%] w-[38%] rounded-full bg-slate-950" />
        </div>

        <div className="absolute bottom-[20%] left-[32%] h-[10%] w-[36%] rounded-full bg-slate-950/70" />

        <div className="absolute bottom-[-1px] left-0 h-[18%] w-full rounded-b-[30%] bg-[repeating-linear-gradient(90deg,transparent_0_7px,rgba(255,255,255,0.24)_7px_11px)]" />
      </div>

      <div className="absolute inset-x-[12%] bottom-[0] h-[18%] rounded-full bg-current opacity-20 blur-md" />
    </div>
  );
}

export function ZapManPellet() {
  return (
    <div className="h-[34%] w-[34%] rounded-full bg-[radial-gradient(circle,#ffffff_0%,#fde68a_35%,#f59e0b_72%,rgba(245,158,11,0.15)_100%)] shadow-[0_0_10px_rgba(251,191,36,0.9),0_0_18px_rgba(34,211,238,0.18)]" />
  );
}

export function ZapManPowerPellet() {
  return (
    <div className="relative h-[68%] w-[68%] animate-pulse rounded-full bg-[radial-gradient(circle,#ffffff_0%,#fef08a_30%,#f97316_62%,#ec4899_100%)] shadow-[0_0_16px_rgba(250,204,21,0.95),0_0_28px_rgba(236,72,153,0.45)]">
      <div className="absolute inset-[-35%] rounded-full border border-yellow-200/35" />
    </div>
  );
}