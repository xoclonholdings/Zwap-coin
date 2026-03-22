import React from "react";
import { useApp } from "@/App";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, Wallet, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function OnboardingModal({ open, onOpenChange }) {
  const { setIsWalletModalOpen } = useApp();

  const closeAndOpenWalletModal = () => {
    onOpenChange(false);
    setTimeout(() => {
      setIsWalletModalOpen(true);
    }, 100);
  };

  const handleEmailStart = () => {
    onOpenChange(false);

    // placeholder for your email capture flow
    toast.message("Email flow coming next");
  };

  const handleGuest = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md rounded-[1.75rem] bg-[#0f1029] border-cyan-500/30 shadow-[0_0_60px_rgba(0,0,0,0.4)]">
        
        <DialogHeader>
          <DialogTitle className="text-2xl text-white text-center font-black tracking-tight">
            Start Your Journey
          </DialogTitle>

          <DialogDescription className="text-gray-400 text-center leading-relaxed">
            You can explore freely. Save your progress when you're ready.
          </DialogDescription>
        </DialogHeader>

        {/* Subtle trust copy */}
        <div className="text-center text-xs text-gray-500 px-2">
          No wallet required to start. No spam. No pressure.
        </div>

        <div className="space-y-3 mt-4">

          {/* EMAIL FIRST */}
          <Button
            onClick={handleEmailStart}
            className="w-full h-14 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-base font-semibold justify-between rounded-xl shadow-[0_0_25px_rgba(0,245,255,0.25)]"
          >
            <span className="flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Continue with Email
            </span>
            <Sparkles className="w-5 h-5" />
          </Button>

          {/* WALLET PATH */}
          <Button
            onClick={closeAndOpenWalletModal}
            variant="outline"
            className="w-full h-14 text-base font-semibold justify-between rounded-xl border-cyan-500/30 text-gray-200"
          >
            <span className="flex items-center">
              <Wallet className="w-5 h-5 mr-2" />
              Get Wallet
            </span>
          </Button>

          {/* GUEST */}
          <Button
            onClick={handleGuest}
            variant="ghost"
            className="w-full h-12 text-gray-400 hover:text-white"
          >
            Continue as Guest
          </Button>
        </div>

        {/* Bottom reassurance */}
        <div className="text-center text-[11px] text-gray-600 mt-3 leading-relaxed">
          Earn rewards now. Connect or create a wallet later when you're ready to claim.
        </div>

      </DialogContent>
    </Dialog>
  );
}