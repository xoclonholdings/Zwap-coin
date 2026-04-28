import React from "react";
import { ChevronLeft, Copy, Pencil, Shield, Trophy, Wallet } from "lucide-react";
import { generateUsername } from "@/lib/utils/generateUsername";

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
  if (!value) return "Pending";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Pending";

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
        "text-[10px] font-black uppercase tracking-[0.18em]",
        isPlus
          ? "border-violet-300/30 bg-violet-400/10 text-violet-100"
          : "border-cyan-300/30 bg-cyan-400/10 text-cyan-100",
      ].join(" ")}
    >
      {isPlus ? "Zitizen" : "Zwapper"}
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="min-h-[84px] rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.065),rgba(255,255,255,0.025))] px-3.5 py-3 shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
      <div className="flex items-center gap-2 text-white/40">
        {icon}
        <div className="text-[9px] font-black uppercase tracking-[0.16em]">
          {label}
        </div>
      </div>

      <div className="mt-2 truncate text-[15px] font-black tracking-[-0.04em] text-white">
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
  username = "",
  email = "",
  walletAddress = "",
  tier = "zwapper",
  memberSince = "",
  trophyCount = 0,
}) {
  const resolvedUsername = generateUsername({
    username: user?.username,
    walletAddress,
    email,
  }) || username;

  const initials = buildInitials(resolvedUsername);
  const memberSinceLabel = formatMemberSince(memberSince);
  const tierLabel = tier === "zitizen" ? "Zitizen" : "Zwapper";

  return (
    <div className="flex h-full min-h-0 flex-col bg-[linear-gradient(180deg,rgba(6,12,18,0.98),rgba(4,8,14,1))] text-white">
      <div className="flex h-[56px] shrink-0 items-center justify-between border-b border-white/8 px-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-black tracking-[-0.03em] text-white/78"
        >
          <ChevronLeft size={16} strokeWidth={2.4} />
          Back
        </button>

        <div className="text-[15px] font-black tracking-[-0.04em] text-white/92">
          Profile
        </div>

        <button
          type="button"
          onClick={onEditProfile}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-400/10 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.14)]"
          aria-label="Edit profile"
        >
          <Pencil size={16} strokeWidth={2.2} />
        </button>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden px-3 py-3">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-28 w-52 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-24 w-24 rounded-full bg-violet-400/10 blur-2xl" />
        </div>

        <div className="relative z-10 flex h-full min-h-0 flex-col gap-2.5">
          <div className="relative overflow-hidden rounded-[28px] border border-cyan-300/15 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.18),transparent_44%),radial-gradient(circle_at_85%_20%,rgba(168,85,247,0.12),transparent_36%),linear-gradient(180deg,rgba(12,20,32,0.96),rgba(5,9,18,0.98))] px-4 py-5 shadow-[0_16px_42px_rgba(0,0,0,0.38)]">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.075),transparent_34%,rgba(34,211,238,0.055))]" />

            <div className="relative flex flex-col items-center text-center">
              <div className="flex h-[74px] w-[74px] items-center justify-center rounded-full border border-cyan-300/30 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.28),rgba(8,14,24,0.96))] text-[24px] font-black tracking-[-0.06em] text-white shadow-[0_0_30px_rgba(34,211,238,0.22)]">
                {initials}
              </div>

              <div className="mt-3 max-w-full truncate text-[22px] font-black tracking-[-0.06em] text-white">
                {resolvedUsername}
              </div>

              <div className="mt-3">
                <TierPill tier={tier} />
              </div>

              {email ? (
                <div className="mt-3 max-w-full truncate rounded-full border border-white/8 bg-black/20 px-3 py-1 text-[11px] font-medium tracking-[-0.02em] text-white/45">
                  {email}
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025))] p-3 shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
            <div className="mb-2 flex items-center gap-2 text-white/42">
              <Wallet size={15} strokeWidth={2.2} />
              <div className="text-[10px] font-black uppercase tracking-[0.16em]">
                Wallet
              </div>
            </div>

            <div className="flex h-[44px] items-center justify-between gap-3 rounded-[16px] border border-white/10 bg-black/20 px-3">
              <div className="truncate text-sm font-bold tracking-[-0.03em] text-white/72">
                {walletAddress ? shortenAddress(walletAddress) : "No wallet"}
              </div>

              {walletAddress ? (
                <button
                  type="button"
                  onClick={onCopyWallet}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/60"
                  aria-label="Copy wallet address"
                >
                  <Copy size={14} strokeWidth={2.2} />
                </button>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <StatCard
              icon={<Shield size={14} strokeWidth={2.2} />}
              label="Tier"
              value={tierLabel}
            />

            <StatCard
              icon={<Trophy size={14} strokeWidth={2.2} />}
              label="Trophies"
              value={String(trophyCount)}
            />

            <StatCard
              icon={<Shield size={14} strokeWidth={2.2} />}
              label="Since"
              value={memberSinceLabel}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
