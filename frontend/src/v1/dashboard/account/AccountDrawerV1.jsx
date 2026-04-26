import React, { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";

import AccountPanelContentV1 from "./AccountPanelContentV1";

function buildInitials(name = "") {
  const safe = String(name || "").trim();
  if (!safe) return "U";

  const parts = safe.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

function buildUsername({ user, authUser, username }) {
  return (
    username ||
    user?.username ||
    user?.displayName ||
    user?.display_name ||
    user?.name ||
    authUser?.username ||
    authUser?.displayName ||
    authUser?.display_name ||
    authUser?.email?.address?.split("@")[0] ||
    authUser?.email?.split("@")[0] ||
    ""
  );
}

export default function AccountDrawerV1({
  open = false,
  onOpenChange,
  onClose,

  user,
  authUser,
  username,
  subtext,
  initials,
  tier = "Starter",
  zptsBalance = 0,
  zwapBalance = 0,
  walletAddress = "",

  inventoryItems = [],
  achievements = [],
  trophyCount = 0,
  trophyBonusPercent = 0,

  learnUnlocked = false,
  streamUnlocked = false,

  onAdminTrigger,
  onLearnOpen,
  onStreamOpen,

  onOpenFAQ,
  onOpenContact,
  onOpenAbout,
  onOpenSupportChat,
}) {
  const resolvedUsername = useMemo(() => {
    return buildUsername({ user, authUser, username });
  }, [user, authUser, username]);

  const resolvedInitials = useMemo(() => {
    return initials || buildInitials(resolvedUsername);
  }, [initials, resolvedUsername]);

  const handleClose = () => {
    if (typeof onOpenChange === "function") {
      onOpenChange(false);
      return;
    }

    if (typeof onClose === "function") {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close account drawer"
            onClick={handleClose}
            className="fixed inset-0 z-[80] bg-black/65 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          />

          <motion.aside
            className="fixed right-0 top-0 z-[90] h-screen w-[calc(100vw-18px)] max-w-[410px] overflow-hidden border-l border-white/10 bg-[linear-gradient(180deg,rgba(8,10,22,0.98)_0%,rgba(10,12,28,0.985)_28%,rgba(7,9,20,1)_100%)] text-white shadow-[-24px_0_60px_rgba(0,0,0,0.45)] backdrop-blur-xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              duration: 0.26,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className="relative flex h-full flex-col overflow-hidden">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_70%)]" />
                <div className="absolute right-0 top-24 h-40 w-40 rounded-full bg-cyan-400/5 blur-3xl" />
                <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-fuchsia-500/5 blur-3xl" />
              </div>

              <div className="relative z-10 flex h-full flex-col">
                <AccountPanelContentV1
                  onClose={handleClose}
                  onAdminTrigger={onAdminTrigger}
                  onLearnOpen={onLearnOpen}
                  onStreamOpen={onStreamOpen}
                  onOpenFAQ={onOpenFAQ}
                  onOpenContact={onOpenContact}
                  onOpenAbout={onOpenAbout}
                  onOpenSupportChat={onOpenSupportChat}
                  learnUnlocked={learnUnlocked}
                  streamUnlocked={streamUnlocked}
                  user={user}
                  authUser={authUser}
                  username={resolvedUsername}
                  subtext={subtext}
                  initials={resolvedInitials}
                  tier={tier}
                  zptsBalance={zptsBalance}
                  zwapBalance={zwapBalance}
                  walletAddress={walletAddress}
                  inventoryItems={inventoryItems}
                  achievements={achievements}
                  trophyCount={trophyCount}
                  trophyBonusPercent={trophyBonusPercent}
                />
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}