import React from "react";
import { ChevronLeft, Copy, Pencil } from "lucide-react";

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

function formatMemberSince(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
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

function StatCard({ label, value }) {
  return (
    <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3">
      <div className="text-[10px] uppercase tracking-[0.16em] text-white/38">
        {label}
      </div>
      <div className="mt-1 text-base font-semibold tracking-[-0.03em] text-white">
        {value}
      </div>
    </div>
  );
}

export default function ProfileViewV1({
  onBack,
  onEditProfile,
  onCopyWallet,
  user,
  username,
  email = "",
  walletAddress = "",
  tier = "zwapper",
  memberSince = "",
  trophyCount = 0,
}) {
  // 🔒 No fallbacks to "Zwapper" as username
  const resolvedUsername = user?.username || username || "";

  const initials = buildInitials(resolvedUsername);
  const memberSinceLabel = formatMemberSince(memberSince);

  return (
    <div className="flex h-full min-h-0 flex-col bg-[linear-gradient(180deg,rgba(8,14,20,0.98),rgba(4,8,14,1))] text-white">
      
      {/* Header */}
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
          Profile
        </div>

        <button
          type="button"
          onClick={onEditProfile}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70"
          aria-label="Edit profile"
        >
          <Pencil size={16} strokeWidth={2} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          
          {/* Identity Card */}
          <div className="rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_42%),linear-gradient(180deg,rgba(14,24,34,0.96),rgba(8,14,20,0.98))] p-5 shadow-[0_14px_36px_rgba(0,0,0,0.32)]">
            <div className="flex flex-col items-center text-center">
              
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(34,211,238,0.18),rgba(14,24,34,0.9))] text-xl font-semibold text-white shadow-[0_0_24px_rgba(34,211,238,0.12)]">
                {initials}
              </div>

              <div className="mt-4 text-[20px] font-semibold tracking-[-0.04em] text-white">
                {resolvedUsername}
              </div>

              {email ? (
                <div className="mt-1 text-sm text-white/52">
                  {email}
                </div>
              ) : null}

              <div className="mt-4">
                <TierPill tier={tier} />
              </div>
            </div>
          </div>

          {/* Wallet */}
          <div className="rounded-[18px] border border-white/8 bg-white/[0.03] p-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/42">
              Wallet
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 rounded-[14px] border border-white/8 bg-black/20 px-3 py-3">
              <div className="truncate text-sm font-medium text-white/70">
                {walletAddress ? shortenAddress(walletAddress) : "No wallet"}
              </div>

              {walletAddress ? (
                <button
                  type="button"
                  onClick={onCopyWallet}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/60"
                >
                  <Copy size={14} strokeWidth={2} />
                </button>
              ) : null}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Member Since" value={memberSinceLabel} />
            <StatCard label="Trophies" value={String(trophyCount)} />
            <StatCard
              label="Tier"
              value={tier === "zitizen" ? "Zitizen" : "Zwapper"}
            />
          </div>

        </div>
      </div>
    </div>
  );
}