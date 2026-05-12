import React, { useEffect, useRef, useState } from "react";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useApp } from "@/app/AppProvider";
import { generateUsername } from "@/lib/utils/generateUsername";

import AccountDrawerHeaderV1 from "./AccountDrawerHeaderV1";
import AccountProfileCardV1 from "./AccountProfileCardV1";
import AccountBalanceCardV1 from "./AccountBalanceCardV1";
import AccountActionRowV1 from "./AccountActionRowV1";
import AccountShieldCardV1 from "./AccountShieldCardV1";
import AccountFooterLinksV1 from "./AccountFooterLinksV1";

import ProfileViewV1 from "./drawer/ProfileViewV1";
import InventoryViewV1 from "./drawer/InventoryViewV1";
import AchievementsViewV1 from "./drawer/AchievementsViewV1";
import SettingsViewV1 from "./drawer/SettingsViewV1";
import HelpViewV1 from "./drawer/HelpViewV1";
import PrivacyViewV1 from "./drawer/PrivacyViewV1";
import TermsViewV1 from "./drawer/TermsViewV1";

import EditProfileView from "./drawer/buttons/EditProfileView";
import EditInventoryView from "./drawer/buttons/EditInventoryView";
import EditAchievementsView from "./drawer/buttons/EditAchievementsView";
import EditSettingsView from "./drawer/buttons/EditSettingsView";

const ADMIN_TAP_THRESHOLD = 3;
const ADMIN_TAP_RESET_MS = 1200;

const REVIEW_ACCESS_STORAGE_KEY = "zwap_review_access_enabled";
const REVIEW_EMAIL_STORAGE_KEY = "zwap_review_email";

