import React from "react";
import {
  ChevronLeft,
  Globe,
  Mail,
  MessageCircle,
  Send,
  Sparkles,
} from "lucide-react";

const CONTACT_EMAIL = "app@zwap.online";

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

function ContactRow({ icon, title, description, action, href, tone = "cyan" }) {
  const toneClass =
    tone === "violet"
      ? "border-violet-300/18 bg-violet-400/10 text-violet-100"
      : tone === "pink"
        ? "border-pink-300/18 bg-pink-400/10 text-pink-100"
        : "border-cyan-300/18 bg-cyan-400/10 text-cyan-100";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="relative block overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(14,24,34,0.94),rgba(6,10,18,0.98))] p-3 shadow-[0_12px_28px_rgba(0,0,0,0.28)] active:scale-[0.99]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.08),transparent_45%)]" />

      <div className="relative flex items-center gap-3">
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

          <div className="mt-1 text-[11px] font-medium leading-4 text-white/48">
            {description}
          </div>

          <div className="mt-1 text-[11px] font-black tracking-[-0.02em] text-cyan-100">
            {action}
          </div>
        </div>

        <div className="text-lg leading-none text-white/25">›</div>
      </div>
    </a>
  );
}

export default function ContactPage({ onBack }) {
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
          Contact
        </div>

        <HeaderButton label="Contact ZWAP!">
          <Sparkles size={15} strokeWidth={2.3} />
        </HeaderButton>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden px-3 py-3">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-28 w-52 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-24 w-24 rounded-full bg-violet-400/10 blur-2xl" />
        </div>

        <div className="relative z-10 flex h-full min-h-0 flex-col gap-2.5 overflow-y-auto pr-1">
          <div className="relative overflow-hidden rounded-[28px] border border-cyan-300/15 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.16),transparent_44%),radial-gradient(circle_at_85%_20%,rgba(168,85,247,0.10),transparent_36%),linear-gradient(180deg,rgba(12,20,32,0.96),rgba(5,9,18,0.98))] p-4 text-center shadow-[0_16px_42px_rgba(0,0,0,0.36)]">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.065),transparent_34%,rgba(34,211,238,0.045))]" />

            <div className="relative flex flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-400/10 text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.16)]">
                <Mail size={23} strokeWidth={2.3} />
              </div>

              <div className="mt-3 text-[22px] font-black tracking-[-0.06em] text-white">
                Get in Touch
              </div>

              <div className="mt-2 max-w-[250px] text-xs font-medium leading-5 text-white/52">
                Questions, account help, business inquiries, and support all
                begin through the official ZWAP! contact channel.
              </div>
            </div>
          </div>

          <ContactRow
            icon={<Mail size={18} strokeWidth={2.2} />}
            title="Email Support"
            description="Get help with your account, access, or app questions."
            action={CONTACT_EMAIL}
            href={`mailto:${CONTACT_EMAIL}`}
            tone="cyan"
          />

          <ContactRow
            icon={<MessageCircle size={18} strokeWidth={2.2} />}
            title="General Inquiries"
            description="Business, partnership, sponsor, or platform questions."
            action={CONTACT_EMAIL}
            href={`mailto:${CONTACT_EMAIL}`}
            tone="violet"
          />

          <ContactRow
            icon={<Globe size={18} strokeWidth={2.2} />}
            title="Website"
            description="Visit the public ZWAP! site for broader ecosystem info."
            action="zwap.online"
            href="https://zwap.online"
            tone="pink"
          />

          <div className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025))] p-4 shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-cyan-300/18 bg-cyan-400/10 text-cyan-100">
                <Send size={17} strokeWidth={2.2} />
              </div>

              <div>
                <div className="text-sm font-black tracking-[-0.035em] text-white">
                  Response Window
                </div>
                <div className="mt-1 text-[11px] font-medium leading-5 text-white/50">
                  Typical response time is 24 to 48 hours once support review is active.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}