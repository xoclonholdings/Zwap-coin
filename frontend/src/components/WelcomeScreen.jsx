import React from "react";
import { useApp, ZWAP_LOGO } from "@/App";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, Target, ShoppingBag } from "lucide-react";

export default function WelcomeScreen() {
  const { setIsWalletModalOpen, setPendingAction } = useApp();

  const handleAction = (action) => {
    setPendingAction(action);
    setIsWalletModalOpen(true);
  };

  return (
    <div className="h-[100dvh] bg-[#0a0b1e] flex flex-col items-center justify-center p-5 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center w-full max-w-sm mx-auto flex flex-col h-full justify-center">
        {/* Logo */}
        <div className="mb-2">
          <img src={ZWAP_LOGO} alt="ZWAP!" className="h-16 mx-auto" data-testid="zwap-logo" />
        </div>

        {/* Tagline */}
        <p className="text-gray-400 text-sm mb-6">The Crypto Faucet That Moves With You</p>

        {/* Welcome text */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-2" data-testid="welcome-heading">Welcome to Zwap!</h2>
          <p className="text-gray-400 text-sm">Before we jump in... What would you like to do today?</p>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <Button
            data-testid="action-swap"
            onClick={() => handleAction("swap")}
            className="w-full h-16 glass-card hover:neon-border transition-all duration-300 flex items-center justify-start px-4 gap-3 group"
            variant="ghost"
          >
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors flex-shrink-0">
              <ArrowRightLeft className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-left">
              <div className="text-white font-semibold flex items-center gap-2">Swap</div>
              <div className="text-gray-400 text-xs">Exchange tokens securely</div>
            </div>
          </Button>

          <Button
            data-testid="action-earn"
            onClick={() => handleAction("earn")}
            className="w-full h-16 glass-card hover:neon-border-purple transition-all duration-300 flex items-center justify-start px-4 gap-3 group"
            variant="ghost"
          >
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors flex-shrink-0">
              <Target className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-left">
              <div className="text-white font-semibold flex items-center gap-2">Earn</div>
              <div className="text-gray-400 text-xs">Claim free ZWAP! through faucet</div>
            </div>
          </Button>

          <Button
            data-testid="action-shop"
            onClick={() => handleAction("shop")}
            className="w-full h-16 glass-card hover:neon-border transition-all duration-300 flex items-center justify-start px-4 gap-3 group"
            variant="ghost"
          >
            <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center group-hover:bg-pink-500/30 transition-colors flex-shrink-0">
              <ShoppingBag className="w-5 h-5 text-pink-400" />
            </div>
            <div className="text-left">
              <div className="text-white font-semibold flex items-center gap-2">Shop</div>
              <div className="text-gray-400 text-xs">Browse with your crypto</div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
