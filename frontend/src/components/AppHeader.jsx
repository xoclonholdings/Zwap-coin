import React, { useState } from "react";
import { useApp, ZWAP_BANG, api } from "@/App";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Wallet, User, LogOut, FileText, HelpCircle, Lock, ChevronRight, Crown, Mail } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Generate username from wallet
const generateUsername = (wallet) => {
  if (!wallet) return "Guest";
  const hash = wallet.slice(2, 10);
  const num = parseInt(hash, 16) % 9999;
  return `Zwapper#${num.toString().padStart(4, '0')}`;
};

export default function AppHeader() {
  const { user, walletAddress, setIsWalletModalOpen, disconnectWallet } = useApp();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const username = generateUsername(walletAddress);

  const handleUpgrade = async () => {
    try {
      const result = await api.createSubscription(window.location.origin);
      if (result.url) window.location.href = result.url;
    } catch (error) {
      console.error("Subscription error:", error);
    }
  };

  const settingsItems = [
    { icon: User, label: "Profile", action: () => {} },
    { icon: Mail, label: "Contact", action: () => window.open("mailto:support@zwap.app", "_blank") },
    { icon: Lock, label: "Privacy Policy", action: () => window.open("/privacy", "_blank") },
    { icon: FileText, label: "Terms of Use", action: () => window.open("/terms", "_blank") },
    { icon: HelpCircle, label: "FAQs & Help", action: () => navigate("/about") },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#0a0b1e]/95 backdrop-blur-lg border-b border-cyan-500/20">
      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        {/* Logo - Left (using ZWAP_BANG, larger) */}
        <motion.img 
          src={ZWAP_BANG} 
          alt="ZWAP!" 
          className="h-14 cursor-pointer" 
          onClick={() => navigate("/dashboard")}
          data-testid="header-logo"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{ 
            filter: [
              "drop-shadow(0 0 8px rgba(0,245,255,0.3))",
              "drop-shadow(0 0 16px rgba(0,245,255,0.5))",
              "drop-shadow(0 0 8px rgba(0,245,255,0.3))"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Right side - Balances + Connect Button + Profile */}
        <div className="flex items-center gap-3">
          {/* Balances - always visible, larger */}
          <motion.div 
            className="flex items-center gap-3 mr-2"
            animate={{ 
              boxShadow: [
                "0 0 10px rgba(0,245,255,0.1)",
                "0 0 20px rgba(0,245,255,0.2)",
                "0 0 10px rgba(0,245,255,0.1)"
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="text-right">
              <motion.p 
                className="text-base text-cyan-400 font-bold leading-tight"
                animate={{ textShadow: ["0 0 5px rgba(0,245,255,0.3)", "0 0 15px rgba(0,245,255,0.6)", "0 0 5px rgba(0,245,255,0.3)"] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {user?.zwap_balance?.toFixed(0) || 0}
              </motion.p>
              <p className="text-xs text-gray-500">ZWAP</p>
            </div>
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-600 to-transparent" />
            <div className="text-right">
              <motion.p 
                className="text-base text-purple-400 font-bold leading-tight"
                animate={{ textShadow: ["0 0 5px rgba(153,69,255,0.3)", "0 0 15px rgba(153,69,255,0.6)", "0 0 5px rgba(153,69,255,0.3)"] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                {user?.zpts_balance || 0}
              </motion.p>
              <p className="text-xs text-gray-500">zPts</p>
            </div>
          </motion.div>

          {/* Connect Wallet Button - always visible when not connected */}
          {!walletAddress && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => setIsWalletModalOpen(true)}
                className="h-12 px-4 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-base font-semibold shadow-lg shadow-cyan-500/30"
                data-testid="connect-wallet-btn"
              >
                <Wallet className="w-5 h-5 mr-2" />
                Connect
              </Button>
            </motion.div>
          )}

          {/* Profile Badge - only for connected users, larger */}
          {walletAddress && (
            <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
              <SheetTrigger asChild>
                <motion.button
                  className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-cyan-500/30"
                  data-testid="profile-badge"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{ 
                    boxShadow: [
                      "0 0 15px rgba(0,245,255,0.3)",
                      "0 0 30px rgba(0,245,255,0.5)",
                      "0 0 15px rgba(0,245,255,0.3)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {username.slice(-4)}
                </motion.button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-[#0a0b1e] border-l border-cyan-500/20 w-80" aria-describedby="account-sheet-description">
                <SheetHeader>
                  <SheetTitle className="text-white">Account</SheetTitle>
                  <p id="account-sheet-description" className="sr-only">Manage your ZWAP! account settings and profile</p>
                </SheetHeader>
                
                <div className="mt-6 space-y-6">
                  {/* User Info */}
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg"
                      animate={{ 
                        boxShadow: [
                          "0 0 10px rgba(0,245,255,0.3)",
                          "0 0 20px rgba(0,245,255,0.5)",
                          "0 0 10px rgba(0,245,255,0.3)"
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {username.slice(-4)}
                    </motion.div>
                    <div>
                      <p className="text-white font-semibold">{username}</p>
                      <p className="text-gray-500 text-xs">
                        {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {user?.tier === "plus" ? (
                          <span className="text-xs text-yellow-400 flex items-center gap-1">
                            <Crown className="w-3 h-3" /> Plus Member
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">Starter</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Upgrade Banner */}
                  {user?.tier !== "plus" && (
                    <motion.button
                      onClick={handleUpgrade}
                      className="w-full p-4 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-left"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-yellow-400 font-semibold flex items-center gap-2">
                            <Crown className="w-4 h-4" /> Upgrade to Plus
                          </p>
                          <p className="text-gray-400 text-xs">$12.99/mo • 1.5x rewards</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-yellow-400" />
                      </div>
                    </motion.button>
                  )}

                  {/* Settings Menu */}
                  <div className="space-y-1">
                    {settingsItems.map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <motion.button
                          key={i}
                          onClick={item.action}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/50 text-left transition-colors"
                          whileHover={{ x: 5 }}
                        >
                          <Icon className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-300">{item.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Disconnect */}
                  <motion.button
                    onClick={() => { disconnectWallet(); setSettingsOpen(false); navigate("/"); }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                    whileHover={{ x: 5 }}
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Disconnect Wallet</span>
                  </motion.button>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
}
