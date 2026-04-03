import React from "react";
import { motion } from "framer-motion";
import { useApp } from "@/App";

import FirstTimeHero from "@/components/user/firsttimeuser/FirstTimeHero";
import StartOptionsCard from "@/components/user/firsttimeuser/StartOptionsCard";
import LearnMoreCard from "@/components/user/firsttimeuser/LearnMoreCard";

export default function FirstTimeUserPage() {
  const {
    setIsWalletModalOpen,
    setIsReturningUserPromptOpen,
    setIsEmailAuthModalOpen,
  } = useApp();

  const handleGetWallet = () => {
    setIsReturningUserPromptOpen(false);
    setIsEmailAuthModalOpen(false);
    setIsWalletModalOpen(true);
  };

  const handleContinueEmail = () => {
    setIsWalletModalOpen(false);
    setIsReturningUserPromptOpen(false);
    setIsEmailAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#04040d] text-white overflow-x-hidden">
      {/* Background glow */}
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

      {/* Content */}
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
              <h2 className="text-lg sm:text-xl font-black text-white mb-2">
                Wallet Basics for{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                  ZWAP!
                </span>
              </h2>
              <p className="text-sm text-gray-400">
                Just enough context to move with confidence
              </p>
            </div>
          </motion.div>

          <LearnMoreCard delay={0.22} />
        </div>
      </div>
    </div>
  );
}