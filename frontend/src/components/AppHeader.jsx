import React, { useState } from "react";
import { useApp, ZWAP_LOGO, api } from "@/App";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Wallet, User, Settings, LogOut, FileText, HelpCircle, Lock, ChevronRight, Crown } from "lucide-react";
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
    { icon: Lock, label: "Privacy Policy", action: () => window.open("/privacy", "_blank") },
    { icon: FileText, label: "Terms of Use", action: () => window.open("/terms", "_blank") },
    { icon: HelpCircle, label: "FAQs & Help", action: () => navigate("/about") },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#0a0b1e]/95 backdrop-blur-lg border-b border-cyan-500/10">
      <div className="flex items-center justify-between px-4 py-2 max-w-lg mx-auto">
        {/* Logo - Left */}
        <img 
          src={ZWAP_LOGO} 
          alt="ZWAP!" 
          className="h-10 cursor-pointer" 
          onClick={() => navigate("/dashboard")}
          data-testid="header-logo"
        />

        {/* Right side - Balance or Connect + Profile */}
        <div className="flex items-center gap-2">
          {walletAddress ? (
            <>
              {/* Balances */}
              <div className="flex items-center gap-2 mr-1">
                <div className="text-right">
                  <p className="text-xs text-cyan-400 font-bold leading-tight">{user?.zwap_balance?.toFixed(0) || 0}</p>
                  <p className="text-[9px] text-gray-500">ZWAP</p>
                </div>
                <div className="w-px h-6 bg-gray-700" />
                <div className="text-right">
                  <p className="text-xs text-purple-400 font-bold leading-tight">{user?.zpts_balance || 0}</p>
                  <p className="text-[9px] text-gray-500">zPts</p>
                </div>
              </div>

              {/* Profile Badge */}
              <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
                <SheetTrigger asChild>
                  <button
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-cyan-500/20"
                    data-testid="profile-badge"
                  >
                    {username.slice(-4)}
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-[#0a0b1e] border-l border-cyan-500/20 w-80">
                  <SheetHeader>
                    <SheetTitle className="text-white">Account</SheetTitle>
                  </SheetHeader>
                  
                  <div className="mt-6 space-y-6">
                    {/* User Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                        {username.slice(-4)}
                      </div>
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
                      <button
                        onClick={handleUpgrade}
                        className="w-full p-4 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-left"
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
                      </button>
                    )}

                    {/* Settings Menu */}
                    <div className="space-y-1">
                      {settingsItems.map((item, i) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={i}
                            onClick={item.action}
                            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/50 text-left transition-colors"
                          >
                            <Icon className="w-5 h-5 text-gray-400" />
                            <span className="text-gray-300">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Disconnect */}
                    <button
                      onClick={() => { disconnectWallet(); setSettingsOpen(false); navigate("/"); }}
                      className="w-full flex items-center gap-3 p-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Disconnect Wallet</span>
                    </button>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <Button
              onClick={() => setIsWalletModalOpen(true)}
              className="h-9 px-4 bg-cyan-500 hover:bg-cyan-600 text-sm"
              data-testid="connect-wallet-btn"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Connect
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
