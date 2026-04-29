import React, { useMemo, useState } from "react";
import { Sprout, BookOpen, Play, Award, Lock } from "lucide-react";

import AccountDrawerV1 from "./account/AccountDrawerV1";
import AdminPanelV1 from "./admin/AdminPanelV1";

import activityLogo from "@/assets/dashboard/activity_logo.png";

function formatZpts(value) {
  return Number(value || 0).toLocaleString();
}

function buildInitials(name = "") {
  const safe = String(name || "").trim();
  if (!safe) return "U";

  const parts = safe.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

function HeaderIconButton({
  label,
  icon,
  unlocked = true,
  hasAlert = false,
  onClick,
  tone = "cyan",
}) {
  const unlockedStyles =
    tone === "garden"
      ? "border-lime-300/45 bg-lime-300/15 text-lime-300 shadow-[0_0_16px_rgba(132,204,22,0.24)]"
      : "border-cyan-400/45 bg-cyan-500/15 text-cyan-300 shadow-[0_0_14px_rgba(34,211,238,0.20)]";

  const alertStyles =
    tone === "garden"
      ? "bg-lime-300 shadow-[0_0_8px_rgba(190,242,100,0.8)]"
      : "bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.8)]";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={[
        "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition active:scale-[0.96]",
        unlocked
          ? unlockedStyles
          : "border-white/10 bg-white/[0.03] text-white/25",
        hasAlert ? "animate-pulse" : "",
      ].join(" ")}
    >
      {icon}

      {!unlocked && (
        <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-white/10 bg-[#05070b] text-white/45">
          <Lock size={8} />
        </span>
      )}

      {hasAlert && unlocked && (
        <span className={`absolute right-0 top-0 h-1.5 w-1.5 rounded-full ${alertStyles}`} />
      )}
    </button>
  );
}

function HeaderPopup({ popup, onClose }) {
  if (!popup) return null;

  return (
    <div className="fixed left-1/2 top-[86px] z-[9999] w-[250px] -translate-x-1/2 rounded-2xl border border-white/10 bg-[#0c1220]/95 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl">
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300/80">
        {popup.title}
      </div>

      <div className="mt-1 text-[12px] leading-5 text-white/80">
        {popup.message}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="mt-3 text-[10px] font-medium uppercase tracking-[0.14em] text-cyan-300/80"
      >
        Close
      </button>
    </div>
  );
}

export default function AppHeaderV1({
  zptsBalance = 0,
  displayName = "",
  initials,
  isOnline = true,
  isSticky = true,
  className = "",

  gardenUnlocked = false,
  learnUnlocked = false,
  streamUnlocked = false,
  badgesUnlocked = false,

  gardenHasAlert = false,
  learnHasAlert = false,
  streamHasAlert = false,
  badgesHasAlert = false,

  onActivityClick,
  onGardenClick,
  onLearnClick,
  onStreamClick,
  onBadgeClick,

  user,
  authUser,
  tier = "zwapper",
  walletAddress = "",
  zwapBalance = 0,
  inventoryItems = [],
  achievements = [],
  trophyCount = 0,
  trophyBonusPercent = 0,

  onOpenFAQ,
  onOpenContact,
  onOpenAbout,
  onOpenSupportChat,
}) {
  const [popup, setPopup] = useState(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  const accountInitials = useMemo(() => {
    return initials || buildInitials(displayName);
  }, [initials, displayName]);

  function showLockedPopup(title, message) {
    setPopup({ title, message });
  }

  function handleAdminOpen() {
    setAccountOpen(false);
    setAdminOpen(true);
  }

  function handleGardenTap() {
    if (!gardenUnlocked) {
      showLockedPopup(
        "Garden Locked",
        "Complete 3 active days or your first full daily loop to unlock Garden."
      );
      return;
    }

    setPopup(null);
    onGardenClick?.();
  }

  function handleLearnTap() {
    if (!learnUnlocked) {
      showLockedPopup("Learn Locked", "Complete more progress to unlock Learn.");
      return;
    }

    setPopup(null);
    onLearnClick?.();
  }

  function handleStreamTap() {
    if (!streamUnlocked) {
      showLockedPopup("Stream Locked", "Complete more progress to unlock Stream.");
      return;
    }

    setPopup(null);
    onStreamClick?.();
  }

  function handleBadgeTap() {
    if (!badgesUnlocked) {
      showLockedPopup("Badges Locked", "Complete more progress to unlock Badges.");
      return;
    }

    setPopup(null);
    onBadgeClick?.();
  }

  return (
    <>
      <div
        className={[
          isSticky ? "sticky top-0 z-40" : "",
          "w-full px-3 pt-3",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="flex h-[64px] items-center gap-2 rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,26,0.94),rgba(5,10,16,0.96))] px-3 shadow-[0_12px_34px_rgba(0,0,0,0.28)] backdrop-blur-xl">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <HeaderIconButton
              label="Activity"
              onClick={onActivityClick}
              icon={
                <img
                  src={activityLogo}
                  alt="Activity"
                  className="h-4 w-4 object-contain"
                />
              }
            />

            <HeaderIconButton
              label="Garden"
              unlocked={gardenUnlocked}
              hasAlert={gardenHasAlert}
              onClick={handleGardenTap}
              tone="garden"
              icon={<Sprout size={15} />}
            />

            <HeaderIconButton
              label="Learn"
              unlocked={learnUnlocked}
              hasAlert={learnHasAlert}
              onClick={handleLearnTap}
              icon={<BookOpen size={15} />}
            />

            <HeaderIconButton
              label="Stream"
              unlocked={streamUnlocked}
              hasAlert={streamHasAlert}
              onClick={handleStreamTap}
              icon={<Play size={15} />}
            />

            <HeaderIconButton
              label="Badges"
              unlocked={badgesUnlocked}
              hasAlert={badgesHasAlert}
              onClick={handleBadgeTap}
              icon={<Award size={15} />}
            />
          </div>

          <div className="shrink-0 rounded-2xl border border-cyan-400/14 bg-cyan-400/[0.06] px-3 py-1.5 text-center shadow-[0_0_16px_rgba(34,211,238,0.08)]">
            <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/42">
              Balance
            </div>
            <div className="mt-0.5 whitespace-nowrap text-[14px] font-bold tracking-[-0.03em] text-cyan-300">
              {formatZpts(zptsBalance)} zPts
            </div>
          </div>

          <button
            type="button"
            onClick={() => setAccountOpen(true)}
            className="relative ml-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cyan-400/18 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_42%),linear-gradient(180deg,rgba(15,28,38,0.96),rgba(8,14,20,0.98))] text-sm font-semibold text-white shadow-[0_0_18px_rgba(34,211,238,0.10)] transition active:scale-[0.97]"
          >
            {accountInitials}

            {isOnline && (
              <span className="absolute bottom-[2px] right-[2px] h-2.5 w-2.5 rounded-full border border-[#081018] bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,0.55)]" />
            )}
          </button>
        </div>
      </div>

      <HeaderPopup popup={popup} onClose={() => setPopup(null)} />

      <AccountDrawerV1
        open={accountOpen}
        onOpenChange={setAccountOpen}
        user={user}
        authUser={authUser}
        username={displayName}
        initials={accountInitials}
        tier={tier}
        zptsBalance={zptsBalance}
        zwapBalance={zwapBalance}
        walletAddress={walletAddress}
        inventoryItems={inventoryItems}
        achievements={achievements}
        trophyCount={trophyCount}
        trophyBonusPercent={trophyBonusPercent}
        learnUnlocked={learnUnlocked}
        streamUnlocked={streamUnlocked}
        onAdminTrigger={handleAdminOpen}
        onLearnOpen={onLearnClick}
        onStreamOpen={onStreamClick}
        onOpenFAQ={onOpenFAQ}
        onOpenContact={onOpenContact}
        onOpenAbout={onOpenAbout}
        onOpenSupportChat={onOpenSupportChat}
      />

      <AdminPanelV1 isOpen={adminOpen} onClose={() => setAdminOpen(false)} />
    </>
  );
}
