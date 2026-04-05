import React from "react";
import { UserCircle2 } from "lucide-react";
import DashboardTierPill from "@/components/ui/dashboard/DashboardTierPill";

export default function DashboardHero({
  username = "",
  currentTier = "starter",
}) {
  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-cyan-500/10 via-violet-500/5 to-pink-500/8 px-4 py-5 shadow-[0_10px_28px_rgba(0,0,0,0.22)]">
      <div className="pointer-events-none absolute -top-8 right-[-2rem] h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-2rem] left-[-1rem] h-28 w-28 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-300/80">
              Home
            </p>

            <div className="mt-2">
              <p className="text-xs font-medium tracking-[0.01em] text-white/55">
                Welcome back,
              </p>

              <h1 className="mt-1 text-[2rem] font-semibold leading-[1.08] tracking-[-0.03em] text-white">
                {username || "Zwapper"}
              </h1>
            </div>

            <p className="mt-3 max-w-[85%] text-sm leading-relaxed text-gray-300">
              Your ZWAP! daily pulse in one glance.
            </p>
          </div>

          <div className="ml-2 flex shrink-0 items-center gap-2 self-start">
            <DashboardTierPill tier={currentTier} />
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
              <UserCircle2 className="h-5.5 w-5.5 text-white/80" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}