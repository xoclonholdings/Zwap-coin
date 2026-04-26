import React from "react";
import { ChevronLeft, CircleHelp, FileText, Mail, MessageCircle } from "lucide-react";

function HelpRow({ icon, title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-[18px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,24,34,0.9),rgba(8,14,20,0.95))] p-4 text-left shadow-[0_8px_24px_rgba(0,0,0,0.28)] transition active:scale-[0.99]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.04] text-white/60">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold tracking-[-0.02em] text-white">
          {title}
        </div>

        <div className="mt-1 text-xs leading-5 text-white/50">
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

        <div className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-3">
          <HelpRow
            icon={<CircleHelp size={18} />}
            title="FAQs"
            description="Common answers about rewards, unlocks, Shop, zPts, and account access."
            onClick={onOpenFAQ}
          />

          <HelpRow
            icon={<Mail size={18} />}
            title="Contact"
            description="Reach support or send questions about your account."
            onClick={onOpenContact}
          />

          <HelpRow
            icon={<FileText size={18} />}
            title="About"
            description="Review what ZWAP! is and how the system works."
            onClick={onOpenAbout}
          />

          <HelpRow
            icon={<MessageCircle size={18} />}
            title="Support Chat"
            description="Open a direct help path when support chat is available."
            onClick={onOpenSupportChat}
          />
        </div>
      </div>
    </div>
  );
}