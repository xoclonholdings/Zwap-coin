import React from "react";

import AdminSectionCardV1 from "../components/AdminSectionCardV1";
import AdminUnlockRowV1 from "../components/AdminUnlockRowV1";
import AdminStatusPillV1 from "../components/AdminStatusPillV1";

export default function AdminProgressionSectionV1() {
  const progression = [
    {
      label: "Shop",
      phase: "Phase A",
      trigger: "1,000 lifetime zPts",
      state: "Visible / Locked",
      tone: "locked",
    },
    {
      label: "Garden",
      phase: "Phase A",
      trigger: "3 active days OR first full daily loop",
      state: "Locked",
      tone: "locked",
    },
    {
      label: "Badges",
      phase: "Phase A/B",
      trigger: "Multiple loops OR first streak milestone",
      state: "Hidden",
      tone: "locked",
    },
    {
      label: "Learn",
      phase: "Phase B",
      trigger: "Phase B release + retention threshold",
      state: "Locked",
      tone: "locked",
    },
    {
      label: "Stream",
      phase: "Phase B",
      trigger: "Learn unlocked + engagement depth",
      state: "Locked",
      tone: "locked",
    },
    {
      label: "Assist",
      phase: "Phase B",
      trigger: "User density + progression threshold",
      state: "Locked",
      tone: "locked",
    },
    {
      label: "Sponsor Rewards",
      phase: "Phase B/C",
      trigger: "Trophies, streaks, referrals, campaigns",
      state: "Locked",
      tone: "locked",
    },
    {
      label: "Swap",
      phase: "Phase C",
      trigger: "Liquidity seeded + economy validated",
      state: "Locked",
      tone: "locked",
    },
  ];

  return (
    <div className="space-y-4">
      {/* SYSTEM FLOW */}
      <AdminSectionCardV1 title="V1 Progression Flow">
        MOVE / PLAY → Shop → Garden → Badges → Learn → Stream → Assist →
        Sponsor Rewards → Swap
      </AdminSectionCardV1>

      {/* PHASE STATUS */}
      <div className="rounded-2xl border border-cyan-400/15 bg-cyan-500/[0.06] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
              Current Phase
            </div>

            <div className="mt-2 text-lg font-bold text-white">
              Phase A: Activation
            </div>

            <div className="mt-1 text-xs leading-5 text-white/55">
              Move, Play, Daily Tasks, and zPts accumulation are active.
              Shop is visible but locked. All other systems remain gated.
            </div>
          </div>

          <AdminStatusPillV1 tone="phase">
            Phase A
          </AdminStatusPillV1>
        </div>
      </div>

      {/* UNLOCK TABLE */}
      <div className="space-y-3">
        {progression.map((item) => (
          <AdminUnlockRowV1
            key={item.label}
            label={item.label}
            phase={item.phase}
            trigger={item.trigger}
            state={item.state}
            tone={item.tone}
          />
        ))}
      </div>
    </div>
  );
}