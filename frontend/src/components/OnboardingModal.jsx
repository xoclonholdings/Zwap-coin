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

  const handleExistingWallet = () => {
    onOpenChange(false);
    setIsWalletModalOpen(true);
  };

  const handleMetaMaskEmbedded = () => {
    // placeholder for MetaMask Embedded flow
    console.log("MetaMask Embedded selected");
  };

  const handleCoinbase = () => {
    // placeholder for Coinbase flow
    console.log("Coinbase selected");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm bg-[#0f1029] border-cyan-500/30">
        <DialogHeader>
          <DialogTitle className="text-xl text-white text-center">
            Get started in seconds
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-center">
            Choose the simplest way to create or connect your wallet.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          <Button
            onClick={handleMetaMaskEmbedded}
            className="w-full h-14 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-base font-semibold justify-between"
          >
            <span className="flex items-center">
              <Wallet className="w-5 h-5 mr-2" />
              Continue with MetaMask
            </span>
            <ChevronRight className="w-5 h-5" />
          </Button>

          <Button
            onClick={handleCoinbase}
            className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-base font-semibold justify-between"
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