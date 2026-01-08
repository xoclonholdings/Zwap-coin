import React from "react";
import { useApp } from "@/App";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, Target, ShoppingBag } from "lucide-react";

export default function WelcomeScreen() {
  const { setIsWalletModalOpen, setPendingAction } = useApp();

  const handleAction = (action) => {
    setPendingAction(action);
    setIsWalletModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0b1e] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-lg mx-auto">
        {/* Logo */}
        <div className="mb-8 float">
          <h1 
            className="text-6xl font-extrabold tracking-tight neon-text"
            data-testid="zwap-logo"
          >
            ZWAP!
          </h1>
          <p className="text-cyan-400/80 mt-2 text-lg">Coin</p>
        </div>

        {/* Welcome text */}
        <div className="mb-12">
          <h2 
            className="text-2xl font-semibold text-white mb-4"
            data-testid="welcome-heading"
          >
            Welcome to Zwap!
          </h2>
          <p className="text-gray-400 text-lg">
            Before we jump in... What would you like to do today?
          </p>
        </div>

        {/* Action buttons */}
        <div className="space-y-4">
          <Button
            data-testid="action-swap"
            onClick={() => handleAction("swap")}
            className="w-full h-20 glass-card hover:neon-border transition-all duration-300 flex items-center justify-start px-6 gap-4 group"
            variant="ghost"
          >
            <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">
              <ArrowRightLeft className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="text-left">
              <div className="text-white font-semibold text-lg flex items-center gap-2">
                Swap <span className="text-xl">💱</span>
              </div>
              <div className="text-gray-400 text-sm">Exchange tokens securely and easily</div>
            </div>
          </Button>

          <Button
            data-testid="action-earn"
            onClick={() => handleAction("earn")}
            className="w-full h-20 glass-card hover:neon-border-purple transition-all duration-300 flex items-center justify-start px-6 gap-4 group"
            variant="ghost"
          >
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
              <Target className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-left">
              <div className="text-white font-semibold text-lg flex items-center gap-2">
                Earn <span className="text-xl">🎯</span>
              </div>
              <div className="text-gray-400 text-sm">Claim free ZWAP! Coin through faucet rewards</div>
            </div>
          </Button>

          <Button
            data-testid="action-shop"
            onClick={() => handleAction("shop")}
            className="w-full h-20 glass-card hover:neon-border transition-all duration-300 flex items-center justify-start px-6 gap-4 group"
            variant="ghost"
          >
            <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center group-hover:bg-pink-500/30 transition-colors">
              <ShoppingBag className="w-6 h-6 text-pink-400" />
            </div>
            <div className="text-left">
              <div className="text-white font-semibold text-lg flex items-center gap-2">
                Shop <span className="text-xl">🛍️</span>
              </div>
              <div className="text-gray-400 text-sm">Browse and shop offers using your crypto</div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