function getReviewAccessEnabled() {
  try {
    return window.localStorage.getItem(REVIEW_ACCESS_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function clearReviewAccess() {
  try {
    window.localStorage.removeItem(REVIEW_ACCESS_STORAGE_KEY);
    window.localStorage.removeItem(REVIEW_EMAIL_STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
}

function LockedDevelopersNotice({ onClose }) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center px-5">
      <button
        type="button"
        aria-label="Close developers locked notice"
        onClick={onClose}
        className="absolute inset-0 bg-black/68 backdrop-blur-[3px]"
      />

      <div className="relative z-10 w-full max-w-[340px] overflow-hidden rounded-[28px] border border-emerald-300/18 bg-[linear-gradient(180deg,rgba(5,18,19,0.98),rgba(5,9,18,0.99))] p-5 text-center shadow-[0_0_42px_rgba(16,185,129,0.14)]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-24 w-44 -translate-x-1/2 rounded-full bg-emerald-400/12 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-24 w-24 rounded-full bg-cyan-400/10 blur-2xl" />
        </div>

        <div className="relative z-10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald-300/25 bg-emerald-400/10 text-emerald-100 shadow-[0_0_18px_rgba(16,185,129,0.12)]">
            <Lock size={19} strokeWidth={2.7} />
          </div>

          <div className="mt-4 text-[15px] font-black uppercase tracking-[0.14em] text-white">
            Developers Locked
          </div>

          <div className="mt-2 text-[12px] leading-5 text-white/58">
            Sponsored challenges, partner campaigns, and real reward
            opportunities unlock later in your journey.
          </div>

          <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-3 text-[11px] leading-4 text-white/45">
            Requirements will appear here once the progression path is set.
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-4 w-full rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-[12px] font-black uppercase tracking-[0.12em] text-emerald-100 transition active:scale-[0.98]"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AccountPanelContentV1({
  onClose,
  onAdminTrigger,
  onLearnOpen,
  onStreamOpen,

  onOpenFAQ,
  onOpenContact,
  onOpenAbout,
  onOpenSupportChat,

  learnUnlocked = false,
  streamUnlocked = false,

  user,
  authUser,
  username = "",
  tier = "zwapper",
  zptsBalance = 0,
  zwapBalance = 0,

  inventoryItems = [],
  achievements = [],
  trophyCount = 0,
  trophyBonusPercent = 0,
}) {
  const navigate = useNavigate();
  const { isAuthenticated, logoutAll } = useApp();

  const [activeView, setActiveView] = useState("home");
  const [developersLockedOpen, setDevelopersLockedOpen] = useState(false);
  const [isReviewAccess] = useState(() => getReviewAccessEnabled());

  const [profileOverrides, setProfileOverrides] = useState({
    username: "",
    email: "",
  });

  const [inventorySettings, setInventorySettings] = useState({
    showOwnedOnly: true,
    showLockedItems: false,
    groupByCategory: true,
  });

  const [achievementSettings, setAchievementSettings] = useState({
    showLockedBadges: true,
    showTrophyProgress: true,
    showBadgeHints: true,
  });

  const adminTapCountRef = useRef(0);
  const adminTapResetRef = useRef(null);

  const canLogout = isAuthenticated || isReviewAccess;

  const baseEmail =
    authUser?.email?.address ||
    authUser?.email ||
    user?.email ||
    (isReviewAccess ? "review@zwap.app" : "");

  const resolvedEmail = profileOverrides.email || baseEmail;

  const resolvedUsername = generateUsername({
    username: profileOverrides.username || user?.username || username,
    email: resolvedEmail,
  });

  useEffect(() => {
    return () => {
      if (adminTapResetRef.current) {
        clearTimeout(adminTapResetRef.current);
      }
    };
  }, []);

  const resetAdminTapCounter = () => {
    adminTapCountRef.current = 0;

    if (adminTapResetRef.current) {
      clearTimeout(adminTapResetRef.current);
      adminTapResetRef.current = null;
    }
  };

  const handleAdminTap = () => {
    adminTapCountRef.current += 1;

    if (adminTapResetRef.current) {
      clearTimeout(adminTapResetRef.current);
    }

    adminTapResetRef.current = setTimeout(() => {
      resetAdminTapCounter();
    }, ADMIN_TAP_RESET_MS);

    if (adminTapCountRef.current >= ADMIN_TAP_THRESHOLD) {
      resetAdminTapCounter();
      onAdminTrigger?.();
    }
  };

  const handleLearnOpen = (payload) => {
    onClose?.();
    onLearnOpen?.(payload);
  };

  const handleStreamOpen = () => {
    onClose?.();
    onStreamOpen?.();
  };

  const handleDevelopersLockedOpen = () => {
    setDevelopersLockedOpen(true);
  };

  const handleLogout = async () => {
    try {
      clearReviewAccess();

      if (isAuthenticated) {
        await logoutAll?.();
      }
    } finally {
      onClose?.();
      navigate("/v1/signout", { replace: true });
    }
  };

  const handleSaveProfile = ({ username: nextUsername, email: nextEmail }) => {
    setProfileOverrides({
      username: String(nextUsername || "").trim(),
      email: String(nextEmail || "").trim(),
    });
  };

  if (activeView === "profile") {
    return (
      <ProfileViewV1
        onBack={() => setActiveView("home")}
        onEditProfile={() => setActiveView("editProfile")}
        user={{
          ...(user || {}),
          username: resolvedUsername,
        }}
        username={resolvedUsername}
        email={resolvedEmail}
        tier={tier}
        memberSince={user?.created_at || ""}
        trophyCount={trophyCount}
      />
    );
  }

  if (activeView === "editProfile") {
    return (
      <EditProfileView
        onBack={() => setActiveView("profile")}
        onSave={handleSaveProfile}
        username={resolvedUsername}
        email={resolvedEmail}
      />
    );
  }

  if (activeView === "inventory") {
    return (
      <InventoryViewV1
        onBack={() => setActiveView("home")}
        onOpenInventorySettings={() => setActiveView("editInventory")}
        items={inventoryItems}
        inventorySettings={inventorySettings}
      />
    );
  }

  if (activeView === "editInventory") {
    return (
      <EditInventoryView
        onBack={() => setActiveView("inventory")}
        onSave={setInventorySettings}
        showOwnedOnly={inventorySettings.showOwnedOnly}
        showLockedItems={inventorySettings.showLockedItems}
        groupByCategory={inventorySettings.groupByCategory}
      />
    );
  }

  if (activeView === "achievements") {
    return (
      <AchievementsViewV1
        onBack={() => setActiveView("home")}
        onOpenAchievementSettings={() => setActiveView("editAchievements")}
        user={{
          ...(user || {}),
          username: resolvedUsername,
        }}
        trophyCount={trophyCount}
        trophyBonusPercent={trophyBonusPercent}
        achievements={achievements}
        achievementSettings={achievementSettings}
      />
    );
  }

  if (activeView === "editAchievements") {
    return (
      <EditAchievementsView
        onBack={() => setActiveView("achievements")}
        onSave={setAchievementSettings}
        showLockedBadges={achievementSettings.showLockedBadges}
        showTrophyProgress={achievementSettings.showTrophyProgress}
        showBadgeHints={achievementSettings.showBadgeHints}
      />
    );
  }

  if (activeView === "settings") {
    return (
      <SettingsViewV1
        onBack={() => setActiveView("home")}
        onOpenAdvancedSettings={() => setActiveView("editSettings")}
      />
    );
  }

  if (activeView === "editSettings") {
    return <EditSettingsView onBack={() => setActiveView("settings")} />;
  }

  if (activeView === "help") {
    return (
      <HelpViewV1
        onBack={() => setActiveView("home")}
        onOpenFAQ={onOpenFAQ}
        onOpenContact={onOpenContact}
        onOpenAbout={onOpenAbout}
        onOpenSupportChat={onOpenSupportChat}
      />
    );
  }

  if (activeView === "privacy") {
    return <PrivacyViewV1 onBack={() => setActiveView("home")} />;
  }

  if (activeView === "terms") {
    return <TermsViewV1 onBack={() => setActiveView("home")} />;
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[linear-gradient(180deg,rgba(3,9,16,0.99),rgba(4,8,15,1))] text-white">
      <AccountDrawerHeaderV1
        title="Account"
        onClose={onClose}
        onAdminTap={handleAdminTap}
        learnUnlocked={learnUnlocked}
        streamUnlocked={streamUnlocked}
        onLearnOpen={handleLearnOpen}
        onStreamOpen={handleStreamOpen}
        onEarnCashTap={handleDevelopersLockedOpen}
      />

      <div className="relative min-h-0 flex-1 overflow-hidden px-3 py-3">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-28 w-52 -translate-x-1/2 rounded-full bg-cyan-400/12 blur-3xl" />
          <div className="absolute bottom-16 right-0 h-28 w-28 rounded-full bg-violet-400/12 blur-2xl" />
        </div>

        <div className="relative z-10 flex h-full min-h-0 flex-col gap-2.5">
          <div className="grid shrink-0 grid-cols-[1.12fr_0.88fr] gap-2.5">
            <AccountProfileCardV1 username={resolvedUsername} tier={tier} />

            <AccountBalanceCardV1
              zptsBalance={zptsBalance}
              zwapBalance={zwapBalance}
              onAdminTap={handleAdminTap}
              compact
            />
          </div>

          <div className="flex shrink-0 flex-col gap-2">
            <AccountActionRowV1
              label="Profile"
              onClick={() => setActiveView("profile")}
            />

            <AccountActionRowV1
              label="Inventory"
              onClick={() => setActiveView("inventory")}
            />

            <AccountActionRowV1
              label="Achievements"
              onClick={() => setActiveView("achievements")}
            />

            <AccountActionRowV1
              label="Developers 🔒"
              onClick={handleDevelopersLockedOpen}
            />

            <AccountActionRowV1
              label="Settings"
              onClick={() => setActiveView("settings")}
            />

            {canLogout ? (
              <AccountActionRowV1
                label="Logout"
                danger
                onClick={handleLogout}
              />
            ) : null}
          </div>

          <div className="pb-4">
            <AccountShieldCardV1 onClick={handleAdminTap} />
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-cyan-200/10 bg-black/24 backdrop-blur-md">
        <AccountFooterLinksV1
          onHelp={() => setActiveView("help")}
          onPrivacy={() => setActiveView("privacy")}
          onTerms={() => setActiveView("terms")}
        />
      </div>

      {developersLockedOpen ? (
        <LockedDevelopersNotice
          onClose={() => setDevelopersLockedOpen(false)}
        />
      ) : null}
    </div>
  );
}