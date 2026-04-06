import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Copy } from "lucide-react";

export default function ReferralPage() {
  const navigate = useNavigate();

  const referralCode = "ZWAPXXXX"; // placeholder
  const referralEarnings = "0"; // placeholder
  const referralCount = "0"; // placeholder

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.08),_rgba(10,11,30,0.98)_38%,_rgba(10,11,30,1)_100%)] text-white">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
        <button
          onClick={() => navigate(-1)}
          className="rounded-full border border-white/10 p-2 hover:bg-white/[0.05]"
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

        {/* Referral Code */}
        <div className="rounded-[1.5rem] border border-cyan-400/20 bg-cyan-500/10 p-4">
          <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/80">
            Your Code
          </p>

          <div className="mt-2 flex items-center justify-between">
            <p className="text-lg font-semibold text-white">
              {referralCode}
            </p>

            <button className="flex items-center gap-1 rounded-full border border-cyan-400/30 px-3 py-1 text-xs text-cyan-300 hover:bg-cyan-500/20">
              <Copy className="h-4 w-4" />
              Copy
            </button>
          </div>
        </div>

        {/* Invite */}
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
          <p className="text-[11px] uppercase tracking-[0.22em] text-gray-500">
            Invite
          </p>

          <button className="mt-3 w-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 text-sm font-semibold text-black hover:opacity-90">
            Invite Friends
          </button>
        </div>

        {/* Stats */}
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
          <p className="text-[11px] uppercase tracking-[0.22em] text-gray-500">
            Referral Stats
          </p>

          <div className="mt-3 flex justify-between text-sm">
            <span className="text-gray-400">Total Referrals</span>
            <span className="font-semibold text-white">{referralCount}</span>
          </div>

          <div className="mt-2 flex justify-between text-sm">
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