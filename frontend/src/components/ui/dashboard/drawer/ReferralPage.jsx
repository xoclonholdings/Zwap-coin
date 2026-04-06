import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Copy, Share2 } from "lucide-react";
import { useApp } from "@/app/AppProvider";

export default function ReferralPage() {
  const navigate = useNavigate();
  const { user, authUser, walletAddress } = useApp();

  const safeUser = user && typeof user === "object" ? user : null;
  const safeAuthUser =
    authUser && typeof authUser === "object" ? authUser : null;

  const referralCode =
    safeUser?.referral_code ||
    safeAuthUser?.referral_code ||
    "No Code Yet";

  const referralEarnings = Number(
    safeUser?.referral_earnings ??
      safeAuthUser?.referral_earnings ??
      0
  ).toLocaleString();

  const referralCount = Number(
    safeUser?.referral_count ??
      safeAuthUser?.referral_count ??
      safeUser?.successful_referrals ??
      safeAuthUser?.successful_referrals ??
      0
  ).toLocaleString();

  const inviteMessage = useMemo(() => {
    const base = "Join me on ZWAP!";
    const codePart =
      referralCode && referralCode !== "No Code Yet"
        ? ` Use my referral code: ${referralCode}`
        : "";
    const walletPart = walletAddress ? ` (${walletAddress})` : "";

    return `${base}${codePart}${walletPart}`;
  }, [referralCode, walletAddress]);

  const handleCopyCode = async () => {
    if (!referralCode || referralCode === "No Code Yet") return;

    try {
      await navigator.clipboard.writeText(referralCode);
    } catch (error) {
      console.error("Failed to copy referral code:", error);
    }
  };

  const handleInvite = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Join me on ZWAP",
          text: inviteMessage,
        });
        return;
      }

      await navigator.clipboard.writeText(inviteMessage);
    } catch (error) {
      console.error("Failed to share referral invite:", error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.08),_rgba(10,11,30,0.98)_38%,_rgba(10,11,30,1)_100%)] text-white">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-full border border-white/10 p-2 transition hover:bg-white/[0.05]"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-300/80">
            Referrals
          </p>
          <p className="text-sm text-gray-400">
            Invite others and earn from their activity.
          </p>
        </div>
      </div>

      <div className="space-y-5 px-4 py-5">
        <div className="rounded-[1.5rem] border border-cyan-400/20 bg-cyan-500/10 p-4 shadow-[0_0_18px_rgba(34,211,238,0.08)]">
          <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/80">
            Your Code
          </p>

          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="truncate text-lg font-semibold text-white">
              {referralCode}
            </p>

            <button
              type="button"
              onClick={handleCopyCode}
              disabled={referralCode === "No Code Yet"}
              className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                referralCode === "No Code Yet"
                  ? "cursor-not-allowed border border-white/10 bg-white/[0.03] text-gray-500"
                  : "border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/20"
              }`}
            >
              <Copy className="h-4 w-4" />
              Copy
            </button>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 shadow-[0_0_18px_rgba(255,255,255,0.02)]">
          <p className="text-[11px] uppercase tracking-[0.22em] text-gray-500">
            Invite
          </p>

          <p className="mt-2 text-sm text-gray-400">
            Share your referral code and earn bonus zPts when invited users earn rewards.
          </p>

          <button
            type="button"
            onClick={handleInvite}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 text-sm font-semibold text-black transition hover:opacity-90"
          >
            <Share2 className="h-4 w-4" />
            Invite Friends
          </button>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 shadow-[0_0_18px_rgba(255,255,255,0.02)]">
          <p className="text-[11px] uppercase tracking-[0.22em] text-gray-500">
            Referral Stats
          </p>

          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-gray-400">Total Referrals</span>
            <span className="font-semibold text-white">{referralCount}</span>
          </div>

          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-gray-400">Earnings</span>
            <span className="font-semibold text-purple-400">
              {referralEarnings} zPts
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}