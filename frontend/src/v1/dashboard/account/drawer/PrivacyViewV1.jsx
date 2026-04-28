import React from "react";
import {
  ChevronLeft,
  Database,
  EyeOff,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

function HeaderButton({ children, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/75 shadow-[0_0_10px_rgba(255,255,255,0.06)]"
    >
      {children}
    </button>
  );
}

function PrivacyCard({ icon, title, description, tone = "default" }) {
  const toneClass =
    tone === "cyan"
      ? "border-cyan-300/18 bg-cyan-400/10 text-cyan-100"
      : "border-white/10 bg-white/[0.04] text-white/60";

  return (
    <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(14,24,34,0.94),rgba(6,10,18,0.98))] p-4 shadow-[0_12px_28px_rgba(0,0,0,0.28)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.08),transparent_45%)]" />

      <div className="relative flex items-start gap-3">
        <div
          className={[
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border",
            toneClass,
          ].join(" ")}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-sm font-black tracking-[-0.035em] text-white">
            {title}
          </div>

          <div className="mt-1 text-[11px] font-medium leading-5 text-white/50">
            {description}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PrivacyViewV1({ onBack }) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-[linear-gradient(180deg,rgba(6,12,18,0.98),rgba(4,8,14,1))] text-white">
      <div className="flex h-[56px] shrink-0 items-center justify-between border-b border-white/8 px-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-black tracking-[-0.03em] text-white/78"
        >
          <ChevronLeft size={16} strokeWidth={2.4} />
          Back
        </button>

        <div className="text-[15px] font-black tracking-[-0.04em] text-white/92">
          Privacy
        </div>

        <HeaderButton label="Privacy glow">
          <Sparkles size={15} strokeWidth={2.3} />
        </HeaderButton>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden px-3 py-3">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-28 w-52 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-24 w-24 rounded-full bg-violet-400/10 blur-2xl" />
        </div>

        <div className="relative z-10 flex h-full min-h-0 flex-col gap-2.5 overflow-y-auto pr-1">
          <div className="relative overflow-hidden rounded-[28px] border border-cyan-300/15 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.16),transparent_44%),radial-gradient(circle_at_85%_20%,rgba(168,85,247,0.10),transparent_36%),linear-gradient(180deg,rgba(12,20,32,0.96),rgba(5,9,18,0.98))] p-4 shadow-[0_16px_42px_rgba(0,0,0,0.36)]">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.065),transparent_34%,rgba(34,211,238,0.045))]" />

            <div className="relative flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-400/10 text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.16)]">
                <Lock size={21} strokeWidth={2.3} />
              </div>

              <div>
                <div className="text-[22px] font-black tracking-[-0.06em] text-white">
                  Privacy Layer
                </div>

                <div className="mt-1 text-xs font-medium leading-5 text-white/52">
                  Your account display, progression visibility, and access logic
                  are separated so the app can reveal only what belongs on each
                  surface.
                </div>
              </div>
            </div>
          </div>

          <PrivacyCard
            icon={<EyeOff size={18} strokeWidth={2.2} />}
            title="Visibility Controls"
            description="Drawer and dashboard surfaces should avoid exposing private account details unless the user enters a profile or settings view."
            tone="cyan"
          />

          <PrivacyCard
            icon={<ShieldCheck size={18} strokeWidth={2.2} />}
            title="Protected Access"
            description="Unlock states, reward eligibility, Shop access, and admin access are controlled by system rules instead of loose UI shortcuts."
          />

          <PrivacyCard
            icon={<Database size={18} strokeWidth={2.2} />}
            title="Data Handling"
            description="ZWAP! stores only the account and progression data needed to operate rewards, inventory, unlocks, badges, and core app features."
          />
        </div>
      </div>
    </div>
  );
}
