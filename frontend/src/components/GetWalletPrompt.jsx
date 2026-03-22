import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/App";
import { Button } from "@/components/ui/button";
import { Wallet, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function GetWalletPrompt({ open, onOpenChange }) {
  const navigate = useNavigate();
  const { setIsOnboardingModalOpen } = useApp();

  const handleGetWallet = () => {
    onOpenChange(false);

    setTimeout(() => {
      setIsOnboardingModalOpen(true);
    }, 120);
  };

  const handleContinueAsGuest = () => {
    onOpenChange(false);
    navigate("/dashboard");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md rounded-[1.75rem] bg-[#0f1029] border-cyan-500/30 shadow-[0_0_60px_rgba(0,0,0,0.4)]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white text-center font-black tracking-tight">
            Get Your Wallet
          </DialogTitle>

          <DialogDescription className="text-gray-400 text-center leading-relaxed">
            You can keep exploring now, or get set up so your rewards and progress stay with you.
          </DialogDescription>
        </DialogHeader>

        <motion.div
          className="py-5 text-center"
          initial={{ scale: 0.97, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <motion.div
            className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto mb-5 relative"
            animate={{
              boxShadow: [
                "0 0 18px rgba(0,245,255,0.16)",
                "0 0 36px rgba(0,245,255,0.34)",
                "0 0 18px rgba(0,245,255,0.16)",
              ],
            }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Wallet className="w-10 h-10 text-cyan-400" />
            <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-purple-500/20 border border-purple-400/30 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            </div>
          </motion.div>

          <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl p-4 space-y-4">
            <div className="space-y-2">
              <p className="text-white font-semibold">You can explore first:</p>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>✓ Browse the app</li>
                <li>✓ View items and prices</li>
                <li>✓ Try demo games</li>
              </ul>
            </div>

            <div className="h-px bg-white/10" />

            <div className="space-y-2">
              <p className="text-cyan-400 font-semibold">With a wallet, you can:</p>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>💰 Earn and save rewards</li>
                <li>🎮 Keep your progress</li>
                <li>🛒 Unlock purchases</li>
                <li>🔐 Claim when you’re ready</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <div className="space-y-3">
          <Button
            onClick={handleGetWallet}
            className="w-full h-12 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-base font-bold rounded-xl shadow-[0_0_22px_rgba(0,245,255,0.22)]"
          >
            <Wallet className="w-5 h-5 mr-2" />
            Get Wallet
          </Button>

          <Button
            onClick={handleContinueAsGuest}
            variant="ghost"
            className="w-full h-12 text-gray-400 hover:text-white"
          >
            Continue as Guest
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}