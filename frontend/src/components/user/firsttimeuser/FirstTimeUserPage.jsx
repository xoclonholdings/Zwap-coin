import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/App";

import FirstTimeHero from "@/components/user/firsttimeuser/FirstTimeHero";
import StartOptionsCard from "@/components/user/firsttimeuser/StartOptionsCard";
import WalletBasicsCard from "@/components/user/firsttimeuser/WalletBasicsCard";
import WalletWhyCard from "@/components/user/firsttimeuser/WalletWhyCard";
import WalletSafetyCard from "@/components/user/firsttimeuser/WalletSafetyCard";
import LearnMoreCard from "@/components/user/firsttimeuser/LearnMoreCard";

export default function FirstTimeUserPage() {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    setIsGetWalletPromptOpen,
    setIsOnboardingModalOpen,
    setIsWalletModalOpen,
    setIsReturningUserPromptOpen,
  } = useApp();

  if (isAuthenticated) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const handleGetWallet = () => {
    setIsWalletModalOpen(false);
    setIsOnboardingModalOpen(false);
    setIsReturningUserPromptOpen(false);
    setIsGetWalletPromptOpen(true);
  };

  const handleContinueEmail = () => {
    setIsWalletModalOpen(false);
    setIsGetWalletPromptOpen(false);
    setIsReturningUserPromptOpen(false);
    setIsOnboardingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#04040d] text-white">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/3 w-[480px] h-[480px] bg-cyan-500/10 rounded-full blur-[150px]"
          animate={{ scale: [1, 1.08, 1], opacity: [0.1, 0.18, 0.1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-[380px] h-[380px] bg-blue-500/10 rounded-full blur-[120px]"
          animate={{ scale: [1.08, 1, 1.08], opacity: [0.1, 0.16, 0.1] }}
          transition={{ duration: 6.6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-[-4rem] w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[120px]"
          animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.14, 0.08] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-5 py-8 sm:py-12">
        <FirstTimeHero />

        <div className="space-y-5">
          <StartOptionsCard
            onContinueEmail={handleContinueEmail}
            onGetWallet={handleGetWallet}
          />

          <WalletBasicsCard delay={0.12} />
          <WalletWhyCard delay={0.18} />
          <WalletSafetyCard delay={0.24} />
          <LearnMoreCard delay={0.3} />
        </div>
      </div>
    </div>
  );
}