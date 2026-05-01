import React from "react";
import {
  ChevronLeft,
  Copy,
  Crown,
  Lock,
  Pencil,
  Shield,
  Star,
  Trophy,
  User,
  Wallet,
} from "lucide-react";
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
        "inline-flex items-center rounded-full px-2.5 py-[3px]",
        "text-[11px] font-medium tracking-[-0.01em]",
        isPlus
          ? "bg-violet-400/10 text-violet-200/70"
          : "bg-cyan-400/10 text-cyan-200/70",
      ].join(" ")}
    >
      {isPlus ? "Zitizen" : "Zwapper"}
    </div>
  );
}

function StatCard({ icon, label, value, tone = "default" }) {
  let toneClass = "";
  let iconClass = "text-white/40";

  if (tone === "gold") {
    toneClass =
      "border-amber-300/24 bg-[radial-gradient(circle_at_20%_18%,rgba(251,191,36,0.15),transparent_42%),linear-gradient(180deg,rgba(50,38,16,0.78),rgba(18,15,10,0.96))] shadow-[0_10px_24px_rgba(0,0,0,0.2),0_0_14px_rgba(251,191,36,0.09)]";
    iconClass = "text-amber-100/60";
  } else if (tone === "cyan") {
    toneClass =
      "border-cyan-300/24 bg-[radial-gradient(circle_at_20%_18%,rgba(34,211,238,0.15),transparent_42%),linear-gradient(180deg,rgba(14,45,56,0.78),rgba(8,16,22,0.96))] shadow-[0_10px_24px_rgba(0,0,0,0.2),0_0_14px_rgba(34,211,238,0.09)]";
    iconClass = "text-cyan-100/70";
  } else if (tone === "blue") {
    toneClass =
      "border-blue-300/22 bg-[radial-gradient(circle_at_20%_18%,rgba(96,165,250,0.14),transparent_42%),linear-gradient(180deg,rgba(18,34,58,0.82),rgba(8,14,26,0.96))] shadow-[0_10px_24px_rgba(0,0,0,0.2),0_0_12px_rgba(96,165,250,0.08)]";
    iconClass = "text-blue-100/65";
  } else {
    toneClass =
      "border-cyan-200/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.02))] shadow-[0_10px_24px_rgba(0,0,0,0.18)]";
  }

  return (
    <div
      className={[
        "min-h-[84px] rounded-[20px] border px-3.5 py-3",
        toneClass,
      ].join(" ")}
    >
      <div className={["flex items-center gap-2", iconClass].join(" ")}>
        {icon}
        <div className="text-[9px] font-black uppercase tracking-[0.16em]">
          {label}
        </div>
      </div>

      <div className="mt-2 break-words text-[15px] font-semibold tracking-[-0.03em] text-white/92">
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
  const resolvedUsername =
    generateUsername({
      username: user?.username,
      email,
    }) || username;

  const initials = buildInitials(resolvedUsername);
  const memberSinceLabel = formatMemberSince(memberSince);
  const tierLabel = tier === "zitizen" ? "Zitizen" : "Zwapper";
  const avatarUrl = user?.avatarUrl || user?.avatar_url || user?.photoURL || "";
  const isPlus = String(tier || "").toLowerCase() === "zitizen";

  return (
    <div className="flex h-full min-h-0 flex-col bg-[linear-gradient(180deg,rgba(6,12,18,0.98),rgba(4,8,14,1))] text-white">
      <div className="flex h-[56px] shrink-0 items-center justify-between border-b border-cyan-200/10 px-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold tracking-[-0.02em] text-white/78"
        >
          <ChevronLeft size={16} strokeWidth={2.4} />
          Back
        </button>

        <div className="text-[15px] font-semibold tracking-[-0.02em] text-white/92">
          Profile
        </div>

        <button
          type="button"
          onClick={onEditProfile}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-400/10 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.14)] transition active:scale-[0.97]"
        >
          <Pencil size={16} strokeWidth={2.2} />
        </button>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden px-3 py-3">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-28 w-52 -translate-x-1/2 rounded-full bg-violet-400/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-24 w-24 rounded-full bg-cyan-400/10 blur-2xl" />
        </div>

        <div className="relative z-10 flex h-full min-h-0 flex-col gap-2.5">
          <div className="relative overflow-hidden rounded-[28px] border border-violet-300/18 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.22),transparent_44%),radial-gradient(circle_at_85%_20%,rgba(34,211,238,0.08),transparent_36%),linear-gradient(180deg,rgba(20,12,36,0.96),rgba(6,6,16,0.98))] px-4 py-5 shadow-[0_16px_42px_rgba(0,0,0,0.38)]">
            <div className="relative flex flex-col items-center text-center">
              <div className="flex h-[74px] w-[74px] items-center justify-center overflow-hidden rounded-full border border-violet-300/30 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.32),rgba(10,10,22,0.96))] text-[24px] font-semibold text-white">
                {avatarUrl ? (
                  <img src={avatarUrl} className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </div>

              <div className="mt-3 flex items-center gap-2">
                <div className="text-[22px] font-semibold text-white">
                  {resolvedUsername}
                </div>

                {isPlus ? (
                  <Crown size={15} className="text-violet-300/80" />
                ) : (
                  <Star size={14} className="text-cyan-200/70" />
                )}
              </div>

              <div className="mt-3">
                <TierPill tier={tier} />
              </div>

              {email && (
                <div className="mt-3 text-[11px] text-white/45">{email}</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <StatCard
              icon={<Shield size={14} />}
              label="Tier"
              value={tierLabel}
              tone="cyan"
            />

            <StatCard
              icon={<Trophy size={14} />}
              label="Trophies"
              value={String(trophyCount)}
              tone="gold"
            />

            <StatCard
              icon={<User size={14} />}
              label="Since"
              value={memberSinceLabel}
              tone="blue"
            />
          </div>

          <div className="rounded-[22px] border border-white/10 bg-black/20 p-3">
            <div className="flex items-center gap-2 text-white/42">
              <Wallet size={15} />
              <div className="text-[10px] font-black uppercase tracking-[0.16em]">
                Wallet
              </div>
            </div>

            {walletAddress ? (
              <div className="flex justify-between mt-2">
                <span>{shortenAddress(walletAddress)}</span>
                <button onClick={onCopyWallet}>
                  <Copy size={14} />
                </button>
              </div>
            ) : (
              <div className="mt-2 text-white/50 text-sm">
                🔒 Wallet locked — unlocks later
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}