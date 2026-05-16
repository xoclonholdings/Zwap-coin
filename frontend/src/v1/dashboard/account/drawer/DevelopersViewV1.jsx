import React, { useMemo, useState } from "react";
import {
  ChevronLeft,
  Code2,
  Gamepad2,
  Megaphone,
  Wrench,
  KeyRound,
  Plus,
  Boxes,
  Send,
} from "lucide-react";

function HeaderButton({ children, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-300/18 bg-cyan-400/10 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.12)] transition active:scale-[0.97]"
    >
      {children}
    </button>
  );
}

function ModeCard({
  icon,
  title,
  description,
  active = false,
  tone = "cyan",
  onClick,
}) {
  const activeStyles =
    tone === "gold"
      ? "border-amber-300/30 bg-amber-400/[0.10] shadow-[0_0_24px_rgba(251,191,36,0.12)]"
      : tone === "violet"
        ? "border-violet-300/30 bg-violet-400/[0.10] shadow-[0_0_24px_rgba(168,85,247,0.12)]"
        : "border-cyan-300/28 bg-cyan-400/[0.09] shadow-[0_0_24px_rgba(34,211,238,0.12)]";

  const iconStyles =
    tone === "gold"
      ? "border-amber-300/22 bg-amber-400/10 text-amber-100"
      : tone === "violet"
        ? "border-violet-300/22 bg-violet-400/10 text-violet-100"
        : "border-cyan-300/22 bg-cyan-400/10 text-cyan-100";

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative overflow-hidden rounded-[24px] border p-3 text-left transition active:scale-[0.985]",
        active
          ? activeStyles
          : "border-white/10 bg-white/[0.03]",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.05),transparent_48%)]" />

      <div className="relative">
        <div
          className={[
            "flex h-11 w-11 items-center justify-center rounded-[15px] border",
            iconStyles,
          ].join(" ")}
        >
          {icon}
        </div>

        <div className="mt-4 text-[15px] font-black tracking-[-0.03em] text-white">
          {title}
        </div>

        <div className="mt-1 text-[11px] leading-5 text-white/48">
          {description}
        </div>
      </div>
    </button>
  );
}

function ActionCard({
  icon,
  title,
  subtitle,
  tone = "cyan",
}) {
  const toneStyles =
    tone === "gold"
      ? {
          card: "border-amber-300/18 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.12),transparent_44%),linear-gradient(180deg,rgba(32,22,10,0.98),rgba(14,10,6,0.98))]",
          icon: "border-amber-300/20 bg-amber-400/10 text-amber-100",
        }
      : tone === "violet"
        ? {
            card: "border-violet-300/18 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.12),transparent_44%),linear-gradient(180deg,rgba(22,14,34,0.98),rgba(10,6,18,0.98))]",
            icon: "border-violet-300/20 bg-violet-400/10 text-violet-100",
          }
        : {
            card: "border-cyan-300/18 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_44%),linear-gradient(180deg,rgba(10,24,34,0.98),rgba(6,10,18,0.98))]",
            icon: "border-cyan-300/20 bg-cyan-400/10 text-cyan-100",
          };

  return (
    <button
      type="button"
      className={[
        "relative overflow-hidden rounded-[26px] border p-4 text-left shadow-[0_16px_34px_rgba(0,0,0,0.30)] transition active:scale-[0.985]",
        toneStyles.card,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),transparent_38%)]" />

      <div className="relative flex items-start gap-3">
        <div
          className={[
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border",
            toneStyles.icon,
          ].join(" ")}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-[16px] font-black tracking-[-0.03em] text-white">
            {title}
          </div>

          <div className="mt-1 text-[12px] leading-5 text-white/55">
            {subtitle}
          </div>
        </div>
      </div>
    </button>
  );
}

function StatusPill({ label, tone = "cyan" }) {
  const styles =
    tone === "gold"
      ? "border-amber-300/18 bg-amber-400/[0.08] text-amber-100/85"
      : tone === "violet"
        ? "border-violet-300/18 bg-violet-400/[0.08] text-violet-100/85"
        : "border-cyan-300/18 bg-cyan-400/[0.08] text-cyan-100/85";

  return (
    <div
      className={[
        "shrink-0 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em]",
        styles,
      ].join(" ")}
    >
      {label}
    </div>
  );
}

