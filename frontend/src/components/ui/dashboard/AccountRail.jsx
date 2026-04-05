import React from "react";

export default function AccountRail() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/8 px-4 py-3">
        <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-300/70">
          Account
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {/* TEMP CONTENT — replace next */}
        <div className="flex h-full min-h-[480px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-white/10 bg-black/10 px-6 text-center">
          <div className="h-14 w-14 rounded-2xl border border-white/10 bg-white/[0.04]" />
          <p className="mt-4 text-sm font-semibold text-white">
            Account Panel
          </p>
          <p className="mt-2 text-xs text-gray-400">
            Profile, badges, and identity will live here.
          </p>
        </div>
      </div>
    </div>
  );
}