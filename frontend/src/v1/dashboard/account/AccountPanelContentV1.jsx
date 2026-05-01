import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useApp } from "@/app/AppProvider";
import { generateUsername } from "@/lib/utils/generateUsername";
import { clearV1OnboardingSeen } from "@/v1/V1OnboardingStorage";

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
  const [isReviewAccess] = useState(() => getReviewAccessEnabled());

  const adminTapCountRef = useRef(0);
  const adminTapResetRef = useRef(null);

  const canLogout = isAuthenticated || isReviewAccess;

  const resolvedEmail =
    authUser?.email?.address ||
    authUser?.email ||
    user?.email ||
    (isReviewAccess ? "review@zwap.app" : "");

  const resolvedUsername = generateUsername({
    username: user?.username || username,
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

  const handleResetOnboarding = () => {
    clearReviewAccess();
    clearV1OnboardingSeen();
    onClose?.();
    window.location.href = "/v1";
  };

  if (activeView === "profile") {
    return (
      <ProfileViewV1
        onBack={() => setActiveView("home")}
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

  if (activeView === "inventory") {
    return (
      <InventoryViewV1
        onBack={() => setActiveView("home")}
        items={inventoryItems}
      />
    );
  }

  if (activeView === "achievements") {
    return (
      <AchievementsViewV1
        onBack={() => setActiveView("home")}
        user={{
          ...(user || {}),
          username: resolvedUsername,
        }}
        trophyCount={trophyCount}
        trophyBonusPercent={trophyBonusPercent}
        achievements={achievements}
      />
    );
  }

  if (activeView === "settings") {
    return <SettingsViewV1 onBack={() => setActiveView("home")} />;
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
        onLearnOpen={onLearnOpen}
        onStreamOpen={onStreamOpen}
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

            <AccountActionRowV1
              label="Reset Onboarding"
              onClick={handleResetOnboarding}
            />
          </div>

          <AccountShieldCardV1 onClick={handleAdminTap} />
        </div>
      </div>

      <div className="shrink-0 border-t border-cyan-200/10 bg-black/24 backdrop-blur-md">
        <AccountFooterLinksV1
          onHelp={() => setActiveView("help")}
          onPrivacy={() => setActiveView("privacy")}
          onTerms={() => setActiveView("terms")}
        />
      </div>
    </div>
  );
}