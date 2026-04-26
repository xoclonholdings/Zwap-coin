import React from "react";
import { ChevronLeft, Bell, EyeOff, Smartphone, Moon } from "lucide-react";

function SettingRow({
  icon,
  title,
  description,
  enabled = false,
  onToggle,
}) {
  return (
    <div className="rounded-[18px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,24,34,0.9),rgba(8,14,20,0.95))] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.28)]">
      <div className="flex items-start gap-3">
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

        <button
          type="button"
          onClick={onToggle}
          className={[
            "relative mt-1 h-7 w-12 shrink-0 rounded-full border transition active:scale-[0.98]",
            enabled
              ? "border-cyan-400/30 bg-cyan-400/30"
              : "border-white/10 bg-white/[0.05]",
          ].join(" ")}
          aria-label={`Toggle ${title}`}
        >
          <span
            className={[
              "absolute top-1 h-5 w-5 rounded-full bg-white transition",
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
          Settings
        </div>

        <div className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-3">
          <SettingRow
            icon={<Bell size={18} />}
            title="Notifications"
            description="Receive streak reminders, unlock notices, and account activity alerts."
            enabled={notificationsEnabled}
            onToggle={onToggleNotifications}
          />

          <SettingRow
            icon={<EyeOff size={18} />}
            title="Privacy Mode"
            description="Hide sensitive balances and reduce visible account details."
            enabled={privacyModeEnabled}
            onToggle={onTogglePrivacyMode}
          />

          <SettingRow
            icon={<Smartphone size={18} />}
            title="Mobile Layout Lock"
            description="Keep ZWAP! locked to the mobile-first interface."
            enabled={mobileLayoutLocked}
            onToggle={onToggleMobileLayout}
          />

          <SettingRow
            icon={<Moon size={18} />}
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