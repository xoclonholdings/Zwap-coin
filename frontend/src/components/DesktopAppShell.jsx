import React from "react";
import StreamRail from "@/components/ui/stream/StreamRail";
import AccountRail from "@/components/user/AccountRail";

function DesktopSideRail({ title, align = "left", children }) {
  return (
    <aside className="hidden xl:block xl:w-[280px] 2xl:w-[320px] xl:h-full">
      <div
        className={`h-full overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.035] backdrop-blur-xl ${
          align === "right"
            ? "bg-gradient-to-br from-violet-500/[0.06] via-white/[0.03] to-transparent"
            : "bg-gradient-to-br from-cyan-500/[0.06] via-white/[0.03] to-transparent"
        }`}
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="border-b border-white/8 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-300/70">
              {title}
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {children}
          </div>
        </div>
      </div>
    </aside>
  );
}

export default function DesktopAppShell({ children }) {
  return (
    <div className="bg-[#050510] text-white xl:h-[calc(100dvh-152px)] xl:overflow-hidden xl:px-6 xl:pb-4 xl:pt-2 2xl:px-8">
      <div className="mx-auto h-full w-full max-w-[1680px]">
        <div className="flex h-full min-h-0 items-stretch gap-6">
          <DesktopSideRail title="Stream" align="left">
            <StreamRail />
          </DesktopSideRail>

          <main className="min-w-0 flex-1 xl:h-full xl:min-h-0">
            <div className="mx-auto w-full max-w-5xl xl:flex xl:h-full xl:max-w-[760px] xl:min-h-0 xl:flex-col 2xl:max-w-[820px]">
              <div className="w-full rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] shadow-[0_20px_60px_rgba(0,0,0,0.28)] xl:flex xl:h-full xl:min-h-0 xl:flex-col xl:overflow-hidden">
                <div className="w-full xl:h-full xl:overflow-y-auto xl:px-1 xl:py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <div className="space-y-4 px-1 pb-4">
                    {children}
                  </div>
                </div>
              </div>
            </div>
          </main>

          <DesktopSideRail title="Account" align="right">
            <AccountRail />
          </DesktopSideRail>
        </div>
      </div>
    </div>
  );
}