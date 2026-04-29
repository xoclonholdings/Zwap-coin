import React from "react";
import { Droplets, Leaf, Sun } from "lucide-react";

function BonusCard({ icon, title, body, value, tone = "green" }) {
  const toneMap = {
    blue: "border-cyan-300/18 bg-cyan-300/[0.045] text-cyan-200",
    gold: "border-yellow-300/18 bg-yellow-300/[0.045] text-yellow-200",
    green: "border-lime-300/18 bg-lime-300/[0.045] text-lime-200",
  };

  return (
    <div className={`min-h-[145px] rounded-[1.25rem] border p-3 text-center ${toneMap[tone]}`}>
      <div className="mx-auto flex h-12 w-12 items-center justify-center">
        {icon}
      </div>

      <div className="mt-3 text-sm font-black text-white">{title}</div>
      <div className="mt-1 text-xs font-semibold leading-snug text-white/68">
        {body}
      </div>
      <div className="mt-2 text-base font-black text-lime-300">{value}</div>
    </div>
  );
}

export default function CareBonuses() {
  return (
    <div className="mt-5">
      <h3 className="text-sm font-black uppercase tracking-[0.04em] text-white">
        Care & Bonuses
      </h3>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <BonusCard
          tone="blue"
          icon={
            <Droplets
              size={42}
              className="text-cyan-300 drop-shadow-[0_0_10px_rgba(103,242,255,0.55)]"
            />
          }
          title="Water Bonus"
          body="Earn extra zPts from MOVE."
          value="+20%"
        />

        <BonusCard
          tone="gold"
          icon={
            <Sun
              size={42}
              className="text-yellow-300 drop-shadow-[0_0_10px_rgba(253,224,71,0.55)]"
            />
          }
          title="Sunlight Bonus"
          body="Earn more zPts for 24 hours."
          value="+15%"
        />

        <BonusCard
          tone="green"
          icon={
            <Leaf
              size={42}
              className="text-lime-300 drop-shadow-[0_0_10px_rgba(124,255,91,0.55)]"
            />
          }
          title="Growth Bonus"
          body="Earn extra zPts from PLAY."
          value="+15%"
        />
      </div>
    </div>
  );
}
