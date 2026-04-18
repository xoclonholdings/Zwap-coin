import React from "react";
import { ChevronLeft, Bell, Moon, Shield, Smartphone } from "lucide-react";

function SettingCard({
  icon,
  title,
  description,
  enabled = false,
  onToggle,
}) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_12px_28px_rgba(0,0,0,0.22)]">
      <div className="flex items-start gap-3">
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

        <button
          type="button"
          onClick={onToggle}
          className={[
            "relative h-7 w-12 rounded-full transition",
            enabled ? "bg-cyan-400/80" : "bg-white/12",
          ].join(" ")}
        >
          <div
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
  reducedMotionEnabled = false,
  privacyModeEnabled = false,
  mobileOnlyModeEnabled = true,
  onToggleNotifications,
  onToggleReducedMotion,
  onTogglePrivacyMode,
  onToggleMobileOnlyMode,
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

        <div className="w-9" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-3">
          <SettingCard
            icon={<Bell size={18} strokeWidth={2} />}
            title="Notifications"
            description="Receive reminders, streak warnings, unlock updates, and account activity."
            enabled={notificationsEnabled}
            onToggle={onToggleNotifications}
          />

          <SettingCard
            icon={<Moon size={18} strokeWidth={2} />}
            title="Reduced Motion"
            description="Lower animation intensity across rings, cards, and transitions."
            enabled={reducedMotionEnabled}
            onToggle={onToggleReducedMotion}
          />

          <SettingCard
            icon={<Shield size={18} strokeWidth={2} />}
            title="Privacy Mode"
            description="Hide sensitive balances and reduce public visibility in activity surfaces."
            enabled={privacyModeEnabled}
            onToggle={onTogglePrivacyMode}
          />

          <SettingCard
            icon={<Smartphone size={18} strokeWidth={2} />}
            title="Mobile Layout Lock"
            description="Keep all ZWAP surfaces locked to the mobile layout experience."
            enabled={mobileOnlyModeEnabled}
            onToggle={onToggleMobileOnlyMode}
          />
        </div>
      </div>
    </div>
  );
}