import React, { useEffect, useRef } from "react";
import {
  BadgeDollarSign,
  ChevronLeft,
  Code2,
  Gamepad2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

function HeaderButton({ children, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-300/20 bg-emerald-400/10 text-emerald-100 shadow-[0_0_18px_rgba(16,185,129,0.14)] transition active:scale-[0.97]"
    >
      {children}
    </button>
  );
}

function DeveloperCard({ icon, title, description, children, accent = "cyan" }) {
  const accentClass =
    accent === "emerald"
      ? "border-emerald-300/14 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_44%),linear-gradient(180deg,rgba(12,26,24,0.94),rgba(6,10,18,0.98))]"
      : "border-cyan-300/14 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.10),transparent_44%),linear-gradient(180deg,rgba(14,24,34,0.94),rgba(6,10,18,0.98))]";

  const iconClass =
    accent === "emerald"
      ? "border-emerald-300/24 bg-emerald-400/12 text-emerald-100 shadow-[0_0_18px_rgba(16,185,129,0.12)]"
      : "border-cyan-300/24 bg-cyan-400/12 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.12)]";

  return (
    <div
      className={[
        "relative overflow-hidden rounded-[22px] border p-3.5 shadow-[0_12px_28px_rgba(0,0,0,0.28)]",
        accentClass,
      ].join(" ")}
    >
      <div className="relative flex items-start gap-3">
        <div
          className={[
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border",
            iconClass,
          ].join(" ")}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold tracking-[-0.02em] text-white/92">
            {title}
          </div>

          <div className="mt-1 text-[11px] font-medium leading-4 text-white/48">
            {description}
          </div>

          {children ? <div className="mt-3">{children}</div> : null}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ children }) {
  return (
    <div className="inline-flex rounded-full border border-white/10 bg-white/[0.045] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/48">
      {children}
    </div>
  );
}

export default function DevelopersViewV1({ onBack, initialSection = "overview" }) {
  const earnCashRef = useRef(null);

  useEffect(() => {
    if (initialSection !== "earnCash") return;

    requestAnimationFrame(() => {
      earnCashRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, [initialSection]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-[linear-gradient(180deg,rgba(6,12,18,0.98),rgba(4,8,14,1))] text-white">
      <div className="flex h-[56px] shrink-0 items-center justify-between border-b border-cyan-200/10 px-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold tracking-[-0.02em] text-white/78"
        >
          <ChevronLeft size={16} strokeWidth={2.4} />
          Back
        </button>

        <div className="text-[15px] font-semibold tracking-[-0.02em] text-white/92">
          Developers
        </div>

        <HeaderButton label="Developers portal status">
          <Code2 size={15} strokeWidth={2.3} />
        </HeaderButton>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden px-3 py-3">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-28 w-52 -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-24 w-24 rounded-full bg-cyan-400/10 blur-2xl" />
        </div>

        <div className="relative z-10 flex h-full min-h-0 flex-col gap-2.5 overflow-y-auto pr-1">
          <DeveloperCard
            icon={<Sparkles size={18} strokeWidth={2.2} />}
            title="Developer Portal"
            description="A future approval-based layer for developers, partners, sponsored campaigns, and PLAY ecosystem expansion."
          >
            <StatusPill>Progression path pending</StatusPill>
          </DeveloperCard>

          <div ref={earnCashRef}>
            <DeveloperCard
              icon={<BadgeDollarSign size={18} strokeWidth={2.2} />}
              title="Earn Cash"
              description="Sponsored game challenges and real reward opportunities will live here once the unlock path is defined."
              accent="emerald"
            >
              <div className="rounded-2xl border border-emerald-300/12 bg-emerald-400/[0.055] px-3 py-3 text-[11px] font-medium leading-4 text-white/52">
                This section is not active yet. Requirements will appear here
                after the progression rules are written.
              </div>
            </DeveloperCard>
          </div>

          <DeveloperCard
            icon={<Gamepad2 size={18} strokeWidth={2.2} />}
            title="Game Submissions"
            description="External games will require review for quality, safety, reward integrity, and performance impact."
          />

          <DeveloperCard
            icon={<ShieldCheck size={18} strokeWidth={2.2} />}
            title="Reward Integrity"
            description="Developer games cannot emit arbitrary rewards, bypass caps, or create reward loops outside reward_service."
          />
        </div>
      </div>
    </div>
  );
}