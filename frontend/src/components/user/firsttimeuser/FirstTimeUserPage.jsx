import React from "react";
import { motion } from "framer-motion";
import { Wallet, KeyRound, Shield } from "lucide-react";
import { toast } from "sonner";
import { usePrivy } from "@privy-io/react-auth";
import { useApp } from "@/app/AppProvider";

import FirstTimeHero from "@/components/user/firsttimeuser/FirstTimeHero";
import StartOptionsCard from "@/components/user/firsttimeuser/StartOptionsCard";
import LearnMoreCard from "@/components/user/firsttimeuser/LearnMoreCard";
import TermTrigger from "@/components/ui/TermTrigger";

export default function FirstTimeUserPage() {
  const { authenticated: privyAuthenticated } = usePrivy();

  const {
    authUser,
    walletAddress,
    setIsWalletModalOpen,
    setIsReturningUserPromptOpen,
    setIsEmailAuthModalOpen,
  } = useApp();

  const hasEmailReturningSignals =
    !!authUser?.email ||
    !!localStorage.getItem("zwap_email") ||
    !!localStorage.getItem("zwap_auth_user");

  const hasWalletReturningSignals =
    !!walletAddress ||
    !!localStorage.getItem("zwap_wallet") ||
    !!privyAuthenticated;

  const openReturningUserFlow = () => {
    setIsWalletModalOpen(false);
    setIsEmailAuthModalOpen(false);
    setIsReturningUserPromptOpen(true);
    toast("Looks like you may already have an account. Sign in to continue.");
  };

  const openWalletFlow = () => {
    setIsReturningUserPromptOpen(false);
    setIsEmailAuthModalOpen(false);
    setIsWalletModalOpen(true);
  };

  const openEmailSignupFlow = () => {
    setIsWalletModalOpen(false);
    setIsReturningUserPromptOpen(false);
    setIsEmailAuthModalOpen(true);
  };

  const handleGetWallet = () => {
    if (hasWalletReturningSignals) {
      openWalletFlow();
      return;
    }

    if (hasEmailReturningSignals) {
      openWalletFlow();
      return;
    }

    openWalletFlow();
  };

  const handleContinueEmail = () => {
    if (hasEmailReturningSignals) {
      openReturningUserFlow();
      return;
    }

    if (hasWalletReturningSignals) {
      openWalletFlow();
      return;
    }

    openEmailSignupFlow();
  };

  return (
    <div className="min-h-screen bg-[#04040d] text-white overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-24 left-[12%] w-[420px] h-[420px] bg-cyan-500/12 rounded-full blur-[150px]"
          animate={{ scale: [1, 1.08, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-[34rem] right-[10%] w-[360px] h-[360px] bg-purple-500/12 rounded-full blur-[140px]"
          animate={{ scale: [1.05, 1, 1.05], opacity: [0.08, 0.18, 0.08] }}
          transition={{ duration: 6.8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-24 left-[30%] w-[320px] h-[320px] bg-blue-500/10 rounded-full blur-[130px]"
          animate={{ scale: [1, 1.12, 1], opacity: [0.08, 0.15, 0.08] }}
          transition={{ duration: 7.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_35%)]" />
      </div>

      <div className="relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-5 py-8 sm:py-12">
        <FirstTimeHero />

        <div className="space-y-6">
          <StartOptionsCard
            onContinueEmail={handleContinueEmail}
            onGetWallet={handleGetWallet}
          />

          <motion.div
            className="rounded-[1.9rem] border border-cyan-500/20 bg-white/[0.05] backdrop-blur-xl overflow-hidden shadow-[0_0_35px_rgba(0,245,255,0.08)]"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.45, ease: "easeOut" }}
          >
            <div className="px-5 py-5 sm:px-6 sm:py-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/20 flex items-center justify-center shrink-0">
                  <Wallet className="w-5 h-5 text-cyan-300" />
                </div>

                <div>
                  <h2 className="text-lg sm:text-xl font-black text-white">
                    Wallet Basics for{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                      ZWAP!
                    </span>
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-400">
                    Just enough context to move with confidence
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/8 px-4 py-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className="w-4 h-4 text-blue-300" />
                    <h3 className="text-white font-bold text-sm sm:text-base">
                      What is a Crypto Wallet?
                    </h3>
                  </div>

                  <p className="text-gray-300 text-sm sm:text-[15px] leading-relaxed">
                    A crypto <TermTrigger term="wallet">wallet</TermTrigger> does
                    not store money the way a physical wallet does. It stores
                    keys that allow you to access your crypto.
                  </p>

                  <div className="mt-3 rounded-xl border border-blue-400/20 bg-blue-500/10 px-4 py-3">
                    <p className="text-blue-200 text-sm italic leading-relaxed">
                      Your wallet is like the key to a safety deposit box. The
                      money is not in the key. The key just unlocks access.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.07] px-4 py-4">
                    <div className="flex items-center gap-2 mb-3">
                      <KeyRound className="w-4 h-4 text-cyan-300" />
                      <h3 className="text-white font-bold text-sm sm:text-base">
                        Why You Need One
                      </h3>
                    </div>

                    <ul className="space-y-2.5 text-gray-300 text-sm leading-relaxed">
                      <li>
                        • It gives you a portable identity inside{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 font-semibold">
                          ZWAP!
                        </span>
                      </li>
                      <li>
                        • It lets you claim{" "}
                        <TermTrigger term="zwap">ZWAP</TermTrigger> directly
                      </li>
                      <li>
                        • Your rewards can follow you across sessions and devices
                      </li>
                      <li>
                        • You can explore first, then connect when ready
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-green-500/20 bg-green-500/[0.07] px-4 py-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-4 h-4 text-green-300" />
                      <h3 className="text-white font-bold text-sm sm:text-base">
                        Your Keys Stay Yours
                      </h3>
                    </div>

                    <p className="text-gray-300 text-sm sm:text-[15px] leading-relaxed">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 font-semibold">
                        ZWAP!
                      </span>{" "}
                      does not store, see, or ask for your private key. When you
                      connect a <TermTrigger term="wallet">wallet</TermTrigger>,
                      your keys stay with you. That means you stay in control.
                    </p>

                    <div className="mt-3 rounded-xl border border-green-400/15 bg-black/20 px-3 py-2">
                      <p className="text-xs text-green-200/90">
                        Control stays with you, not the app.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <LearnMoreCard delay={0.22} />
        </div>
      </div>
    </div>
  );
}