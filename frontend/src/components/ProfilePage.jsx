import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useApp, ZWAP_BANG, api, TIERS } from "@/App";
import { ArrowLeft, Crown, Wallet, Trophy, Footprints, Gamepad2, ShoppingBag, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, walletAddress, setIsWalletModalOpen } = useApp();
  
  const tierConfig = TIERS[user?.tier || "starter"];
  
  const generateUsername = (wallet) => {
    if (!wallet) return "Guest";
    const hash = wallet.slice(2, 10);
    const num = parseInt(hash, 16) % 9999;
    return `Zwapper#${num.toString().padStart(4, '0')}`;
  };

  const handleUpgrade = async () => {
    try {
      const result = await api.createSubscription(window.location.origin);
      if (result.url) window.location.href = result.url;
    } catch (error) {
      console.error("Subscription error:", error);
    }
  };

  const stats = [
    { label: "Total Earned", value: user?.total_earned?.toFixed(0) || 0, icon: Trophy, color: "cyan" },
    { label: "Total Steps", value: user?.total_steps?.toLocaleString() || 0, icon: Footprints, color: "green" },
    { label: "Games Played", value: user?.games_played || 0, icon: Gamepad2, color: "purple" },
    { label: "Z Points", value: user?.zpts_balance || 0, icon: ShoppingBag, color: "pink" },
  ];

  return (
    <div className="min-h-screen bg-[#050510] text-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-[#0a0b1e]/95 backdrop-blur-lg border-b border-cyan-500/20">
        <div className="flex items-center px-4 py-3 max-w-lg mx-auto">
          <button onClick={() => navigate(-1)} className="mr-3 text-gray-400 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-white">Profile</h1>
        </div>
      </div>

      <div className="pt-20 pb-8 px-4 max-w-lg mx-auto">
        {/* Profile Card */}
        <motion.div 
          className="glass-card p-6 rounded-2xl mb-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {walletAddress ? (
            <>
              <motion.div 
                className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center mx-auto mb-4 text-4xl"
                animate={{ boxShadow: ["0 0 20px rgba(0,245,255,0.3)", "0 0 40px rgba(0,245,255,0.5)", "0 0 20px rgba(0,245,255,0.3)"] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                👤
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-1">{generateUsername(walletAddress)}</h2>
              <p className="text-gray-500 text-sm mb-2">{walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}</p>
              <div className="flex items-center justify-center gap-2">
                {user?.tier === "plus" ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm">
                    <Crown className="w-4 h-4" /> Plus Member
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-700/50 text-gray-400 text-sm">
                    Starter
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-xs mt-2 flex items-center justify-center gap-1">
                <Calendar className="w-3 h-3" />
                Member since {new Date(user?.created_at || Date.now()).toLocaleDateString()}
              </p>
            </>
          ) : (
            <>
              <div className="w-24 h-24 rounded-full bg-gray-700/50 flex items-center justify-center mx-auto mb-4 text-4xl">
                👤
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Guest</h2>
              <p className="text-gray-400 text-sm mb-4">Connect your wallet to save progress</p>
              <Button 
                onClick={() => setIsWalletModalOpen(true)}
                className="bg-gradient-to-r from-cyan-500 to-purple-500"
              >
                <Wallet className="w-4 h-4 mr-2" /> Connect Wallet
              </Button>
            </>
          )}
        </motion.div>

        {/* Stats Grid */}
        {walletAddress && (
          <motion.div 
            className="grid grid-cols-2 gap-3 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="glass-card p-4 rounded-xl text-center">
                  <Icon className={`w-6 h-6 mx-auto mb-2 text-${stat.color}-400`} />
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-gray-500 text-xs">{stat.label}</p>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Upgrade Banner */}
        {walletAddress && user?.tier !== "plus" && (
          <motion.div 
            className="glass-card p-5 rounded-2xl border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-orange-500/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                <Crown className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">Upgrade to Plus</h3>
                <p className="text-gray-400 text-sm mb-3">Get 1.5x rewards, unlock all games, higher caps</p>
                <Button onClick={handleUpgrade} className="bg-yellow-500 hover:bg-yellow-600 text-black">
                  $12.99/month
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tier Benefits */}
        <motion.div 
          className="glass-card p-5 rounded-2xl mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-bold text-white mb-4">Your Benefits</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Reward Multiplier</span>
              <span className="text-cyan-400 font-bold">{tierConfig.multiplier}x</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Daily Z Points Cap</span>
              <span className="text-purple-400 font-bold">{tierConfig.dailyZptsCap}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Games Unlocked</span>
              <span className="text-white font-bold">{user?.tier === "plus" ? "All 4" : "2"}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
