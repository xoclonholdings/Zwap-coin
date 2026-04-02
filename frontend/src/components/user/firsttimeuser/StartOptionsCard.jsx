// frontend/src/components/user/firsttimeuser/StartOptionsCard.jsx

import React from "react";
import { Mail, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StartOptionsCard({
  onContinueEmail,
  onGetWallet,
}) {
  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-black">
          Choose How You Want to Start
        </h2>
        <p className="text-gray-400 text-sm mt-2 max-w-md mx-auto">
          You can begin with email for instant access or connect a wallet for full ownership.
        </p>
      </div>

      {/* Options */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Email Option */}
        <div className="p-5 rounded-2xl border border-cyan-500/20 bg-white/[0.04] backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-3">
            <Mail className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-white">Continue with Email</h3>
          </div>

          <ul className="text-sm text-gray-300 space-y-2 mb-4">
            <li>• Start instantly</li>
            <li>• Explore the app</li>
            <li>• Earn zPts</li>
          </ul>

          <Button
            onClick={onContinueEmail}
            className="w-full bg-gradient-to-r from-cyan-400 to-blue-500"
          >
            Continue with Email
          </Button>
        </div>

        {/* Wallet Option */}
        <div className="p-5 rounded-2xl border border-purple-500/20 bg-white/[0.04] backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-3">
            <Wallet className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-white">Connect Wallet</h3>
          </div>

          <ul className="text-sm text-gray-300 space-y-2 mb-4">
            <li>• Claim your ZWAP</li>
            <li>• Swap and use rewards</li>
            <li>• Full ownership</li>
          </ul>

          <Button
            onClick={onGetWallet}
            className="w-full bg-gradient-to-r from-purple-400 to-pink-500"
          >
            Get Wallet
          </Button>
        </div>
      </div>

      {/* Important Note */}
      <p className="text-xs text-gray-500 text-center max-w-md mx-auto">
        You can start without a wallet. You’ll need one later to claim ZWAP and access full features.
      </p>
    </div>
  );
}
