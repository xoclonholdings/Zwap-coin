import React from "react";
import { ChevronLeft, EyeOff, ShieldCheck, Database } from "lucide-react";

function PrivacyCard({
  icon,
  title,
  description,
}) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_12px_28px_rgba(0,0,0,0.22)]">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/60">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-semibold tracking-[-0.03em] text-white">
            {title}
          </div>

          <div className="mt-1 text-sm leading-relaxed text-white/54">
            {description}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PrivacyViewV1({
  onBack,
}) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-[linear-gradient(180deg,rgba(8,14,20,0.98),rgba(4,8,14,1))] text-white">
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-white/72"
        >
          <ChevronLeft size={16} strokeWidth={2} />
          Back
        </button>

        <div className="text-sm font-semibold tracking-[-0.02em] text-white/88">
          Privacy
        </div>

        <div className="w-9" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-3">
          <PrivacyCard
            icon={<EyeOff size={18} strokeWidth={2} />}
            title="Visibility Controls"
            description="Private balances, hidden activity details, and reduced public surface exposure can be managed from your account settings."
          />

          <PrivacyCard
            icon={<ShieldCheck size={18} strokeWidth={2} />}
            title="Protected Access"
            description="Your account access, progression systems, and gated reward layers are protected through controlled system logic."
          />

          <PrivacyCard
            icon={<Database size={18} strokeWidth={2} />}
            title="Data Handling"
            description="ZWAP stores account and progression data needed to operate rewards, unlock systems, and core app features."
          />
        </div>
      </div>
    </div>
  );
}