import React from "react";
import DashboardTierPill from "@/components/ui/dashboard/DashboardTierPill";

export default function DashboardHero({
  username = "",
  currentTier = "starter",
}) {
  const displayName = username || "Zwapper";

  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-cyan-500/10 via-violet-500/5 to-pink-500/8 px-4 py-5 shadow-[0_10px_28px_rgba(0,0,0,0.22)]">
      
      {/* ambient glow blobs */}
      <div className="pointer-events-none absolute -top-8 right-[-2rem] h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-2rem] left-[-1rem] h-28 w-28 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          
          {/* LEFT SIDE */}
          <div className="min-w-0 flex-1">
            
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-cyan-300/80">
              Home
            </p>

            <div className="mt-2">
              <p className="text-[11px] font-medium tracking-[0.08em] text-white/55">
                Welcome back,
              </p>

              {/* 🔥 CYBERPUNK USERNAME */}
              <h1 className="mt-1 text-[2rem] font-semibold leading-[1.05] tracking-[0.02em]">
                <span className="bg-gradient-to-r from-cyan-300 via-violet-300 to-pink-300 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(34,211,238,0.25)]">
                  {displayName}
                </span>
              </h1>
            </div>

            <p className="mt-3 max-w-[85%] text-[13px] font-medium leading-relaxed tracking-[0.01em] text-gray-300">
              Your ZWAP! daily pulse in one glance.
            </p>
          </div>

          {/* RIGHT SIDE */}
          <div className="ml-2 flex shrink-0 items-center gap-2 self-start">
            <DashboardTierPill tier={currentTier} />
          </div>

        </div>
      </div>
    </div>
  );
}