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
      className={`rounded-2xl border px-3 py-3 transition-all ${
        completed
          ? "border-emerald-400/20 bg-emerald-500/10"
          : "border-white/10 bg-white/[0.04]"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/20">
          <Icon
            className={`h-4 w-4 ${
              completed ? "text-emerald-300" : "text-cyan-300"
            }`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{title}</p>
          <p className="mt-1 text-[11px] text-gray-500">
            {completed ? "Complete" : hint}
          </p>
        </div>

        <div className="shrink-0">
          {completed ? (
            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-500/10">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            </div>
          ) : (
            <div className="rounded-full border border-cyan-400/15 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
              +{reward}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}