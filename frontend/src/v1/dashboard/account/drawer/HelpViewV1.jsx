import React, { useState } from "react";
import {
  ChevronLeft,
  CircleHelp,
  FileText,
  Mail,
  MessageCircle,
  Sparkles,
} from "lucide-react";

import FAQPageV1 from "./FAQPageV1";
import AboutPage from "./AboutPage";
import ContactPage from "./ContactPage";

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

function HelpRow({
  icon,
  title,
  description,
  onClick,
  accent = "default",
  disabled = false,
  badge = "",
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={[
        "relative flex w-full items-start gap-3 rounded-[22px] border p-4 text-left transition active:scale-[0.99]",
        "bg-[linear-gradient(180deg,rgba(14,24,34,0.92),rgba(6,10,18,0.98))]",
        "shadow-[0_10px_28px_rgba(0,0,0,0.28)]",
        accent === "primary" ? "border-cyan-400/20" : "border-white/10",
        disabled ? "opacity-65" : "",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.08),transparent_50%)]" />

      <div
        className={[
          "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border",
          accent === "primary"
            ? "border-cyan-300/25 bg-cyan-400/10 text-cyan-200"
            : "border-white/10 bg-white/[0.04] text-white/60",
        ].join(" ")}
      >
        {icon}
      </div>

      <div className="relative min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="text-sm font-black tracking-[-0.03em] text-white">
            {title}
          </div>

          {badge ? (
            <div className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-white/45">
              {badge}
            </div>
          ) : null}
        </div>

        <div className="mt-1 text-[11px] leading-4 text-white/48">
          {description}
        </div>
      </div>

      <div className="relative text-lg leading-none text-white/25">›</div>
    </button>
  );
}

export default function HelpViewV1({ onBack }) {
  const [activeHelpView, setActiveHelpView] = useState("home");

  if (activeHelpView === "faq") {
    return <FAQPageV1 onBack={() => setActiveHelpView("home")} />;
  }

  if (activeHelpView === "contact") {
    return <ContactPage onBack={() => setActiveHelpView("home")} />;
  }

  if (activeHelpView === "about") {
    return <AboutPage onBack={() => setActiveHelpView("home")} />;
  }

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
          Help
        </div>

        <HeaderButton label="Help glow">
          <Sparkles size={15} strokeWidth={2.3} />
        </HeaderButton>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden px-3 py-3">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-28 w-52 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-24 w-24 rounded-full bg-violet-400/10 blur-2xl" />
        </div>

        <div className="relative z-10 flex h-full flex-col gap-2.5">
          <HelpRow
            icon={<CircleHelp size={18} strokeWidth={2.2} />}
            title="FAQs"
            description="Quick answers about rewards, unlocks, Shop, zPts, and account access."
            onClick={() => setActiveHelpView("faq")}
            accent="primary"
          />

          <HelpRow
            icon={<Mail size={18} strokeWidth={2.2} />}
            title="Contact"
            description="Reach support or send questions about your account."
            onClick={() => setActiveHelpView("contact")}
          />

          <HelpRow
            icon={<FileText size={18} strokeWidth={2.2} />}
            title="About"
            description="Review what ZWAP! is and how the system works."
            onClick={() => setActiveHelpView("about")}
          />

          <HelpRow
            icon={<MessageCircle size={18} strokeWidth={2.2} />}
            title="Support Chat"
            description="Live support chat is planned for the next major drawer layer."
            disabled
            badge="V2"
          />
        </div>
      </div>
    </div>
  );
}
