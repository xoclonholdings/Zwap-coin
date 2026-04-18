import React, { useMemo, useState } from "react";
import {
  Sprout,
  BookOpen,
  Radio,
  Shield,
} from "lucide-react";

import AccountDrawer from "@/components/ui/dashboard/drawer/AccountDrawer";

function clampPercent(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(100, num));
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function getInitials(username) {
  if (!username || typeof username !== "string") return "ZW";

  const parts = username.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

function HeaderIconButton({
  visible = false,
  icon,
  active = false,
  onClick,
}) {
  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-200",
        active
          ? "border-cyan-400/40 bg-cyan-500/15 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.18)]"
          : "border-white/10 bg-white/[0.04] text-white/55 hover:border-white/20 hover:text-white/80",
      ].join(" ")}
    >
      {icon}
    </button>
  );
}

export default function AppHeaderV1({
  progressPercent = 0,
  zptsBalance = 0,
  username = "Zwapper",

  gardenUnlocked = false,
  learnUnlocked = false,
  streamUnlocked = false,
  badgesUnlocked = false,

  onGardenClick,
  onLearnClick,
  onStreamClick,
  onBadgeClick,
}) {
  const [accountOpen, setAccountOpen] = useState(false);

  const safePercent = clampPercent(progressPercent);
  const initials = useMemo(() => getInitials(username), [username]);

  return (
    <>
      <header className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-3 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2 overflow-hidden">
          {/* Progress */}
          <div className="min-w-0 flex-1">
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-violet-400 transition-all duration-300"
                style={{ width: `${safePercent}%` }}
              />
            </div>
          </div>

          {/* Unlock Icons */}
          <div className="flex shrink-0 items-center gap-1">
            <HeaderIconButton
              visible={gardenUnlocked}
              onClick={onGardenClick}
              icon={<Sprout size={15} />}
              active={gardenUnlocked}
            />

            <HeaderIconButton
              visible={learnUnlocked}
              onClick={onLearnClick}
              icon={<BookOpen size={15} />}
              active={learnUnlocked}
            />

            <HeaderIconButton
              visible={streamUnlocked}
              onClick={onStreamClick}
              icon={<Radio size={15} />}
              active={streamUnlocked}
            />

            <HeaderIconButton
              visible={badgesUnlocked}
              onClick={onBadgeClick}
              icon={<Shield size={15} />}
              active={badgesUnlocked}
            />
          </div>

          {/* zPts */}
          <div className="shrink-0 whitespace-nowrap text-sm font-bold text-white">
            {formatNumber(zptsBalance)} zPts
          </div>

          {/* Avatar */}
          <button
            type="button"
            onClick={() => setAccountOpen(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cyan-400/30 bg-gradient-to-br from-cyan-500/20 to-violet-500/20 text-xs font-bold text-white shadow-[0_0_12px_rgba(34,211,238,0.15)]"
          >
            {initials}
          </button>
        </div>
      </header>

      <AccountDrawer
        open={accountOpen}
        onOpenChange={setAccountOpen}
      />
    </>
  );
}