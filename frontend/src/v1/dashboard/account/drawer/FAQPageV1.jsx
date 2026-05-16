import React from "react";
import {
  ChevronLeft,
  CircleHelp,
  Coins,
  Lock,
  ShoppingBag,
  Sparkles,
  Trophy,
  Wallet,
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

function FAQCard({ icon, question, answer }) {
  return (
    <div className="relative overflow-visible rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(14,24,34,0.94),rgba(6,10,18,0.98))] p-4 shadow-[0_12px_28px_rgba(0,0,0,0.28)]">
      <div className="pointer-events-none absolute inset-0 rounded-[22px] bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.08),transparent_45%)]" />

      <div className="relative flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border border-cyan-300/18 bg-cyan-400/10 text-cyan-100">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-sm font-black tracking-[-0.035em] text-white">
            {question}
          </div>

          <div className="mt-1.5 text-[11px] font-medium leading-5 text-white/50">
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FAQPageV1({ onBack }) {
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
          FAQs
        </div>

        <HeaderButton label="FAQ glow">
          <Sparkles size={15} strokeWidth={2.3} />
        </HeaderButton>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden px-3 py-3">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-28 w-52 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-24 w-24 rounded-full bg-violet-400/10 blur-2xl" />
        </div>

        <div className="relative z-10 flex h-full min-h-0 flex-col gap-2.5 overflow-y-auto pb-6 pr-1">
          <div className="relative overflow-visible rounded-[28px] border border-cyan-300/15 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.16),transparent_44%),radial-gradient(circle_at_85%_20%,rgba(168,85,247,0.10),transparent_36%),linear-gradient(180deg,rgba(12,20,32,0.96),rgba(5,9,18,0.98))] p-4 shadow-[0_16px_42px_rgba(0,0,0,0.36)]">
            <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-[linear-gradient(135deg,rgba(255,255,255,0.065),transparent_34%,rgba(34,211,238,0.045))]" />

            <div className="relative flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-400/10 text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.16)]">
                <CircleHelp size={22} strokeWidth={2.3} />
              </div>

              <div className="min-w-0">
                <div className="text-[22px] font-black tracking-[-0.06em] text-white">
                  Quick Answers
                </div>

                <div className="mt-1 text-xs font-medium leading-5 text-white/52">
                  A fast guide to rewards, unlocks, zPts, Shop, wallet access,
                  and progression in ZWAP!.
                </div>
              </div>
            </div>
          </div>

          <FAQCard
            icon={<Coins size={18} strokeWidth={2.2} />}
            question="What are zPts?"
            answer="zPts are off-chain progression points earned from daily activity, games, learning, tasks, and other approved actions. They track effort and unlock access."
          />

          <FAQCard
            icon={<Sparkles size={18} strokeWidth={2.2} />}
            question="How do I earn rewards?"
            answer="Rewards come from meaningful actions like moving, playing, learning, completing daily loops, maintaining streaks, and reaching milestones. ZWAP! rewards action, not passive presence."
          />

          <FAQCard
            icon={<Lock size={18} strokeWidth={2.2} />}
            question="Why are some features locked?"
            answer="Features unlock through progression so the app can guide users step by step. Shop, Garden, badges, and other layers open after enough activity is earned."
          />

          <FAQCard
            icon={<ShoppingBag size={18} strokeWidth={2.2} />}
            question="How does Shop work?"
            answer="Shop is a value destination. Once unlocked, items, perks, cosmetics, eBooks, and drops can appear there. Purchased or unlocked items can flow into Inventory."
          />

          <FAQCard
            icon={<Trophy size={18} strokeWidth={2.2} />}
            question="What are badges?"
            answer="Badges are identity markers earned through consistent behavior. They are separate from tier status and can represent movement, learning, assists, streaks, and other progress."
          />

          <FAQCard
            icon={<Wallet size={18} strokeWidth={2.2} />}
            question="Do I need a wallet?"
            answer="Not for every early action. ZWAP! can start with simple progression first, while wallet-connected features support higher-value rewards and ecosystem utility."
          />
        </div>
      </div>
    </div>
  );
}