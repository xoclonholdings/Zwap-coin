import React, { useMemo, useRef } from "react";
import { usePrivy } from "@privy-io/react-auth";

function shortenAddress(address = "") {
  const safe = String(address || "").trim();
  if (!safe) return "";
  if (safe.length <= 12) return safe;
  return `${safe.slice(0, 6)}...${safe.slice(-4)}`;
}

function buildInitials(name = "") {
  const safe = String(name || "").trim();
  if (!safe) return "Z";

  const parts = safe.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

function resolveDisplayName({
  displayName,
  username,
  authUser,
  user,
  walletAddress,
}) {
  if (displayName) return displayName;
  if (username) return username;
  if (authUser?.email?.address) {
    return authUser.email.address.split("@")[0];
  }
  if (user?.email) {
    return String(user.email).split("@")[0];
  }
  if (walletAddress) {
    return `Zwapper ${walletAddress.slice(2, 6)}`;
  }
  return "Zwapper";
}

function resolveSubtext({ subtext, authUser, user, walletAddress }) {
  if (subtext) return subtext;
  if (authUser?.email?.address) return authUser.email.address;
  if (user?.email) return user.email;
  if (walletAddress) return shortenAddress(walletAddress);
  return "Account active";
}

function formatZpts(value) {
  return Number(value || 0).toLocaleString();
}

function formatZwap(value) {
  const num = Number(value || 0);
  if (!Number.isFinite(num)) return "0";
  if (num >= 1000) return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (num >= 1) return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

function TierPill({ tier = "zwapper" }) {
  const isPlus = String(tier || "").toLowerCase() === "zitizen";

  return (
    <div
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
        isPlus
          ? "border-violet-400/25 bg-violet-400/10 text-violet-200"
          : "border-cyan-400/20 bg-cyan-400/10 text-cyan-200"
      }`}
    >
      {isPlus ? "Zitizen" : "Zwapper"}
    </div>
  );
}

function ActionButton({ children, onClick, subtle = false, danger = false }) {
  let tone =
    "border-white/10 bg-white/[0.04] text-white/88 hover:bg-white/[0.07] active:scale-[0.99]";

  if (subtle) {
    tone = "border-white/8 bg-white/[0.03] text-white/72 hover:bg-white/[0.06] active:scale-[0.99]";
  }

  if (danger) {
    tone =
      "border-rose-400/18 bg-rose-400/[0.06] text-rose-200 hover:bg-rose-400/[0.10] active:scale-[0.99]";
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-center rounded-[18px] border px-4 py-3.5 text-sm font-medium transition ${tone}`}
    >
      {children}
    </button>
  );
}

function FooterLink({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs font-medium text-white/50 transition hover:text-white/78"
    >
      {children}
    </button>
  );
}

export default function AccountPanelContentV1({
  showHeader = false,
  onClose,
  onNavigate,
  onOpenUpgrade,
  onAdminTrigger,
  user,
  authUser,
  displayName,
  username,
  subtext,
  initials,
  tier = "zwapper",
  zptsBalance = 0,
  zwapBalance = 0,
  walletAddress,
  showUpgrade = false,
}) {
  const { authenticated, logout } = usePrivy();
  const adminTapCountRef = useRef(0);
  const adminTapResetRef = useRef(null);

  const resolvedDisplayName = useMemo(
    () =>
      resolveDisplayName({
        displayName,
        username,
        authUser,
        user,
        walletAddress,
      }),
    [displayName, username, authUser, user, walletAddress]
  );

  const resolvedSubtext = useMemo(
    () =>
      resolveSubtext({
        subtext,
        authUser,
        user,
        walletAddress,
      }),
    [subtext, authUser, user, walletAddress]
  );

  const resolvedInitials = useMemo(
    () => initials || buildInitials(resolvedDisplayName),
    [initials, resolvedDisplayName]
  );

  const safeNavigate = (target) => {
    if (typeof onNavigate === "function") {
      onNavigate(target);
    }
    if (typeof onClose === "function") {
      onClose();
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } finally {
      if (typeof onClose === "function") {
        onClose();
      }
    }
  };

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

  return (
    <div className="flex h-full min-h-0 flex-col bg-[linear-gradient(180deg,rgba(8,14,20,0.98),rgba(4,8,14,1))] text-white">
      {showHeader ? (
        <div className="flex items-center justify-between border-b border-white/8 px-4 py-4">
          <button
            type="button"
            onClick={handleAdminTap}
            className="text-left text-sm font-semibold tracking-[-0.02em] text-white/88"
          >
            Account
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/70"
          >
            Close
          </button>
        </div>
      ) : null}

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        <div className="rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_42%),linear-gradient(180deg,rgba(14,24,34,0.96),rgba(8,14,20,0.98))] p-4 shadow-[0_14px_36px_rgba(0,0,0,0.32)]">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(34,211,238,0.18),rgba(14,24,34,0.9))] text-base font-semibold text-white shadow-[0_0_18px_rgba(34,211,238,0.10)]">
              {resolvedInitials}
            </div>

            <div className="min-w-0 flex-1">
              <div className="truncate text-[1rem] font-semibold tracking-[-0.03em] text-white">
                {resolvedDisplayName}
              </div>
              <div className="mt-1 truncate text-sm text-white/56">
                {resolvedSubtext}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <TierPill tier={tier} />

            {showUpgrade ? (
              <button
                type="button"
                onClick={onOpenUpgrade}
                className="rounded-full border border-violet-400/18 bg-violet-400/[0.08] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-200"
              >
                Upgrade
              </button>
            ) : null}
          </div>
        </div>

        <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/42">
              Balance
            </div>

            <button
              type="button"
              onClick={handleAdminTap}
              className="h-2 w-2 rounded-full bg-transparent"
              aria-label="Hidden admin trigger"
            />
          </div>

          <div className="mt-2 flex items-end justify-between gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.16em] text-white/38">
                zPts
              </div>
              <div className="mt-1 text-[1.25rem] font-semibold tracking-[-0.04em] text-cyan-300">
                {formatZpts(zptsBalance)}
              </div>
            </div>

            {Number(zwapBalance || 0) > 0 ? (
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-[0.16em] text-white/30">
                  ZWAP
                </div>
                <div className="mt-1 text-sm font-medium tracking-[-0.02em] text-white/62">
                  {formatZwap(zwapBalance)}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-3">
          <ActionButton onClick={() => safeNavigate("profile")}>
            Profile
          </ActionButton>

          <ActionButton onClick={() => safeNavigate("contact")}>
            Contact
          </ActionButton>

          {showUpgrade ? (
            <ActionButton subtle onClick={onOpenUpgrade}>
              Upgrade
            </ActionButton>
          ) : null}
        </div>

        {authenticated ? (
          <div className="pt-1">
            <ActionButton danger onClick={handleSignOut}>
              Sign Out
            </ActionButton>
          </div>
        ) : null}
      </div>

      <div className="border-t border-white/8 px-4 py-4">
        <div className="flex items-center justify-center gap-5">
          <FooterLink onClick={() => safeNavigate("privacy")}>Privacy</FooterLink>
          <FooterLink onClick={() => safeNavigate("help")}>Help</FooterLink>
          <FooterLink onClick={() => safeNavigate("terms")}>Terms</FooterLink>
        </div>
      </div>
    </div>
  );
}