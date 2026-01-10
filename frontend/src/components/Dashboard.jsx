import React, { useState } from "react";
import { useApp, api, ZWAP_LOGO, TIERS } from "@/App";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Footprints, Gamepad2, ShoppingBag, ArrowRightLeft, Gift, User, LogOut, Crown, Zap } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Dashboard() {
  const { user, walletAddress, disconnectWallet, refreshUser } = useApp();
  const navigate = useNavigate();
  const [isScratching, setIsScratching] = useState(false);
  const [scratchResult, setScratchResult] = useState(null);

  const formatAddress = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  const handleScratch = async () => {
    if (isScratching || scratchResult) return;
    setIsScratching(true);
    try {
      const result = await api.scratchToWin(walletAddress);
      setScratchResult(result);
      await refreshUser();
      if (result.won) toast.success(`You won ${result.amount} ZWAP!`);
      else toast.info("Better luck next time!");
    } catch (error) {
      toast.error("Failed to scratch");
    } finally {
      setIsScratching(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      const result = await api.createSubscription(window.location.origin);
      if (result.url) window.location.href = result.url;
    } catch (error) {
      toast.error("Failed to start subscription");
    }
  };

  const tierConfig = TIERS[user?.tier || "starter"];
  const progressPercent = user ? Math.min((user.daily_steps / 10000) * 100, 100) : 0;
  const zptsProgress = user ? Math.min((user.daily_zpts_earned / tierConfig.dailyZptsCap) * 100, 100) : 0;

  const features = [
    { id: "move", title: "MOVE", subtitle: "Walk & Earn", icon: Footprints, color: "cyan", path: "/move" },
    { id: "play", title: "PLAY", subtitle: "Games", icon: Gamepad2, color: "purple", path: "/play" },
    { id: "shop", title: "SHOP", subtitle: "Zupreme", icon: ShoppingBag, color: "pink", path: "/shop" },
    { id: "swap", title: "SWAP", subtitle: "Exchange", icon: ArrowRightLeft, color: "blue", path: "/swap" }
  ];

  const colorClasses = {
    cyan: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 active:border-cyan-400",
    purple: "from-purple-500/20 to-purple-500/5 border-purple-500/30 active:border-purple-400",
    pink: "from-pink-500/20 to-pink-500/5 border-pink-500/30 active:border-pink-400",
    blue: "from-blue-500/20 to-blue-500/5 border-blue-500/30 active:border-blue-400"
  };

  const iconColors = { cyan: "text-cyan-400", purple: "text-purple-400", pink: "text-pink-400", blue: "text-blue-400" };

  return (
    <div className="h-[100dvh] bg-[#0a0b1e] flex flex-col px-4 pt-3 pb-[72px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <img src={ZWAP_LOGO} alt="ZWAP!" className="h-8" data-testid="dashboard-logo" />
        
        <div className="flex items-center gap-2">
          {user?.tier === "starter" && (
            <Button onClick={handleUpgrade} size="sm" className="h-8 bg-gradient-to-r from-yellow-500 to-orange-500 text-xs" data-testid="upgrade-btn">
              <Crown className="w-3 h-3 mr-1" /> Upgrade
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-8 h-8 rounded-full bg-cyan-500/20 p-0" data-testid="profile-button">
                <User className="w-4 h-4 text-cyan-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#141530] border-cyan-500/30">
              <DropdownMenuItem className="text-gray-400 text-sm">{formatAddress(walletAddress)}</DropdownMenuItem>
              <DropdownMenuItem className="text-cyan-400 text-sm">
                <Crown className="w-3 h-3 mr-2" /> {tierConfig.name}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={disconnectWallet} className="text-red-400 cursor-pointer" data-testid="disconnect-wallet">
                <LogOut className="w-4 h-4 mr-2" /> Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Balance Cards Row */}
      <div className="grid grid-cols-2 gap-2 mb-2 flex-shrink-0">
        {/* ZWAP Balance */}
        <div className="balance-glow p-3 rounded-xl" data-testid="balance-card">
          <p className="text-gray-400 text-[10px]">ZWAP! Coin</p>
          <h2 className="text-2xl font-bold neon-text leading-tight" data-testid="zwap-balance">
            {user?.zwap_balance?.toFixed(0) || "0"}
          </h2>
        </div>
        
        {/* Z Points Balance */}
        <div className="glass-card p-3 rounded-xl border border-purple-500/30">
          <p className="text-gray-400 text-[10px]">Z Points</p>
          <h2 className="text-2xl font-bold text-purple-400 leading-tight" data-testid="zpts-balance">
            {user?.zpts_balance || 0}
          </h2>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="glass-card p-3 mb-2 flex-shrink-0 rounded-xl">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-gray-400">Steps</span>
              <span className="text-cyan-400">{user?.daily_steps?.toLocaleString() || 0}/10K</span>
            </div>
            <div className="progress-bar h-2">
              <div className="progress-fill h-full" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-gray-400">Daily zPts</span>
              <span className="text-purple-400">{user?.daily_zpts_earned || 0}/{tierConfig.dailyZptsCap}</span>
            </div>
            <div className="h-2 bg-purple-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all" style={{ width: `${zptsProgress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-2 gap-2 flex-1 min-h-0">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <button
              key={feature.id}
              data-testid={`feature-${feature.id}`}
              onClick={() => navigate(feature.path)}
              className={`p-3 rounded-2xl border bg-gradient-to-br ${colorClasses[feature.color]} transition-all duration-200 active:scale-[0.98] flex flex-col justify-center`}
            >
              <Icon className={`w-6 h-6 ${iconColors[feature.color]} mb-1`} />
              <h3 className="text-white font-bold text-sm">{feature.title}</h3>
              <p className="text-gray-400 text-[10px]">{feature.subtitle}</p>
            </button>
          );
        })}
      </div>

      {/* Scratch to Win */}
      <div 
        className="scratch-card rounded-xl p-3 cursor-pointer mt-2 flex-shrink-0"
        data-testid="scratch-card"
        onClick={scratchResult ? () => setScratchResult(null) : handleScratch}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
              <Gift className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">zWheel BONUS</h3>
              <p className="text-gray-400 text-[10px]">
                {scratchResult ? (scratchResult.won ? `+${scratchResult.amount} ZWAP!` : "Try again") : "Scratch to Win"}
              </p>
            </div>
          </div>
          {scratchResult && (
            <span className={`text-xs font-bold px-2 py-1 rounded ${scratchResult.won ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
              {scratchResult.won ? '🎉' : '🔄'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
