import React, { useEffect, useRef, useState } from "react";
import {
  BadgeDollarSign,
  ChevronLeft,
  Code2,
  Gamepad2,
  Lock,
  Megaphone,
  ShieldCheck,
  X,
} from "lucide-react";

function HeaderButton({ children, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-300/20 bg-emerald-400/10 text-emerald-100 shadow-[0_0_18px_rgba(16,185,129,0.14)] transition active:scale-[0.97]"
    >
      {children}
    </button>
  );
}

function LockedNotice({ title, description, onClose }) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 px-5 backdrop-blur-[3px]">
      <div className="relative w-full max-w-[340px] overflow-hidden rounded-[26px] border border-emerald-300/18 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.16),transparent_46%),linear-gradient(180deg,rgba(8,18,24,0.98),rgba(4,8,14,1))] p-4 text-white shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close locked notice"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-white/55 transition active:scale-[0.97]"
        >
          <X size={16} strokeWidth={2.4} />
        </button>

        <div className="flex h-12 w-12 items-center justify-center rounded-[16px] border border-emerald-300/24 bg-emerald-400/12 text-emerald-100 shadow-[0_0_18px_rgba(16,185,129,0.12)]">
          <Lock size={19} strokeWidth={2.3} />
        </div>

        <div className="mt-4 text-[18px] font-semibold tracking-[-0.03em] text-white">
          {title}
        </div>

        <div className="mt-2 text-[12px] font-medium leading-5 text-white/52">
          {description}
        </div>
      </div>
    </div>
  );
}

function ModeButton({ icon, title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex min-h-[92px] flex-1 items-center gap-3 overflow-hidden rounded-[22px] border border-cyan-300/14 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.10),transparent_44%),linear-gradient(180deg,rgba(14,24,34,0.94),rgba(6,10,18,0.98))] p-3 text-left shadow-[0_12px_28px_rgba(0,0,0,0.28)] transition active:scale-[0.98]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-cyan-300/20 bg-cyan-400/10 text-cyan-100 shadow-[0_0_16px_rgba(34,211,238,0.10)]">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-[13px] font-semibold tracking-[-0.02em] text-white/92">
          {title}
          <Lock size={12} strokeWidth={2.3} className="text-white/34" />
        </div>

        <div className="mt-1 text-[10px] font-medium leading-4 text-white/45">
          {description}
        </div>
      </div>
    </button>
  );
}

function InfoLine({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/8 py-2 last:border-b-0">
      <span className="text-[10px] font-black uppercase tracking-[0.12em] text-white/35">
        {label}
      </span>

      <span className="text-right text-[11px] font-semibold text-white/62">
        {value}
      </span>
    </div>
  );
}

export default function DevelopersViewV1({
  onBack,
  initialSection = "overview",
}) {
  const earnCashRef = useRef(null);
  const [lockedNotice, setLockedNotice] = useState(null);

  useEffect(() => {
    if (initialSection !== "earnCash") return;

    requestAnimationFrame(() => {
      earnCashRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, [initialSection]);

  const openLockedNotice = (type) => {
    if (type === "earnCash") {
      setLockedNotice({
        title: "Earn Cash Locked",
        description:
          "Earn Cash is a future sponsor-backed reward layer. It stays locked until challenge rules, partner funding, and reward_service protections are active.",
      });
      return;
    }

    if (type === "games") {
      setLockedNotice({
        title: "Game Submission Locked",
        description:
          "Game submissions open after the Developer Portal review flow is ready. Every game must pass quality, safety, and reward-integrity checks before it can enter ZWAP!.",
      });
      return;
    }

    setLockedNotice({
      title: "Campaigns Locked",
      description:
        "Campaigns are for sponsor-backed challenges and reward pools. They remain locked until sponsor rules, caps, and approval workflows are active.",
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[linear-gradient(180deg,rgba(6,12,18,0.98),rgba(4,8,14,1))] text-white">
      {lockedNotice ? (
        <LockedNotice
          title={lockedNotice.title}
          description={lockedNotice.description}
          onClose={() => setLockedNotice(null)}
        />
      ) : null}

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

        <div className="relative z-10 flex h-full min-h-0 flex-col gap-2.5 overflow-y-auto pb-6 pr-1">
          <button
            ref={earnCashRef}
            type="button"
            onClick={() => openLockedNotice("earnCash")}
            className="relative overflow-hidden rounded-[26px] border border-emerald-300/16 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_42%),linear-gradient(180deg,rgba(10,28,24,0.96),rgba(5,10,18,0.99))] p-4 text-left shadow-[0_16px_34px_rgba(0,0,0,0.32)] transition active:scale-[0.99]"
          >
            <div className="relative flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border border-emerald-300/24 bg-emerald-400/12 text-emerald-100 shadow-[0_0_18px_rgba(16,185,129,0.12)]">
                <BadgeDollarSign size={19} strokeWidth={2.3} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-[16px] font-semibold tracking-[-0.03em] text-white">
                  Earn Cash
                  <Lock size={13} strokeWidth={2.4} className="text-white/34" />
                </div>

                <div className="mt-1 text-[12px] font-medium leading-5 text-white/55">
                  A future sponsor-backed layer for verified challenges,
                  campaign rewards, and cash-equivalent opportunities.
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-emerald-300/12 bg-emerald-400/[0.055] px-3 py-3 text-[11px] font-medium leading-5 text-white/52">
              Locked until sponsor funding, challenge rules, user eligibility,
              and reward_service safeguards are fully active.
            </div>

            <div className="mt-2 rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-1">
              <InfoLine label="Reward Type" value="Sponsor-backed" />
              <InfoLine label="Entry Point" value="PLAY + Challenges" />
              <InfoLine label="Status" value="Locked" />
            </div>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <ModeButton
              icon={<Gamepad2 size={17} strokeWidth={2.2} />}
              title="Games"
              description="Submit games for review and future PLAY integration."
              onClick={() => openLockedNotice("games")}
            />

            <ModeButton
              icon={<Megaphone size={17} strokeWidth={2.2} />}
              title="Campaigns"
              description="Create sponsor challenge pools and reward activations."
              onClick={() => openLockedNotice("campaigns")}
            />
          </div>

          <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(14,24,34,0.88),rgba(6,10,18,0.98))] p-3.5 shadow-[0_10px_24px_rgba(0,0,0,0.22)]">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-emerald-300/18 bg-emerald-400/10 text-emerald-100/78">
                <ShieldCheck size={17} strokeWidth={2.2} />
              </div>

              <div>
                <div className="text-sm font-semibold tracking-[-0.02em] text-white/88">
                  Portal Rule
                </div>

                <div className="mt-1 text-[11px] font-medium leading-5 text-white/46">
                  Developers and sponsors cannot issue arbitrary rewards. Every
                  submission must route through review, standardized signals,
                  caps, and reward_service.
                </div>
              </div>
            </div>
          </div>

          <div className="px-2 pb-1 pt-1 text-center text-[10px] font-medium leading-4 text-white/34">
            Developer access is approval-based and opens after the V1 progression
            economy is stable.
          </div>
        </div>
      </div>
    </div>
  );
}