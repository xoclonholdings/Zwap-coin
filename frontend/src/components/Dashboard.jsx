import React from "react";
import { useApp, api, TIERS } from "@/App";
import { useNavigate } from "react-router-dom";
import { Footprints, Gamepad2, ShoppingBag, ArrowRightLeft, TrendingUp, Zap } from "lucide-react";

export default function Dashboard() {
  const { user } = useApp();
  const navigate = useNavigate();

  const tierConfig = TIERS[user?.tier || "starter"];
  const progressPercent = user ? Math.min((user.daily_steps / 10000) * 100, 100) : 0;
  const zptsProgress = user ? Math.min((user.daily_zpts_earned / tierConfig.dailyZptsCap) * 100, 100) : 0;

  const features = [
    { id: "move", title: "MOVE", subtitle: "Walk & Earn", icon: Footprints, color: "cyan", path: "/move", stat: `${user?.total_steps?.toLocaleString() || 0} steps` },
    { id: "play", title: "PLAY", subtitle: "Games", icon: Gamepad2, color: "purple", path: "/play", stat: `${user?.games_played || 0} played` },
    { id: "shop", title: "SHOP", subtitle: "Zupreme", icon: ShoppingBag, color: "pink", path: "/shop", stat: "Browse items" },
    { id: "swap", title: "SWAP", subtitle: "Exchange", icon: ArrowRightLeft, color: "blue", path: "/swap", stat: "Trade tokens" }
  ];

  const colorClasses = {
    cyan: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 active:border-cyan-400",
    purple: "from-purple-500/20 to-purple-500/5 border-purple-500/30 active:border-purple-400",
    pink: "from-pink-500/20 to-pink-500/5 border-pink-500/30 active:border-pink-400",
    blue: "from-blue-500/20 to-blue-500/5 border-blue-500/30 active:border-blue-400"
  };

  const iconColors = { cyan: "text-cyan-400", purple: "text-purple-400", pink: "text-pink-400", blue: "text-blue-400" };

  return (
    <div className="min-h-[calc(100dvh-140px)] bg-[#0a0b1e] flex flex-col px-4 py-4" data-testid="dashboard">
      {/* Stats Summary */}
      <div className="glass-card p-4 mb-4 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold text-sm">Today's Progress</h2>
          <TrendingUp className="w-4 h-4 text-cyan-400" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Steps Progress */}
          <div>
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-gray-400">Steps</span>
              <span className="text-cyan-400">{user?.daily_steps?.toLocaleString() || 0} / 10K</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all" 
                style={{ width: `${progressPercent}%` }} 
              />
            </div>
          </div>
          
          {/* Z Points Progress */}
          <div>
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-gray-400">Z Points</span>
              <span className="text-purple-400">{user?.daily_zpts_earned || 0} / {tierConfig.dailyZptsCap}</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all" 
                style={{ width: `${zptsProgress}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Quick stats row */}
        <div className="flex justify-between mt-4 pt-3 border-t border-gray-800">
          <div className="text-center">
            <p className="text-lg font-bold text-cyan-400">{user?.total_earned?.toFixed(0) || 0}</p>
            <p className="text-[10px] text-gray-500">Total Earned</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-purple-400">{user?.zpts_balance || 0}</p>
            <p className="text-[10px] text-gray-500">Z Points</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-white">{user?.games_played || 0}</p>
            <p className="text-[10px] text-gray-500">Games</p>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-2 gap-3 flex-1">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <button
              key={feature.id}
              data-testid={`feature-${feature.id}`}
              onClick={() => navigate(feature.path)}
              className={`p-4 rounded-2xl border bg-gradient-to-br ${colorClasses[feature.color]} transition-all duration-200 active:scale-[0.98] flex flex-col`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-7 h-7 ${iconColors[feature.color]}`} />
                {feature.id === "play" && (
                  <Zap className="w-4 h-4 text-purple-400" />
                )}
              </div>
              <h3 className="text-white font-bold text-lg">{feature.title}</h3>
              <p className="text-gray-400 text-xs">{feature.subtitle}</p>
              <p className={`text-[10px] mt-auto pt-2 ${iconColors[feature.color]}`}>{feature.stat}</p>
            </button>
          );
        })}
      </div>

      {/* Tip */}
      <div className="mt-4 text-center">
        <p className="text-[10px] text-gray-500">
          💡 Play games to earn Z Points • Walk to earn ZWAP!
        </p>
      </div>
    </div>
  );
}
