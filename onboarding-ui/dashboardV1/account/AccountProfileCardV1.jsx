import React from "react";

function shortenAddress(address = "") {
  const safe = String(address || "").trim();
  if (!safe) return "";
  if (safe.length <= 12) return safe;
  return `${safe.slice(0, 6)}...${safe.slice(-4)}`;
}

function buildInitials(name = "") {
  const safe = String(name || "").trim();
  if (!safe) return "";

  const parts = safe.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

function resolveUsername({ user, username }) {
  return user?.username || username || "";
}

function resolveSubtext({ subtext, authUser, user, walletAddress }) {
  if (subtext) return subtext;
  if (authUser?.email?.address) return authUser.email.address;
  if (user?.email) return user.email;
  if (walletAddress) return shortenAddress(walletAddress);
  return "";
}

function TierPill({ tier = "zwapper" }) {
  const isPlus = String(tier || "").toLowerCase() === "zitizen";

  return (
    <div
      className={[
        "inline-flex items-center rounded-full border px-3 py-1",
        "text-[10px] font-semibold uppercase tracking-[0.18em]",
        isPlus
          ? "border-violet-400/25 bg-violet-400/10 text-violet-200"
          : "border-cyan-400/20 bg-cyan-400/10 text-cyan-200",
      ].join(" ")}
    >
      {isPlus ? "Zitizen" : "Zwapper"}
    </div>
  );
}

export default function AccountProfileCardV1({
  user,
  authUser,
  username,
  subtext,
  initials,
  tier = "zwapper",
  walletAddress = "",
}) {
  const resolvedUsername = resolveUsername({
    user,
    username,
  });

  const resolvedSubtext = resolveSubtext({
    subtext,
    authUser,
    user,
    walletAddress,
  });

  const resolvedInitials = initials || buildInitials(resolvedUsername);

  return (
    <div className="rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_42%),linear-gradient(180deg,rgba(14,24,34,0.96),rgba(8,14,20,0.98))] p-4 shadow-[0_14px_36px_rgba(0,0,0,0.32)]">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(34,211,238,0.18),rgba(14,24,34,0.9))] text-base font-semibold text-white shadow-[0_0_18px_rgba(34,211,238,0.10)]">
          {resolvedInitials}
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate text-[16px] font-semibold tracking-[-0.03em] text-white">
            {resolvedUsername}
          </div>

          {resolvedSubtext ? (
            <div className="mt-1 truncate text-sm text-white/56">
              {resolvedSubtext}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <TierPill tier={tier} />

        {walletAddress ? (
          <div className="truncate text-[11px] font-medium tracking-[0.04em] text-white/40">
            {shortenAddress(walletAddress)}
          </div>
        ) : (
          <div className="h-2 w-2 rounded-full bg-cyan-300/40" />
        )}
      </div>
    </div>
  );
}