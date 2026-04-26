import React from "react";
import { ChevronLeft, FileText } from "lucide-react";

function Section({ title, children }) {
  return (
    <div className="rounded-[18px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,24,34,0.9),rgba(8,14,20,0.95))] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.28)]">
      <div className="text-sm font-semibold tracking-[-0.02em] text-white">
        {title}
      </div>

      <div className="mt-2 text-xs leading-5 text-white/50">
        {children}
      </div>
    </div>
  );
}

export default function TermsViewV1({ onBack }) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-[linear-gradient(180deg,rgba(8,14,20,0.98),rgba(4,8,14,1))] text-white">
      
      {/* Header */}
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
          Terms
        </div>

        <div className="w-8" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-3">
          
          <Section title="Platform Use">
            ZWAP! is a behavior-based engagement platform. Access to features,
            rewards, and progression systems is based on activity and system-defined logic.
          </Section>

          <Section title="Rewards & Progression">
            zPts and ZWAP rewards are earned through verified interaction with the platform.
            Rewards are subject to system limits, caps, and eligibility rules.
          </Section>

          <Section title="Account Responsibility">
            You are responsible for maintaining access to your account and wallet.
            Actions performed through your account are considered authorized.
          </Section>

          <Section title="System Integrity">
            Abuse, manipulation, or attempts to bypass system mechanics may result
            in restriction or removal of access to features and rewards.
          </Section>

          <Section title="Updates">
            Terms may evolve as the ZWAP! system expands. Continued use of the platform
            reflects acceptance of updated terms.
          </Section>

        </div>
      </div>
    </div>
  );
}