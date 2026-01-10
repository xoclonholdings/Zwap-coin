import React, { useState } from "react";
import { motion } from "framer-motion";
import { useApp, TIERS } from "@/App";
import { useNavigate } from "react-router-dom";
import { Footprints, Gamepad2, ShoppingBag, ArrowRightLeft, TrendingUp, Zap } from "lucide-react";
import FirstTimeUserPrompt from "@/components/FirstTimeUserPrompt";

export default function Dashboard() {
  const { user, walletAddress } = useApp();
  const navigate = useNavigate();
  const [showFirstTimePrompt, setShowFirstTimePrompt] = useState(false);

  const tierConfig = TIERS[user?.tier || "starter"];
  const progressPercent = user ? Math.min((user.daily_steps / 10000) * 100, 100) : 0;
  const zptsProgress = user ? Math.min((user.daily_zpts_earned / tierConfig.dailyZptsCap) * 100, 100) : 0;

  const features = [
    { id: "move", title: "MOVE", subtitle: "Walk & Earn", icon: Footprints, color: "cyan", path: "/move", stat: `${user?.total_steps?.toLocaleString() || 0} steps`, requiresWallet: true },
    { id: "play", title: "PLAY", subtitle: "Games", icon: Gamepad2, color: "purple", path: "/play", stat: `${user?.games_played || 0} played`, requiresWallet: true },
    { id: "shop", title: "SHOP", subtitle: "Zupreme", icon: ShoppingBag, color: "pink", path: "/shop", stat: "Browse items", requiresWallet: false },
    { id: "swap", title: "SWAP", subtitle: "Exchange", icon: ArrowRightLeft, color: "blue", path: "/swap", stat: "Trade tokens", requiresWallet: true }
  ];

  const colorClasses = {
    cyan: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 active:border-cyan-400",
    purple: "from-purple-500/20 to-purple-500/5 border-purple-500/30 active:border-purple-400",
    pink: "from-pink-500/20 to-pink-500/5 border-pink-500/30 active:border-pink-400",
    blue: "from-blue-500/20 to-blue-500/5 border-blue-500/30 active:border-blue-400"
  };

  const iconColors = { cyan: "text-cyan-400", purple: "text-purple-400", pink: "text-pink-400", blue: "text-blue-400" };

  const handleFeatureClick = (feature) => {
    if (feature.requiresWallet && !walletAddress) {
      setShowFirstTimePrompt(true);
    } else {
      navigate(feature.path);
    }
  };

  return (
    <div className="min-h-[calc(100dvh-160px)] bg-[#0a0b1e] flex flex-col px-4 py-4" data-testid="dashboard">
      {/* Stats Summary */}
      <motion.div 
        className="glass-card p-4 mb-4 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ boxShadow: "0 0 20px rgba(0,245,255,0.1)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold text-sm">Today's Progress</h2>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </motion.div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Steps Progress */}
          <div>
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-gray-400">Steps</span>
              <motion.span 
                className="text-cyan-400"
                animate={{ textShadow: ["0 0 5px rgba(0,245,255,0.3)", "0 0 10px rgba(0,245,255,0.5)", "0 0 5px rgba(0,245,255,0.3)"] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {user?.daily_steps?.toLocaleString() || 0} / 10K
              </motion.span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full" 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
          
          {/* Z Points Progress */}
          <div>
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-gray-400">Z Points</span>
              <motion.span 
                className="text-purple-400"
                animate={{ textShadow: ["0 0 5px rgba(153,69,255,0.3)", "0 0 10px rgba(153,69,255,0.5)", "0 0 5px rgba(153,69,255,0.3)"] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {user?.daily_zpts_earned || 0} / {tierConfig.dailyZptsCap}
              </motion.span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" 
                initial={{ width: 0 }}
                animate={{ width: `${zptsProgress}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              />
            </div>
          </div>
        </div>

        {/* Quick stats row */}
        <div className="flex justify-between mt-4 pt-3 border-t border-gray-800">
          <div className="text-center">
            <motion.p 
              className="text-lg font-bold text-cyan-400"
              animate={{ textShadow: ["0 0 5px rgba(0,245,255,0.2)", "0 0 15px rgba(0,245,255,0.4)", "0 0 5px rgba(0,245,255,0.2)"] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {user?.total_earned?.toFixed(0) || 0}
            </motion.p>
            <p className="text-[10px] text-gray-500">Total Earned</p>
          </div>
          <div className="text-center">
            <motion.p 
              className="text-lg font-bold text-purple-400"
              animate={{ textShadow: ["0 0 5px rgba(153,69,255,0.2)", "0 0 15px rgba(153,69,255,0.4)", "0 0 5px rgba(153,69,255,0.2)"] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              {user?.zpts_balance || 0}
            </motion.p>
            <p className="text-[10px] text-gray-500">Z Points</p>
          </div>
          <div className="text-center">
            <motion.p 
              className="text-lg font-bold text-white"
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {user?.games_played || 0}
            </motion.p>
            <p className="text-[10px] text-gray-500">Games</p>
          </div>
        </div>
      </motion.div>

      {/* Feature Grid */}
      <div className="grid grid-cols-2 gap-3 flex-1">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.button
              key={feature.id}
              data-testid={`feature-${feature.id}`}
              onClick={() => handleFeatureClick(feature)}
              className={`p-4 rounded-2xl border bg-gradient-to-br ${colorClasses[feature.color]} transition-all duration-200 flex flex-col relative overflow-hidden`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, boxShadow: "0 0 25px rgba(0,245,255,0.2)" }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Animated background glow */}
              <motion.div
                className="absolute inset-0 opacity-20"
                animate={{ 
                  background: [
                    `radial-gradient(circle at 30% 30%, ${feature.color === 'cyan' ? 'rgba(0,245,255,0.3)' : feature.color === 'purple' ? 'rgba(153,69,255,0.3)' : feature.color === 'pink' ? 'rgba(236,72,153,0.3)' : 'rgba(59,130,246,0.3)'} 0%, transparent 70%)`,
                    `radial-gradient(circle at 70% 70%, ${feature.color === 'cyan' ? 'rgba(0,245,255,0.3)' : feature.color === 'purple' ? 'rgba(153,69,255,0.3)' : feature.color === 'pink' ? 'rgba(236,72,153,0.3)' : 'rgba(59,130,246,0.3)'} 0%, transparent 70%)`,
                    `radial-gradient(circle at 30% 30%, ${feature.color === 'cyan' ? 'rgba(0,245,255,0.3)' : feature.color === 'purple' ? 'rgba(153,69,255,0.3)' : feature.color === 'pink' ? 'rgba(236,72,153,0.3)' : 'rgba(59,130,246,0.3)'} 0%, transparent 70%)`
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              
              <div className="flex items-center justify-between mb-2 relative z-10">
                <motion.div
                  animate={{ 
                    filter: [
                      "drop-shadow(0 0 5px currentColor)",
                      "drop-shadow(0 0 15px currentColor)",
                      "drop-shadow(0 0 5px currentColor)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Icon className={`w-7 h-7 ${iconColors[feature.color]}`} />
                </motion.div>
                {feature.id === "play" && (
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Zap className="w-4 h-4 text-purple-400" />
                  </motion.div>
                )}
              </div>
              <h3 className="text-white font-bold text-lg relative z-10">{feature.title}</h3>
              <p className="text-gray-400 text-xs relative z-10">{feature.subtitle}</p>
              <p className={`text-[10px] mt-auto pt-2 ${iconColors[feature.color]} relative z-10`}>{feature.stat}</p>
            </motion.button>
          );
        })}
      </div>

      {/* Tip */}
      <motion.div 
        className="mt-4 text-center"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <p className="text-[10px] text-gray-500">
          💡 Play games to earn Z Points • Walk to earn ZWAP!
        </p>
      </motion.div>

      {/* First Time User Prompt */}
      <FirstTimeUserPrompt 
        open={showFirstTimePrompt} 
        onOpenChange={setShowFirstTimePrompt} 
      />
    </div>
  );
}
