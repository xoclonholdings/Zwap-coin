import React from "react";
import { ChevronLeft, Info, Shield, Smartphone, SlidersHorizontal } from "lucide-react";

function SystemCard({ icon, title, description }) {
  return (
    <div className="rounded-[22px] border border-blue-300/18 bg-[radial-gradient(circle_at_20%_18%,rgba(96,165,250,0.12),transparent_42%),linear-gradient(180deg,rgba(18,34,58,0.82),rgba(8,14,26,0.96))] p-3.5 shadow-[0_10px_24px_rgba(0,0,0,0.2)]">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border border-blue-300/20 bg-blue-400/10 text-blue-100/70">
          {icon}
        </div>

        <div>
          <div className="text-sm font-semibold tracking-[-0.02em] text-white/92">
            {title}
          </div>

          <div className="mt-1 text-[11px] font-medium leading-4 text-white/50">
            {description}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditSettingsView({ onBack }) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-[linear-gradient(180deg,rgba(6,12,18,0.98),rgba(4,8,14,1))] text-white">
      <div className="flex h-[56px] shrink-0 items-center justify-between border-b border-blue-200/10 px-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold tracking-[-0.02em] text-white/78"
        >
          <ChevronLeft size={16} strokeWidth={2.4} />
          Back
        </button>

        <div className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.02em] text-white/92">
          <SlidersHorizontal
            size={16}
            strokeWidth={2.3}
            className="text-blue-100/75"
          />
          Controls
        </div>

        <div className="h-9 w-9" />
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden px-3 py-3">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-28 w-52 -translate-x-1/2 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-24 w-24 rounded-full bg-cyan-400/10 blur-2xl" />
        </div>

        <div className="relative z-10 flex h-full min-h-0 flex-col gap-2.5">
          <SystemCard
            icon={<Shield size={18} strokeWidth={2.2} />}
            title="Account Controls"
            description="Manage privacy, alerts, layout lock, and motion preferences from the main settings panel."
          />

          <SystemCard
            icon={<Smartphone size={18} strokeWidth={2.2} />}
            title="V1 Layout"
            description="Mobile Layout Lock keeps ZWAP! in the mobile-first interface during V1."
          />

          <SystemCard
            icon={<Info size={18} strokeWidth={2.2} />}
            title="System Status"
            description="Wallet, Swap, Learn, and Stream access follow the V1 unlock structure."
          />
        </div>
      </div>
    </div>
  );
}