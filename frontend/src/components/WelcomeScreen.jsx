import React from "react";
import { motion } from "framer-motion";
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
        <motion.div 
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.15, 0.1, 0.15] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center w-full max-w-sm mx-auto flex flex-col h-full justify-center">
        {/* Logo */}
        <motion.div 
          className="mb-2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.img 
            src={ZWAP_LOGO} 
            alt="ZWAP!" 
            className="h-20 mx-auto" 
            data-testid="zwap-logo"
            animate={{ 
              filter: [
                "drop-shadow(0 0 15px rgba(0,245,255,0.3))",
                "drop-shadow(0 0 30px rgba(0,245,255,0.5))",
                "drop-shadow(0 0 15px rgba(0,245,255,0.3))"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>

        {/* Tagline - MOVE. PLAY. SWAP. SHOP. */}
        <motion.div 
          className="flex justify-center gap-2 text-sm font-bold mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.span 
            className="text-cyan-400"
            animate={{ textShadow: ["0 0 5px rgba(0,245,255,0.3)", "0 0 15px rgba(0,245,255,0.6)", "0 0 5px rgba(0,245,255,0.3)"] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            MOVE.
          </motion.span>
          <motion.span 
            className="text-purple-400"
            animate={{ textShadow: ["0 0 5px rgba(153,69,255,0.3)", "0 0 15px rgba(153,69,255,0.6)", "0 0 5px rgba(153,69,255,0.3)"] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.25 }}
          >
            PLAY.
          </motion.span>
          <motion.span 
            className="text-blue-400"
            animate={{ textShadow: ["0 0 5px rgba(59,130,246,0.3)", "0 0 15px rgba(59,130,246,0.6)", "0 0 5px rgba(59,130,246,0.3)"] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          >
            SWAP.
          </motion.span>
          <motion.span 
            className="text-pink-400"
            animate={{ textShadow: ["0 0 5px rgba(236,72,153,0.3)", "0 0 15px rgba(236,72,153,0.6)", "0 0 5px rgba(236,72,153,0.3)"] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.75 }}
          >
            SHOP.
          </motion.span>
        </motion.div>

        {/* Welcome text */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold text-white mb-2" data-testid="welcome-heading">Welcome to Zwap!</h2>
          <p className="text-gray-400 text-sm">Before we jump in... What would you like to do today?</p>
        </motion.div>

        {/* Action buttons */}
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              data-testid="action-swap"
              onClick={() => handleAction("swap")}
              className="w-full h-16 glass-card hover:neon-border transition-all duration-300 flex items-center justify-start px-4 gap-3 group"
              variant="ghost"
            >
              <motion.div 
                className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors flex-shrink-0"
                animate={{ boxShadow: ["0 0 10px rgba(0,245,255,0.2)", "0 0 20px rgba(0,245,255,0.4)", "0 0 10px rgba(0,245,255,0.2)"] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ArrowRightLeft className="w-5 h-5 text-cyan-400" />
              </motion.div>
              <div className="text-left">
                <div className="text-white font-semibold">Swap</div>
                <div className="text-gray-400 text-xs">Exchange tokens securely</div>
              </div>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              data-testid="action-earn"
              onClick={() => handleAction("earn")}
              className="w-full h-16 glass-card hover:neon-border-purple transition-all duration-300 flex items-center justify-start px-4 gap-3 group"
              variant="ghost"
            >
              <motion.div 
                className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors flex-shrink-0"
                animate={{ boxShadow: ["0 0 10px rgba(153,69,255,0.2)", "0 0 20px rgba(153,69,255,0.4)", "0 0 10px rgba(153,69,255,0.2)"] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Target className="w-5 h-5 text-purple-400" />
              </motion.div>
              <div className="text-left">
                <div className="text-white font-semibold">Earn</div>
                <div className="text-gray-400 text-xs">Claim free ZWAP! through faucet</div>
              </div>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              data-testid="action-shop"
              onClick={() => handleAction("shop")}
              className="w-full h-16 glass-card hover:neon-border transition-all duration-300 flex items-center justify-start px-4 gap-3 group"
              variant="ghost"
            >
              <motion.div 
                className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center group-hover:bg-pink-500/30 transition-colors flex-shrink-0"
                animate={{ boxShadow: ["0 0 10px rgba(236,72,153,0.2)", "0 0 20px rgba(236,72,153,0.4)", "0 0 10px rgba(236,72,153,0.2)"] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ShoppingBag className="w-5 h-5 text-pink-400" />
              </motion.div>
              <div className="text-left">
                <div className="text-white font-semibold">Shop</div>
                <div className="text-gray-400 text-xs">Browse with your crypto</div>
              </div>
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
