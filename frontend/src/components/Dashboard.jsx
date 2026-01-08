import React, { useState } from "react";
import { useApp, api } from "@/App";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Footprints, 
  Gamepad2, 
  ShoppingBag, 
  ArrowRightLeft,
  Gift,
  ChevronRight,
  User,
  LogOut
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Dashboard() {
  const { user, walletAddress, disconnectWallet, refreshUser } = useApp();
  const navigate = useNavigate();
  const [isScratching, setIsScratching] = useState(false);
  const [scratchResult, setScratchResult] = useState(null);

  const formatAddress = (addr) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleScratch = async () => {
    if (isScratching || scratchResult) return;
    
    setIsScratching(true);
    try {
      const result = await api.scratchToWin(walletAddress);
      setScratchResult(result);
      await refreshUser();
      
      if (result.won) {
        toast.success(`You won ${result.amount} ZWAP!`);
      } else {
        toast.info("Better luck next time!");
      }
    } catch (error) {
      toast.error("Failed to scratch");
    } finally {
      setIsScratching(false);
    }
  };

  const resetScratch = () => {
    setScratchResult(null);
  };

  const progressPercent = user ? Math.min((user.daily_steps / 10000) * 100, 100) : 0;

  const features = [
    {
      id: "move",
      title: "MOVE",
      subtitle: "Walk and Earn",
      icon: Footprints,
      color: "cyan",
      path: "/move"
    },
    {
      id: "play",
      title: "PLAY",
      subtitle: "zBricks Game",
      icon: Gamepad2,
      color: "purple",
      path: "/play"
    },
    {
      id: "shop",
      title: "SHOP",
      subtitle: "Zupreme Imports",
      icon: ShoppingBag,
      color: "pink",
      path: "/shop"
    },
    {
      id: "swap",
      title: "SWAP",
      subtitle: "Exchange Tokens",
      icon: ArrowRightLeft,
      color: "blue",
      path: "/swap"
    }
  ];

  const colorClasses = {
    cyan: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 hover:border-cyan-400",
    purple: "from-purple-500/20 to-purple-500/5 border-purple-500/30 hover:border-purple-400",
    pink: "from-pink-500/20 to-pink-500/5 border-pink-500/30 hover:border-pink-400",
    blue: "from-blue-500/20 to-blue-500/5 border-blue-500/30 hover:border-blue-400"
  };

  const iconColors = {
    cyan: "text-cyan-400",
    purple: "text-purple-400",
    pink: "text-pink-400",
    blue: "text-blue-400"
  };

  return (
    <div className="min-h-screen bg-[#0a0b1e] p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold neon-text" data-testid="dashboard-logo">ZWAP!</h1>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-10 h-10 rounded-full bg-cyan-500/20 p-0"
              data-testid="profile-button"
            >
              <User className="w-5 h-5 text-cyan-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#141530] border-cyan-500/30">
            <DropdownMenuItem className="text-gray-400 text-sm">
              {formatAddress(walletAddress)}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={disconnectWallet}
              className="text-red-400 cursor-pointer"
              data-testid="disconnect-wallet"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Balance Card */}
      <div className="balance-glow p-6 mb-6" data-testid="balance-card">
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-1">Your Balance</p>
          <h2 className="text-5xl font-bold neon-text" data-testid="zwap-balance">
            {user?.zwap_balance?.toFixed(2) || "0.00"}
          </h2>
          <p className="text-cyan-400 text-lg">ZWAP</p>
        </div>
        
        {/* Progress to daily goal */}
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Daily Progress</span>
            <span className="text-cyan-400">{user?.daily_steps || 0} / 10,000 steps</span>
          </div>
          <div className="progress-bar h-3">
            <div 
              className="progress-fill h-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Earn up to 700 ZWAP! daily
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="glass-card p-4 text-center">
          <p className="text-gray-400 text-xs mb-1">Total Steps</p>
          <p className="text-2xl font-bold text-white" data-testid="total-steps">
            {user?.total_steps?.toLocaleString() || "0"}
          </p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-gray-400 text-xs mb-1">Games Played</p>
          <p className="text-2xl font-bold text-white" data-testid="games-played">
            {user?.games_played || 0}
          </p>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <button
              key={feature.id}
              data-testid={`feature-${feature.id}`}
              onClick={() => navigate(feature.path)}
              className={`p-4 rounded-2xl border bg-gradient-to-br ${colorClasses[feature.color]} transition-all duration-300 hover:scale-[1.02] text-left`}
            >
              <Icon className={`w-8 h-8 ${iconColors[feature.color]} mb-3`} />
              <h3 className="text-white font-bold text-lg">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.subtitle}</p>
            </button>
          );
        })}
      </div>

      {/* Scratch to Win */}
      <div 
        className="scratch-card rounded-2xl p-4 cursor-pointer"
        data-testid="scratch-card"
        onClick={scratchResult ? resetScratch : handleScratch}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold">zWheel BONUS</h3>
              <p className="text-gray-400 text-sm">
                {scratchResult 
                  ? (scratchResult.won ? `Won ${scratchResult.amount} ZWAP! Tap to try again` : "Tap to try again")
                  : "Scratch to Win"
                }
              </p>
            </div>
          </div>
          <ChevronRight className={`w-6 h-6 text-gray-400 ${isScratching ? 'animate-spin' : ''}`} />
        </div>
        
        {scratchResult && (
          <div className={`mt-4 text-center py-3 rounded-xl ${scratchResult.won ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
            <p className={`font-bold ${scratchResult.won ? 'text-green-400' : 'text-red-400'}`}>
              {scratchResult.won ? `🎉 You won ${scratchResult.amount} ZWAP!` : "😢 Better luck next time!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