export default function DevelopersViewV1({ onBack }) {
  const [activeMode, setActiveMode] = useState("integrations");

  const content = useMemo(() => {
    switch (activeMode) {
      case "games":
        return {
          tone: "violet",
          action: {
            icon: <Gamepad2 size={20} strokeWidth={2.3} />,
            title: "Submit Game Build",
            subtitle:
              "Upload playable experiences for PLAY ecosystem review and deployment.",
          },
          pills: [
            "Build Review",
            "Game Signals",
            "Arcade Engine",
          ],
        };

      case "sponsors":
        return {
          tone: "gold",
          action: {
            icon: <Megaphone size={20} strokeWidth={2.3} />,
            title: "Create Sponsor Campaign",
            subtitle:
              "Launch challenge pools, Tapjoy reward activations, and engagement campaigns.",
          },
          pills: [
            "Tapjoy",
            "Offerwall",
            "Reward Pools",
          ],
        };

      case "tools":
        return {
          tone: "cyan",
          action: {
            icon: <Wrench size={20} strokeWidth={2.3} />,
            title: "Open Creator Tools",
            subtitle:
              "Access creator utilities, diagnostics, payload testing, and automation controls.",
          },
          pills: [
            "Diagnostics",
            "Signals",
            "Payloads",
          ],
        };

      default:
        return {
          tone: "cyan",
          action: {
            icon: <KeyRound size={20} strokeWidth={2.3} />,
            title: "Create Integration",
            subtitle:
              "Generate API connections, callback routes, and event signal integrations.",
          },
          pills: [
            "API Keys",
            "Callbacks",
            "Events",
          ],
        };
    }
  }, [activeMode]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-[linear-gradient(180deg,rgba(6,12,18,0.98),rgba(4,8,14,1))] text-white">
      {/* Header */}
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

        <HeaderButton label="Developer tools">
          <Code2 size={15} strokeWidth={2.3} />
        </HeaderButton>
      </div>

      {/* Body */}
      <div className="relative min-h-0 flex-1 overflow-hidden px-3 py-3">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-28 w-52 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-24 w-24 rounded-full bg-violet-400/10 blur-2xl" />
          <div className="absolute bottom-20 left-0 h-28 w-28 rounded-full bg-amber-300/10 blur-3xl" />
        </div>

        <div className="relative z-10 flex h-full min-h-0 flex-col gap-3 overflow-y-auto pr-1">
          {/* Hero */}
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.12),transparent_44%),radial-gradient(circle_at_85%_20%,rgba(168,85,247,0.10),transparent_36%),linear-gradient(180deg,rgba(12,20,32,0.96),rgba(5,9,18,0.98))] p-4 shadow-[0_16px_42px_rgba(0,0,0,0.36)]">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent_34%)]" />

            <div className="relative">
              <div className="text-[24px] font-black tracking-[-0.06em] text-white">
                Developer Hub
              </div>

              <div className="mt-1 text-[12px] leading-5 text-white/55">
                Build integrations, games, campaigns, and connected experiences
                for the ZWAP! ecosystem.
              </div>
            </div>
          </div>

          {/* Modes */}
          <div className="grid grid-cols-2 gap-2.5">
            <ModeCard
              active={activeMode === "integrations"}
              onClick={() => setActiveMode("integrations")}
              icon={<KeyRound size={18} strokeWidth={2.2} />}
              title="Integrations"
              description="Connect apps and external systems."
            />

            <ModeCard
              active={activeMode === "games"}
              tone="violet"
              onClick={() => setActiveMode("games")}
              icon={<Gamepad2 size={18} strokeWidth={2.2} />}
              title="Games"
              description="Submit playable experiences."
            />

            <ModeCard
              active={activeMode === "sponsors"}
              tone="gold"
              onClick={() => setActiveMode("sponsors")}
              icon={<Megaphone size={18} strokeWidth={2.2} />}
              title="Sponsors"
              description="Launch reward campaigns."
            />

            <ModeCard
              active={activeMode === "tools"}
              onClick={() => setActiveMode("tools")}
              icon={<Wrench size={18} strokeWidth={2.2} />}
              title="Tools"
              description="Creator utilities and controls."
            />
          </div>

          {/* Main Action */}
          <ActionCard
            tone={content.tone}
            icon={content.action.icon}
            title={content.action.title}
            subtitle={content.action.subtitle}
          />

          {/* Status Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {content.pills.map((pill) => (
              <StatusPill
                key={pill}
                label={pill}
                tone={content.tone}
              />
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2.5 pb-4">
            <button
              type="button"
              className="flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-4 transition active:scale-[0.985]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-cyan-300/18 bg-cyan-400/10 text-cyan-100">
                <Plus size={18} strokeWidth={2.3} />
              </div>

              <div className="text-left">
                <div className="text-[13px] font-black text-white">
                  New
                </div>

                <div className="text-[10px] text-white/45">
                  Create resource
                </div>
              </div>
            </button>

            <button
              type="button"
              className="flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-4 transition active:scale-[0.985]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-violet-300/18 bg-violet-400/10 text-violet-100">
                <Boxes size={18} strokeWidth={2.3} />
              </div>

              <div className="text-left">
                <div className="text-[13px] font-black text-white">
                  Assets
                </div>

                <div className="text-[10px] text-white/45">
                  View resources
                </div>
              </div>
            </button>

            <button
              type="button"
              className="col-span-2 flex items-center justify-center gap-3 rounded-[24px] border border-cyan-300/18 bg-[linear-gradient(180deg,rgba(18,34,48,0.96),rgba(8,14,22,0.98))] px-4 py-4 text-white shadow-[0_16px_30px_rgba(0,0,0,0.28)] transition active:scale-[0.985]"
            >
              <Send size={18} strokeWidth={2.3} />
              <span className="text-[14px] font-black tracking-[-0.02em]">
                Send Developer Packet
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}