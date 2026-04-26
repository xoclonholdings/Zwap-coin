import React from "react";
import {
  ChevronLeft,
  Bell,
  EyeOff,
  Smartphone,
  Moon,
  SlidersHorizontal,
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

function SettingRow({
  icon,
  title,
  description,
  enabled = false,
  onToggle,
  locked = false,
}) {
  return (
    <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.08),transparent_44%),linear-gradient(180deg,rgba(14,24,34,0.94),rgba(6,10,18,0.98))] p-3.5 shadow-[0_12px_28px_rgba(0,0,0,0.28)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),transparent_40%)]" />

      <div className="relative flex items-center gap-3">
        <div
          className={[
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border",
            enabled
              ? "border-cyan-300/22 bg-cyan-400/10 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.12)]"
              : "border-white/10 bg-white/[0.04] text-white/48",
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
        </div>

        <button
          type="button"
          onClick={locked ? undefined : onToggle}
          disabled={locked}
          className={[
            "relative h-7 w-12 shrink-0 rounded-full border transition active:scale-[0.98]",
            enabled
              ? "border-cyan-300/30 bg-cyan-400/35 shadow-[0_0_16px_rgba(34,211,238,0.16)]"
              : "border-white/12 bg-white/[0.05]",
            locked ? "opacity-70" : "",
          ].join(" ")}
          aria-label={`Toggle ${title}`}
        >
          <span
            className={[
              "absolute top-1 h-5 w-5 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.25)] transition",
              enabled ? "left-6" : "left-1",
            ].join(" ")}
          />
        </button>
      </div>
    </div>
  );
}

export default function SettingsViewV1({
  onBack,
  notificationsEnabled = true,
  privacyModeEnabled = false,
  mobileLayoutLocked = true,
  reducedMotionEnabled = false,
  onToggleNotifications,
  onTogglePrivacyMode,
  onToggleMobileLayout,
  onToggleReducedMotion,
}) {
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
          Settings
        </div>

        <HeaderButton label="Settings control">
          <SlidersHorizontal size={15} strokeWidth={2.3} />
        </HeaderButton>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden px-3 py-3">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-28 w-52 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-24 w-24 rounded-full bg-violet-400/10 blur-2xl" />
        </div>

        <div className="relative z-10 flex h-full min-h-0 flex-col gap-2.5">
          <SettingRow
            icon={<Bell size={18} strokeWidth={2.2} />}
            title="Notifications"
            description="Streak reminders, unlock notices, and account activity alerts."
            enabled={notificationsEnabled}
            onToggle={onToggleNotifications}
          />

          <SettingRow
            icon={<EyeOff size={18} strokeWidth={2.2} />}
            title="Privacy Mode"
            description="Hide sensitive balances and reduce visible account details."
            enabled={privacyModeEnabled}
            onToggle={onTogglePrivacyMode}
          />

          <SettingRow
            icon={<Smartphone size={18} strokeWidth={2.2} />}
            title="Mobile Layout Lock"
            description="Keep ZWAP! locked to the mobile-first interface."
            enabled={mobileLayoutLocked}
            locked
            onToggle={onToggleMobileLayout}
          />

          <SettingRow
            icon={<Moon size={18} strokeWidth={2.2} />}
            title="Reduced Motion"
            description="Reduce animation intensity across drawer views and transitions."
            enabled={reducedMotionEnabled}
            onToggle={onToggleReducedMotion}
          />
        </div>
      </div>
    </div>
  );
}