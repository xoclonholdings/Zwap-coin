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
import { Wallet, Shield, ChevronRight } from "lucide-react";

export default function OnboardingModal({ open, onOpenChange }) {
  const { setIsWalletModalOpen } = useApp();

  const isMobile =
    typeof window !== "undefined" &&
    /iPhone|iPad|iPod|Android/i.test(window.navigator.userAgent);

  const closeAndOpenWalletModal = () => {
    onOpenChange(false);

    setTimeout(() => {
      setIsWalletModalOpen(true);
    }, 100);
  };

  const handleExistingWallet = () => {
    closeAndOpenWalletModal();
  };

  const handleMetaMask = () => {
    const currentUrl = encodeURIComponent(window.location.href);

    // Mobile: open the current app URL inside MetaMask mobile
    if (isMobile) {
      window.location.href = `https://metamask.app.link/dapp/${currentUrl}`;
      return;
    }

    // Desktop: send user to MetaMask install/download
    window.open("https://metamask.io/download/", "_blank", "noopener,noreferrer");
  };

  const handleCoinbase = () => {
    // Official Coinbase wallet/base entry point
    window.open(
      "https://www.coinbase.com/wallet/downloads",
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md rounded-[1.5rem] bg-[#0f1029] border-cyan-500/30 shadow-[0_0_50px_rgba(0,0,0,0.35)]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white text-center font-black tracking-tight">
            Get started in seconds
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-center leading-relaxed">
            Choose the simplest way to create or connect your wallet.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          <Button
            onClick={handleMetaMask}
            className="w-full h-14 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-base font-semibold justify-between rounded-xl"
          >
            <span className="flex items-center">
              <Wallet className="w-5 h-5 mr-2" />
              Continue with MetaMask
            </span>
            <ChevronRight className="w-5 h-5" />
          </Button>

          <Button
            onClick={handleCoinbase}
            className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-base font-semibold justify-between rounded-xl"
          >
            <span className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Continue with Coinbase
            </span>
            <ChevronRight className="w-5 h-5" />
          </Button>

          <Button
            onClick={handleExistingWallet}
            variant="ghost"
            className="w-full h-12 text-gray-300 hover:text-white"
          >
            I already have a wallet
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}