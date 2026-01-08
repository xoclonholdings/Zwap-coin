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
    { id: "move", title: "MOVE", subtitle: "Walk & Earn", icon: Footprints, color: "cyan", path: "/move" },
    { id: "play", title: "PLAY", subtitle: "zCube & Trivia", icon: Gamepad2, color: "purple", path: "/play" },
    { id: "shop", title: "SHOP", subtitle: "Zupreme Imports", icon: ShoppingBag, color: "pink", path: "/shop" },
    { id: "swap", title: "SWAP", subtitle: "Exchange Tokens", icon: ArrowRightLeft, color: "blue", path: "/swap" }
  ];

  const colorClasses = {
    cyan: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 active:border-cyan-400",
    purple: "from-purple-500/20 to-purple-500/5 border-purple-500/30 active:border-purple-400",
    pink: "from-pink-500/20 to-pink-500/5 border-pink-500/30 active:border-pink-400",
    blue: "from-blue-500/20 to-blue-500/5 border-blue-500/30 active:border-blue-400"
  };

  const iconColors = {
    cyan: "text-cyan-400",
    purple: "text-purple-400",
    pink: "text-pink-400",
    blue: "text-blue-400"
  };

  return (
    <div className="h-[100dvh] bg-[#0a0b1e] flex flex-col px-4 pt-3 pb-[72px] overflow-hidden">
      {/* Header - Compact */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h1 className="text-2xl font-bold neon-text" data-testid="dashboard-logo">ZWAP!</h1>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-9 h-9 rounded-full bg-cyan-500/20 p-0"
              data-testid="profile-button"
            >
              <User className="w-4 h-4 text-cyan-400" />
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

      {/* Balance Card - Compact */}
      <div className="balance-glow p-4 mb-3 flex-shrink-0" data-testid="balance-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs">Your Balance</p>
            <h2 className="text-4xl font-bold neon-text leading-tight" data-testid="zwap-balance">
              {user?.zwap_balance?.toFixed(0) || "0"}
            </h2>
            <p className="text-cyan-400 text-sm -mt-1">ZWAP</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-xs">Steps Today</p>
            <p className="text-2xl font-bold text-white">{user?.daily_steps?.toLocaleString() || "0"}</p>
            <p className="text-xs text-gray-500">/ 10,000</p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3">
          <div className="progress-bar h-2">
            <div className="progress-fill h-full" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="text-[10px] text-gray-500 mt-1 text-center">Earn up to 700 ZWAP! daily</p>
        </div>
      </div>

      {/* Feature Grid - Main content area, takes remaining space */}
      <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <button
              key={feature.id}
              data-testid={`feature-${feature.id}`}
              onClick={() => navigate(feature.path)}
              className={`p-3 rounded-2xl border bg-gradient-to-br ${colorClasses[feature.color]} transition-all duration-200 active:scale-[0.98] flex flex-col justify-center`}
            >
              <Icon className={`w-7 h-7 ${iconColors[feature.color]} mb-2`} />
              <h3 className="text-white font-bold text-base">{feature.title}</h3>
              <p className="text-gray-400 text-xs">{feature.subtitle}</p>
            </button>
          );
        })}
      </div>

      {/* Scratch to Win - Bottom compact */}
      <div 
        className="scratch-card rounded-xl p-3 cursor-pointer mt-3 flex-shrink-0"
        data-testid="scratch-card"
        onClick={scratchResult ? resetScratch : handleScratch}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">zWheel BONUS</h3>
              <p className="text-gray-400 text-xs">
                {scratchResult 
                  ? (scratchResult.won ? `Won ${scratchResult.amount} ZWAP!` : "Try again")
                  : "Scratch to Win"
                }
              </p>
            </div>
          </div>
          {scratchResult && (
            <span className={`text-xs font-bold px-2 py-1 rounded ${scratchResult.won ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {scratchResult.won ? '🎉' : '🔄'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
