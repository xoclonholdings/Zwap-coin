import React, { useEffect, useRef, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";

import AccountHeaderV1 from "./AccountHeaderV1";
import AccountProfileCardV1 from "./AccountProfileCardV1";
import AccountBalanceCardV1 from "./AccountBalanceCardV1";
import AccountActionRowV1 from "./AccountActionRowV1";
import AccountShieldCardV1 from "./AccountShieldCardV1";
import AccountFooterLinksV1 from "./AccountFooterLinksV1";

import ProfileViewV1 from "./ProfileViewV1";
import InventoryViewV1 from "./InventoryViewV1";
import AchievementsViewV1 from "./AchievementsViewV1";
import SettingsViewV1 from "./SettingsViewV1";
import HelpViewV1 from "./HelpViewV1";
import PrivacyViewV1 from "./PrivacyViewV1";
import TermsViewV1 from "./TermsViewV1";

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
  displayName,
  username,
  subtext,
  initials,
  tier = "zwapper",
  zptsBalance = 0,
  zwapBalance = 0,
  walletAddress = "",

  inventoryItems = [],
  achievements = [],
  trophyCount = 0,
  trophyBonusPercent = 0,
}) {
  const { authenticated, logout } = usePrivy();
  const [activeView, setActiveView] = useState("home");

  const adminTapCountRef = useRef(0);
  const adminTapResetRef = useRef(null);

  useEffect(() => {
    return () => {
      if (adminTapResetRef.current) {
        clearTimeout(adminTapResetRef.current);
      }
    };
  }, []);

  const handleAdminTap = () => {
    adminTapCountRef.current += 1;

    if (adminTapResetRef.current) {
      clearTimeout(adminTapResetRef.current);
    }

    adminTapResetRef.current = setTimeout(() => {
      adminTapCountRef.current = 0;
      adminTapResetRef.current = null;
    }, 1200);

    if (adminTapCountRef.current >= 5) {
      adminTapCountRef.current = 0;

      if (adminTapResetRef.current) {
        clearTimeout(adminTapResetRef.current);
        adminTapResetRef.current = null;
      }

      if (typeof onAdminTrigger === "function") {
        onAdminTrigger();
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      if (typeof onClose === "function") {
        onClose();
      }
    }
  };

  if (activeView === "profile") {
    return (
      <ProfileViewV1
        onBack={() => setActiveView("home")}
        user={user}
        authUser={authUser}
        username={username}
        displayName={displayName}
        email={authUser?.email?.address || user?.email || ""}
        walletAddress={walletAddress}
        tier={tier}
        memberSince={user?.created_at || ""}
        trophyCount={trophyCount}
        primaryIdentity={user?.primary_badge_identity || "Starter"}
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
    <div className="flex h-full min-h-0 flex-col bg-[linear-gradient(180deg,rgba(8,14,20,0.98),rgba(4,8,14,1))] text-white">
      <AccountHeaderV1
        title="Account"
        onClose={onClose}
        onAdminTap={handleAdminTap}
        learnUnlocked={learnUnlocked}
        streamUnlocked={streamUnlocked}
        onLearnOpen={onLearnOpen}
        onStreamOpen={onStreamOpen}
      />

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          <AccountProfileCardV1
            user={user}
            authUser={authUser}
            displayName={displayName}
            username={username}
            subtext={subtext}
            initials={initials}
            tier={tier}
            walletAddress={walletAddress}
          />

          <AccountBalanceCardV1
            zptsBalance={zptsBalance}
            zwapBalance={zwapBalance}
            onAdminTap={handleAdminTap}
          />

          <div className="space-y-3">
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

            {authenticated ? (
              <AccountActionRowV1
                label="Logout"
                danger
                onClick={handleLogout}
              />
            ) : null}
          </div>

          <AccountShieldCardV1 onClick={handleAdminTap} />
        </div>
      </div>

      <AccountFooterLinksV1
        onHelp={() => setActiveView("help")}
        onPrivacy={() => setActiveView("privacy")}
        onTerms={() => setActiveView("terms")}
      />
    </div>
  );
}