import React from "react";
import {
  ArrowRightLeft,
  ChevronLeft,
  Footprints,
  Gamepad2,
  Shield,
  ShoppingBag,
  Sparkles,
  Zap,
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

function FeatureCard({ icon, title, description, tone = "cyan" }) {
  const toneClass =
    tone === "violet"
      ? "border-violet-300/18 bg-violet-400/10 text-violet-100"
      : tone === "pink"
        ? "border-pink-300/18 bg-pink-400/10 text-pink-100"
        : tone === "blue"
          ? "border-blue-300/18 bg-blue-400/10 text-blue-100"
          : "border-cyan-300/18 bg-cyan-400/10 text-cyan-100";

  return (
    <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(14,24,34,0.94),rgba(6,10,18,0.98))] p-3 shadow-[0_12px_28px_rgba(0,0,0,0.28)]">
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

          <div className="mt-1 text-[11px] font-medium leading-4 text-white/50">
            {description}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, children, icon }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025))] p-4 shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-cyan-300/18 bg-cyan-400/10 text-cyan-100">
          {icon}
        </div>

        <div className="min-w-0">
          <div className="text-sm font-black tracking-[-0.035em] text-white">
            {title}
          </div>

          <div className="mt-1 text-[11px] font-medium leading-5 text-white/50">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AboutPage({ onBack }) {
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
          About
        </div>

        <HeaderButton label="About ZWAP!">
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

            <div className="relative">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100/60">
                ZWAP!
              </div>

              <div className="mt-2 text-[24px] font-black leading-none tracking-[-0.07em] text-white">
                Move. Play. Earn.
              </div>

              <div className="mt-3 text-xs font-medium leading-5 text-white/55">
                ZWAP! is a behavior-based rewards ecosystem that turns daily
                action into visible progress, unlocks, and usable digital value.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <FeatureCard
              icon={<Footprints size={18} strokeWidth={2.2} />}
              title="MOVE"
              description="Earn progress from real activity and daily movement."
              tone="cyan"
            />

            <FeatureCard
              icon={<Gamepad2 size={18} strokeWidth={2.2} />}
              title="PLAY"
              description="Play games that feed the rewards loop."
              tone="violet"
            />

            <FeatureCard
              icon={<ArrowRightLeft size={18} strokeWidth={2.2} />}
              title="SWAP"
              description="Convert and use value through guided flows."
              tone="blue"
            />

            <FeatureCard
              icon={<ShoppingBag size={18} strokeWidth={2.2} />}
              title="SHOP"
              description="Spend earned value on drops, perks, and items."
              tone="pink"
            />
          </div>

          <InfoCard title="Dual Value Layer" icon={<Zap size={18} strokeWidth={2.2} />}>
            zPts track progression and effort. ZWAP! Coin represents higher-value
            ecosystem utility after thresholds, rules, and caps are met.
          </InfoCard>

          <InfoCard title="Built for Trust" icon={<Shield size={18} strokeWidth={2.2} />}>
            ZWAP! rewards action, not passive presence. Unlocks, badges, Shop
            access, and inventory are designed around controlled progression.
          </InfoCard>
        </div>
      </div>
    </div>
  );
}
