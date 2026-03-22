import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useApp, ZWAP_LOGO } from "@/App";
import {
  Wallet,
  Shield,
  KeyRound,
  BookOpen,
  ChevronRight,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { walletModule } from "@/data/education";

export default function WalletPage() {
  const navigate = useNavigate();
  const {
    walletAddress,
    setIsFirstTimeUserPromptOpen,
    setIsOnboardingModalOpen,
    setIsWalletModalOpen,
  } = useApp();

  if (walletAddress) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const handleGetWallet = () => {
    setIsWalletModalOpen(false);
    setIsOnboardingModalOpen(false);
    setIsFirstTimeUserPromptOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#04040d] text-white">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px]"
          animate={{ scale: [1, 1.08, 1], opacity: [0.12, 0.2, 0.12] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px]"
          animate={{ scale: [1.08, 1, 1.08], opacity: [0.12, 0.18, 0.12] }}
          transition={{ duration: 5.6, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 left-[-4rem] w-[320px] h-[320px] bg-purple-500/10 rounded-full blur-[120px]"
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.16, 0.1] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-5 py-10 sm:py-14">
        {/* Logo */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <img
            src={ZWAP_LOGO}
            alt="ZWAP!"
            className="h-20 sm:h-24 mx-auto mb-3 drop-shadow-[0_0_22px_rgba(0,245,255,0.35)]"
          />
        </motion.div>

        {/* Hero */}
        <motion.div
          className="text-center mb-10 rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_0_60px_rgba(0,0,0,0.35)] px-6 py-8 sm:px-10"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <h1 className="text-3xl sm:text-4xl font-black mb-4 leading-tight tracking-tight">
            <span className="text-white">Before You Begin,</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              You Need a Wallet
            </span>
          </h1>

          <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            A crypto wallet is your key to the ZWAP ecosystem. It helps save
            your progress, connect your rewards to you, and unlock the parts of
            the app where your value starts to move.
          </p>
        </motion.div>

        {/* What is a wallet */}
        <motion.div
          className="p-5 sm:p-6 rounded-[1.75rem] border border-blue-500/25 bg-white/[0.04] backdrop-blur-xl mb-5"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          data-testid="wallet-explanation"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/15 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              What Is a Crypto Wallet?
            </h2>
          </div>

          <p className="text-gray-300 text-sm sm:text-[15px] leading-relaxed mb-4">
            {walletModule.core}
          </p>

          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
            <p className="text-blue-300 text-sm italic leading-relaxed">
              "{walletModule.analogy}"
            </p>
          </div>
        </motion.div>

        {/* Why you need one */}
        <motion.div
          className="p-5 sm:p-6 rounded-[1.75rem] border border-cyan-500/25 bg-white/[0.04] backdrop-blur-xl mb-5"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          data-testid="wallet-why-required"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-cyan-400" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              Why You Need One
            </h2>
          </div>

          <ul className="space-y-3 text-gray-300 text-sm sm:text-[15px]">
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
              <span>
                Your wallet becomes your identity inside ZWAP. It ties your
                progress, earnings, and purchases to you.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
              <span>
                Rewards stay connected to your wallet address, so they can
                follow you across devices and sessions.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
              <span>
                When you are ready to swap, spend, or claim, your wallet is the
                bridge that makes those actions possible.
              </span>
            </li>
          </ul>
        </motion.div>

        {/* Privacy reassurance */}
        <motion.div
          className="p-5 sm:p-6 rounded-[1.75rem] border border-green-500/25 bg-white/[0.04] backdrop-blur-xl mb-5"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          data-testid="wallet-privacy"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-green-500/15 flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-400" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              Your Keys Stay Yours
            </h2>
          </div>

          <p className="text-gray-300 text-sm sm:text-[15px] leading-relaxed">
            ZWAP does not store, see, or ask for your private key. We only use
            your public wallet address to connect your progress and rewards. The
            wallet connection itself is handled by trusted third-party services,
            not by us holding your keys.
          </p>
        </motion.div>

        {/* Learn hint */}
        <motion.div
          className="p-5 sm:p-6 rounded-[1.75rem] border border-purple-500/25 bg-white/[0.04] backdrop-blur-xl mb-8"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          data-testid="wallet-learn-hint"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-purple-500/15 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              Want to Learn More?
            </h2>
          </div>

          <p className="text-gray-300 text-sm sm:text-[15px] leading-relaxed mb-4">
            If you want more context before continuing, you can go through the
            Learn modules first. That way you are not guessing your way into
            Web3. You are walking in with your eyes open.
          </p>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#0a0b1e] border border-gray-800">
            <div className="flex items-center gap-2 text-gray-500 text-xs flex-wrap">
              <span className="text-gray-600">Header:</span>
              <span className="text-cyan-400 font-bold text-sm">0.00</span>
              <span className="text-gray-600 text-[10px]">ZWAP</span>
              <span className="text-gray-700">|</span>
              <span className="text-purple-400 font-bold text-sm">0</span>
              <span className="text-gray-600 text-[10px]">zPts</span>
            </div>

            <motion.div
              className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-sm flex-shrink-0 relative"
              animate={{
                boxShadow: [
                  "0 0 8px rgba(0,245,255,0.25)",
                  "0 0 16px rgba(0,245,255,0.5)",
                  "0 0 8px rgba(0,245,255,0.25)",
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <User className="w-4 h-4 text-white" />
              <span className="absolute -top-1 -right-1 px-1 py-0.5 bg-purple-500 text-[8px] text-white rounded font-bold">
                TAP
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36 }}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/learn")}
              className="w-full sm:w-1/2 py-4 text-sm font-semibold"
              data-testid="wallet-learn-button"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Learn More
            </Button>

            <Button
              type="button"
              onClick={handleGetWallet}
              data-testid="wallet-connect-button"
              className="w-full sm:w-1/2 py-4 text-sm sm:text-base font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-purple-500 shadow-[0_0_25px_rgba(0,245,255,0.3)] hover:shadow-[0_0_50px_rgba(0,245,255,0.5)] transition-all"
            >
              <Wallet className="w-5 h-5 mr-2" />
              Get Wallet
            </Button>
          </div>

          <p className="text-gray-600 text-xs mt-3">
            You can also continue as a guest from the next step.
          </p>
        </motion.div>
      </div>
    </div>
  );
}