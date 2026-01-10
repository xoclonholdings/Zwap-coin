import React from "react";
import { motion } from "framer-motion";
import { useApp } from "@/App";
import { Button } from "@/components/ui/button";
import { Wallet, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function FirstTimeUserPrompt({ open, onOpenChange }) {
  const { setIsWalletModalOpen } = useApp();

  const handleConnect = () => {
    onOpenChange(false);
    setIsWalletModalOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm bg-[#0f1029] border-cyan-500/30">
        <DialogHeader>
          <DialogTitle className="text-xl text-white text-center">Welcome to ZWAP!</DialogTitle>
          <DialogDescription className="text-gray-400 text-center">
            Connect your wallet to save your progress and start earning rewards.
          </DialogDescription>
        </DialogHeader>
        
        <motion.div 
          className="py-6 text-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <motion.div
            className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4"
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(0,245,255,0.2)",
                "0 0 40px rgba(0,245,255,0.4)",
                "0 0 20px rgba(0,245,255,0.2)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Wallet className="w-10 h-10 text-cyan-400" />
          </motion.div>
          
          <div className="space-y-2 mb-6">
            <p className="text-white font-medium">Without a wallet, you can:</p>
            <ul className="text-gray-400 text-sm space-y-1">
              <li>✓ Browse the app</li>
              <li>✓ View prices and items</li>
              <li>✓ Try demo games</li>
            </ul>
          </div>
          
          <div className="space-y-2 mb-6">
            <p className="text-cyan-400 font-medium">With a wallet, you can:</p>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>💰 Earn & save ZWAP! Coin</li>
              <li>🎮 Keep game progress</li>
              <li>🛒 Purchase items</li>
              <li>💱 Swap tokens</li>
            </ul>
          </div>
        </motion.div>

        <div className="space-y-3">
          <Button
            onClick={handleConnect}
            className="w-full h-12 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-base font-semibold"
          >
            <Wallet className="w-5 h-5 mr-2" />
            Connect Wallet
          </Button>
          
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            className="w-full text-gray-400 hover:text-white"
          >
            Continue as Guest
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
