import React from "react";
import { CheckCircle2 } from "lucide-react";

export default function DashboardTaskCard({
  icon: Icon,
  title,
  reward,
  completed = false,
  hint,
}) {
  return (
    <div
      className={`rounded-2xl border p-3 ${
        completed
          ? "border-emerald-400/20 bg-emerald-500/10"
          : "border-white/10 bg-white/[0.04]"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/20">
          <Icon className={`h-4 w-4 ${completed ? "text-emerald-300" : "text-cyan-300"}`} />
        </div>

        {completed ? (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />
        ) : (
          <div className="rounded-full border border-cyan-400/15 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
            +{reward}
          </div>
        )}
      </div>

      <div className="mt-3">
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-1 text-[11px] text-gray-500">
          {completed ? "Complete" : hint}
        </p>
      </div>
    </div>
  );
}