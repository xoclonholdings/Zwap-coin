import React from "react";
import { Droplets, Leaf, Sun } from "lucide-react";

function BonusCard({ icon, title, value, tone = "green" }) {
  const toneMap = {
    blue: "border-cyan-300/18 bg-cyan-300/[0.045] text-cyan-200 shadow-[0_0_18px_rgba(103,242,255,0.08)]",
    gold: "border-yellow-300/18 bg-yellow-300/[0.045] text-yellow-200 shadow-[0_0_18px_rgba(253,224,71,0.08)]",
    green: "border-lime-300/18 bg-lime-300/[0.045] text-lime-200 shadow-[0_0_18px_rgba(124,255,91,0.08)]",
  };

  return (
    <div
      className={[
        "flex min-h-[112px] flex-col items-center justify-center rounded-[1.15rem] border p-3 text-center",
        "backdrop-blur-xl",
        toneMap[tone],
      ].join(" ")}
    >
      <div className="flex h-11 w-11 items-center justify-center">{icon}</div>

      <div className="mt-2 text-[12px] font-black leading-tight text-white">
        {title}
      </div>

      <div className="mt-1 text-[18px] font-black tracking-[-0.04em] text-lime-300">
        {value}
      </div>
    </div>
  );
}

export default function CareBonuses() {
  return (
    <div className="grid grid-cols-3 gap-2">
      <BonusCard
        tone="blue"
        icon={
          <Droplets
            size={34}
            className="text-cyan-300 drop-shadow-[0_0_10px_rgba(103,242,255,0.55)]"
          />
        }
        title="Water"
        value="+20%"
      />

      <BonusCard
        tone="gold"
        icon={
          <Sun
            size={34}
            className="text-yellow-300 drop-shadow-[0_0_10px_rgba(253,224,71,0.55)]"
          />
        }
        title="Sunlight"
        value="+15%"
      />

      <BonusCard
        tone="green"
        icon={
          <Leaf
            size={34}
            className="text-lime-300 drop-shadow-[0_0_10px_rgba(124,255,91,0.55)]"
          />
        }
        title="Growth"
        value="+15%"
      />
    </div>
  );
}