import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, PlayCircle, X } from "lucide-react";

import { useApp } from "@/app/AppProvider";

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

function HeaderIconButton({ onClick, children, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="
        flex h-9 w-9 items-center justify-center rounded-full
        border border-white/10 bg-white/[0.04] text-white/70
        transition active:scale-[0.98]
      "
    >
      {children}
    </button>
  );
}

function AccountDrawerHeaderV1({
  title = "Account",
  onClose,
  onAdminTap,
  learnUnlocked = false,
  streamUnlocked = false,
  onLearnOpen,
  onStreamOpen,
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/8 px-4 py-4">
      <button
        type="button"
        onClick={onAdminTap}
        className="text-left text-sm font-semibold tracking-[-0.02em] text-white/88"
      >
        {title}
      </button>

      <div className="flex items-center gap-2">
        {learnUnlocked ? (
          <HeaderIconButton onClick={onLearnOpen} label="Open Learn">
            <BookOpen size={16} strokeWidth={2} />
          </HeaderIconButton>
        ) : null}

        {streamUnlocked ? (
          <HeaderIconButton onClick={onStreamOpen} label="Open Stream">
            <PlayCircle size={16} strokeWidth={2} />
          </HeaderIconButton>
        ) : null}

        <HeaderIconButton onClick={onClose} label="Close account drawer">
          <X size={16} strokeWidth={2} />
        </HeaderIconButton>
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
  subtext = "",
  initials = "",
  tier = "zwapper",
  zptsBalance = 0,
  zwapBalance = 0,
  walletAddress = "",

  inventoryItems = [],
  achievements = [],
  trophyCount = 0,
  trophyBonusPercent = 0,
}) {
  const navigate = useNavigate();
  const { isAuthenticated, logoutAll } = useApp();

  const [activeView, setActiveView] = useState("home");

  const adminTapCountRef = useRef(0);
  const adminTapResetRef = useRef(null);

  const resolvedUsername = user?.username || username || "";

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
      await logoutAll?.();
    } finally {
      onClose?.();
      navigate("/v1/signout", { replace: true });
    }
  };

  if (activeView === "profile") {
    return (
      <ProfileViewV1
        onBack={() => setActiveView("home")}
        user={user}
        username={resolvedUsername}
        email={authUser?.email?.address || authUser?.email || user?.email || ""}
        walletAddress={walletAddress}
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
      <AccountDrawerHeaderV1
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
            username={resolvedUsername}
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

            {isAuthenticated ? (
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