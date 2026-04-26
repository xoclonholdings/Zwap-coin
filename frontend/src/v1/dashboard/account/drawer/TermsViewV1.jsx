import React from "react";
import {
  ChevronLeft,
  FileText,
  Shield,
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

function Section({ title, children }) {
  return (
    <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(14,24,34,0.94),rgba(6,10,18,0.98))] p-4 shadow-[0_12px_28px_rgba(0,0,0,0.28)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.08),transparent_45%)]" />

      <div className="relative">
        <div className="text-sm font-black tracking-[-0.035em] text-white">
          {title}
        </div>

        <div className="mt-2 text-[11px] leading-5 text-white/50">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function TermsViewV1({ onBack }) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-[linear-gradient(180deg,rgba(6,12,18,0.98),rgba(4,8,14,1))] text-white">
      
      {/* Header */}
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
          Terms
        </div>

        <HeaderButton label="Terms glow">
          <Sparkles size={15} strokeWidth={2.3} />
        </HeaderButton>
      </div>

      {/* Content */}
      <div className="relative min-h-0 flex-1 overflow-hidden px-3 py-3">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-28 w-52 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-24 w-24 rounded-full bg-violet-400/10 blur-2xl" />
        </div>

        <div className="relative z-10 flex h-full min-h-0 flex-col gap-2.5 overflow-y-auto pr-1">
          
          {/* Hero */}
          <div className="relative overflow-hidden rounded-[28px] border border-cyan-300/15 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.16),transparent_44%),radial-gradient(circle_at_85%_20%,rgba(168,85,247,0.10),transparent_36%),linear-gradient(180deg,rgba(12,20,32,0.96),rgba(5,9,18,0.98))] p-4 shadow-[0_16px_42px_rgba(0,0,0,0.36)]">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.065),transparent_34%,rgba(34,211,238,0.045))]" />

            <div className="relative flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-400/10 text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.16)]">
                <Shield size={21} strokeWidth={2.3} />
              </div>

              <div>
                <div className="text-[22px] font-black tracking-[-0.06em] text-white">
                  Platform Terms
                </div>

                <div className="mt-1 text-xs font-medium leading-5 text-white/52">
                  These terms define how access, rewards, and progression behave
                  inside the ZWAP! system.
                </div>
              </div>
            </div>
          </div>

          <Section title="Platform Use">
            ZWAP! is a behavior-based engagement platform. Access to features,
            rewards, and progression systems is based on user activity and
            system-defined logic rather than passive participation.
          </Section>

          <Section title="Rewards & Progression">
            zPts and ZWAP rewards are earned through verified interaction with
            the platform. Rewards are subject to system limits, caps, eligibility
            rules, and progression thresholds.
          </Section>

          <Section title="Account Responsibility">
            You are responsible for maintaining access to your account and
            wallet. Actions performed through your account are considered
            authorized within system rules.
          </Section>

          <Section title="System Integrity">
            Abuse, manipulation, or attempts to bypass system mechanics may
            result in restriction, limitation, or removal of access to features,
            rewards, and progression layers.
          </Section>

          <Section title="Updates">
            Terms may evolve as the ZWAP! system expands. Continued use of the
            platform reflects acceptance of updated terms and system behavior.
          </Section>

        </div>
      </div>
    </div>
  );
}