import React from "react";
import { Crown, Sparkles } from "lucide-react";

export default function DashboardTierPill({ tier = "starter" }) {
  const normalized = String(tier).toLowerCase();
  const isPlus = normalized === "plus" || normalized === "zitizen";

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
        isPlus
          ? "border-amber-400/20 bg-amber-500/10 text-amber-300"
          : "border-cyan-400/20 bg-cyan-500/10 text-cyan-300"
      }`}
    >
      {isPlus ? <Crown className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
      {isPlus ? "Zitizen" : "Zwapper"}
    </div>
  );
}