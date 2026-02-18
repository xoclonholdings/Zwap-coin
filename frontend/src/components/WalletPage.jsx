import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useApp, ZWAP_LOGO } from "@/App";
import { Wallet, Shield, KeyRound, BookOpen, ChevronRight, ArrowRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { walletModule } from "@/data/education";

export default function WalletPage() {
  const navigate = useNavigate();
  const { setIsWalletModalOpen, walletAddress } = useApp();

  // If wallet is already connected, redirect to dashboard
  if (walletAddress) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const handleConnect = () => {
    setIsWalletModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#050510] text-white">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-5 py-12">
        {/* Logo */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <img src={ZWAP_LOGO} alt="ZWAP!" className="h-20 mx-auto mb-2 drop-shadow-[0_0_20px_rgba(0,245,255,0.4)]" />
        </motion.div>

        {/* Title */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">
            <span className="text-white">Before You Begin,</span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">You Need a Wallet</span>
          </h1>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            A crypto wallet is your key to the ZWAP! ecosystem. Here is what you need to know.
          </p>
        </motion.div>

        {/* What Is a Wallet - from education spine */}
        <motion.div
          className="p-5 rounded-2xl border border-blue-500/30 bg-blue-500/5 mb-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          data-testid="wallet-explanation"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-lg font-bold text-white">What Is a Crypto Wallet?</h2>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed mb-3">{walletModule.core}</p>
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <p className="text-blue-300 text-sm italic">"{walletModule.analogy}"</p>
          </div>
        </motion.div>

        {/* Why It's Required */}
        <motion.div
          className="p-5 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 mb-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          data-testid="wallet-why-required"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-cyan-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Why You Need One</h2>
          </div>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" /> Your wallet is your identity in ZWAP! — it tracks your earnings, purchases, and progress.</li>
            <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" /> Rewards are linked to your wallet address, so they follow you across devices.</li>
            <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" /> When you are ready to swap or claim, your wallet makes it possible.</li>
          </ul>
        </motion.div>

        {/* Privacy Assurance */}
        <motion.div
          className="p-5 rounded-2xl border border-green-500/30 bg-green-500/5 mb-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          data-testid="wallet-privacy"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Your Keys Stay Yours</h2>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            ZWAP! never stores, sees, or requests your private key. We only read your public wallet address to display balances and track rewards. Your wallet connection is handled by trusted third-party services — we never touch the keys.
          </p>
        </motion.div>

        {/* User Badge / Learn Hint */}
        <motion.div
          className="p-5 rounded-2xl border border-purple-500/30 bg-purple-500/5 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          data-testid="wallet-learn-hint"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Want to Learn More?</h2>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed mb-4">
            Once inside the app, tap your <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/30 to-purple-500/30 text-white text-xs font-semibold mx-0.5"><User className="w-3 h-3" /> Profile Badge</span> in the top-right corner. 
            Inside, you will find the <span className="text-purple-400 font-semibold">Learn</span> section alongside your Profile, FAQs, Settings, and more. You can always return there to refresh your knowledge.
          </p>
          {/* Visual hint */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0a0b1e] border border-gray-800">
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <span className="text-gray-600">Header:</span>
              <span className="text-cyan-400 font-bold text-sm">0.00</span>
              <span className="text-gray-600 text-[10px]">ZWAP</span>
              <span className="text-gray-700">|</span>
              <span className="text-purple-400 font-bold text-sm">0</span>
              <span className="text-gray-600 text-[10px]">zPts</span>
            </div>
            <motion.div
              className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-sm flex-shrink-0 relative"
              animate={{ boxShadow: ["0 0 8px rgba(0,245,255,0.3)", "0 0 16px rgba(0,245,255,0.6)", "0 0 8px rgba(0,245,255,0.3)"] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <User className="w-4 h-4 text-white" />
              <span className="absolute -top-1 -right-1 px-1 py-0.5 bg-purple-500 text-[8px] text-white rounded font-bold">TAP</span>
            </motion.div>
          </div>
          <button
            onClick={() => navigate("/learn")}
            className="mt-3 text-purple-400 text-sm font-medium flex items-center gap-1 hover:text-purple-300 transition-colors"
            data-testid="wallet-learn-link"
          >
            <BookOpen className="w-4 h-4" /> Preview the Learn section <ArrowRight className="w-3 h-3" />
          </button>
        </motion.div>

        {/* Connect CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Button
            onClick={handleConnect}
            data-testid="wallet-connect-button"
            className="w-full py-6 text-lg font-bold bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 rounded-2xl shadow-[0_0_30px_rgba(0,245,255,0.3)] hover:shadow-[0_0_50px_rgba(0,245,255,0.5)] transition-all"
          >
            <Wallet className="w-5 h-5 mr-2" /> Connect Your Wallet
          </Button>
          <p className="text-gray-600 text-xs mt-3">WalletConnect supported. No private keys required.</p>
        </motion.div>
      </div>
    </div>
  );
}
