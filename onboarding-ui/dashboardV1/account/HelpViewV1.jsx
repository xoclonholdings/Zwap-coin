import React from "react";
import {
  ChevronLeft,
  CircleHelp,
  Mail,
  FileText,
  MessageCircle,
} from "lucide-react";

function HelpCard({
  icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-[20px] border border-white/10 bg-white/[0.04] p-4 text-left shadow-[0_12px_28px_rgba(0,0,0,0.22)] transition active:scale-[0.99]"
    >
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

      <div className="text-white/25">›</div>
    </button>
  );
}

export default function HelpViewV1({
  onBack,
  onOpenFAQ,
  onOpenContact,
  onOpenAbout,
  onOpenSupportChat,
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
          Help
        </div>

        <div className="w-9" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-3">
          <HelpCard
            icon={<CircleHelp size={18} strokeWidth={2} />}
            title="FAQs"
            description="Read answers to common questions about ZWAP, rewards, streaks, and progression."
            onClick={onOpenFAQ}
          />

          <HelpCard
            icon={<Mail size={18} strokeWidth={2} />}
            title="Contact"
            description="Reach out for account support, partnership questions, or technical help."
            onClick={onOpenContact}
          />

          <HelpCard
            icon={<FileText size={18} strokeWidth={2} />}
            title="About"
            description="Learn more about the ZWAP system, mission, and progression model."
            onClick={onOpenAbout}
          />

          <HelpCard
            icon={<MessageCircle size={18} strokeWidth={2} />}
            title="Support Chat"
            description="Open a direct support channel for faster help and troubleshooting."
            onClick={onOpenSupportChat}
          />
        </div>
      </div>
    </div>
  );
}