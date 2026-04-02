// frontend/src/components/user/firsttimeuser/StartOptionsCard.jsx

import React from "react";
import { Mail, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import TermTrigger from "@/components/ui/TermTrigger";

export default function StartOptionsCard({
  onContinueEmail,
  onGetWallet,
}) {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-black">
          Start ZWAP Your Way
        </h2>

        <p className="text-gray-400 text-sm mt-2 max-w-md mx-auto">
          Use email for instant access, or connect a{" "}
          <TermTrigger term="wallet">wallet</TermTrigger> for full ownership.
        </p>
      </div>

      {/* Options */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Email Option */}
        <div className="p-5 rounded-2xl border border-cyan-500/30 bg-white/[0.05] backdrop-blur-xl hover:border-cyan-400/50 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <Mail className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-white text-lg">
              Continue with Email
            </h3>
          </div>

          <ul className="text-sm text-gray-300 space-y-2 mb-5">
            <li>• Start instantly</li>
            <li>• Explore the app</li>
            <li>
              • Earn <TermTrigger term="zpts">zPts</TermTrigger>
            </li>
            <li>• Connect wallet later</li>
          </ul>

          <Button
            onClick={onContinueEmail}
            className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 font-semibold"
          >
            Continue
          </Button>
        </div>

        {/* Wallet Option */}
        <div className="p-5 rounded-2xl border border-purple-500/30 bg-white/[0.05] backdrop-blur-xl hover:border-purple-400/50 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <Wallet className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-white text-lg">
              Connect{" "}
              <TermTrigger term="wallet">Wallet</TermTrigger>
            </h3>
          </div>

          <ul className="text-sm text-gray-300 space-y-2 mb-5">
            <li>
              • Claim your{" "}
              <TermTrigger term="zwap">ZWAP</TermTrigger>
            </li>
            <li>
              • <TermTrigger term="swap">Swap</TermTrigger> rewards
            </li>
            <li>
              • Full{" "}
              <TermTrigger term="ownership">ownership</TermTrigger>
            </li>
          </ul>

          <Button
            onClick={onGetWallet}
            className="w-full bg-gradient-to-r from-purple-400 to-pink-500 font-semibold"
          >
            Get Wallet
          </Button>
        </div>
      </div>

      {/* Learn More CTA */}
      <div className="text-center">
        <button
          onClick={() => (window.location.href = "/learn")}
          className="text-sm text-cyan-300 hover:text-cyan-200 underline underline-offset-4 decoration-dotted"
        >
          Learn how this works
        </button>
      </div>

      {/* Note */}
      <p className="text-xs text-gray-500 text-center max-w-md mx-auto leading-relaxed">
        You can start without a{" "}
        <TermTrigger term="wallet">wallet</TermTrigger>. You’ll need one later to claim{" "}
        <TermTrigger term="zwap">ZWAP</TermTrigger> and unlock full features.
      </p>
    </div>
  );
}