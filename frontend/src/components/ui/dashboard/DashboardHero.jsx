import React from "react";
import { UserCircle2 } from "lucide-react";
import DashboardTierPill from "@/components/ui/dashboard/DashboardTierPill";

export default function DashboardHero({
  username = "",
  currentTier = "starter",
}) {
  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-cyan-500/10 via-violet-500/5 to-pink-500/8 p-4">
      <div className="pointer-events-none absolute -top-8 right-[-2rem] h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-2rem] left-[-1rem] h-28 w-28 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative z-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-300/80">
              Home
            </p>

            <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
              {username ? `Welcome back, ${username}` : "Welcome back"}
            </h1>

            <p className="mt-1 text-sm leading-relaxed text-gray-300">
              Your ZWAP! daily pulse in one glance.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <DashboardTierPill tier={currentTier} />
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
              <UserCircle2 className="h-6 w-6 text-white/80" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}