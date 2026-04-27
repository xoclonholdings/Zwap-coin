import React from "react";

import AdminStatusPillV1 from "./AdminStatusPillV1";

export default function AdminUnlockRowV1({
  label,
  phase,
  trigger,
  state,
  tone = "locked",
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white">{label}</div>

          <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-cyan-300/60">
            {phase}
          </div>
        </div>

        <AdminStatusPillV1 tone={tone}>{state}</AdminStatusPillV1>
      </div>

      <div className="mt-3 text-xs leading-5 text-white/55">
        <span className="text-white/35">Trigger:</span> {trigger}
      </div>
    </div>
  );
}