import React, { useState, useEffect } from "react";
import { useApp, api } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRightLeft, ArrowDown, RefreshCw, Loader2, Check, TrendingUp, TrendingDown } from "lucide-react";

const TOKEN_ICONS = {
  ZWAP: "⚡",
  BTC: "₿",
  ETH: "Ξ",
  POL: "🔷",
  SOL: "◎"
};

const TOKEN_COLORS = {
  ZWAP: "text-cyan-400",
  BTC: "text-orange-400",
  ETH: "text-purple-400",
  POL: "text-violet-400",
  SOL: "text-green-400"
};

export default function SwapTab() {
  const { user, walletAddress, refreshUser } = useApp();
  const [prices, setPrices] = useState({});
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);
  const [fromToken, setFromToken] = useState("ZWAP");
  const [toToken, setToToken] = useState("ETH");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapSuccess, setSwapSuccess] = useState(null);

  const tokens = ["ZWAP", "BTC", "ETH", "POL", "SOL"];

  useEffect(() => {
    loadPrices();
    // Refresh prices every 30 seconds
    const interval = setInterval(loadPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Calculate to amount when from amount or tokens change
    if (fromAmount && prices[fromToken] && prices[toToken]) {
      const fromValue = parseFloat(fromAmount) * prices[fromToken];
      const fee = fromValue * 0.01; // 1% fee
      const netValue = fromValue - fee;
      const result = netValue / prices[toToken];
      setToAmount(result.toFixed(8));
    } else {
      setToAmount("");
    }
  }, [fromAmount, fromToken, toToken, prices]);

  const loadPrices = async () => {
    try {
      const data = await api.getPrices();
      setPrices(data);
    } catch (error) {
      console.error("Failed to load prices:", error);
    } finally {
      setIsLoadingPrices(false);
    }
  };

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount("");
    setToAmount("");
  };

  const handleMaxAmount = () => {
    if (fromToken === "ZWAP" && user?.zwap_balance) {
      setFromAmount(user.zwap_balance.toString());
    }
  };

  const handleSwap = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (fromToken === "ZWAP" && parseFloat(fromAmount) > (user?.zwap_balance || 0)) {
      toast.error("Insufficient ZWAP balance");
      return;
    }

    setIsSwapping(true);
    try {
      const result = await api.executeSwap(walletAddress, fromToken, toToken, parseFloat(fromAmount));
      setSwapSuccess(result);
      await refreshUser();
      toast.success("Swap completed successfully!");
      setFromAmount("");
      setToAmount("");
    } catch (error) {
      toast.error(error.message || "Swap failed");
    } finally {
      setIsSwapping(false);
    }
  };

  const formatPrice = (price) => {
    if (price >= 1000) return price.toLocaleString(undefined, { maximumFractionDigits: 0 });
    if (price >= 1) return price.toFixed(2);
    return price.toFixed(4);
  };

  const getRate = () => {
    if (!prices[fromToken] || !prices[toToken]) return "—";
    const rate = prices[fromToken] / prices[toToken];
    return rate.toFixed(8);
  };

  const getFee = () => {
    if (!fromAmount || !prices[fromToken]) return "0.00";
    const fee = parseFloat(fromAmount) * prices[fromToken] * 0.01;
    return fee.toFixed(4);
  };

  return (
    <div className="min-h-screen bg-[#0a0b1e] p-4" data-testid="swap-tab">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
          <ArrowRightLeft className="w-8 h-8 text-blue-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-1">SWAP</h1>
        <p className="text-gray-400">Exchange Tokens</p>
      </div>

      {/* Success Banner */}
      {swapSuccess && (
        <div className="glass-card p-4 mb-6 border-green-500/30 bg-green-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-green-400 font-medium">Swap Successful!</p>
              <p className="text-gray-400 text-sm">
                {swapSuccess.from_amount} {swapSuccess.from_token} → {swapSuccess.to_amount.toFixed(6)} {swapSuccess.to_token}
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSwapSuccess(null)}
              className="text-gray-400"
            >
              ✕
            </Button>
          </div>
        </div>
      )}

      {/* Price Ticker */}
      <div className="glass-card p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-400 text-sm">Live Prices</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={loadPrices}
            className="text-cyan-400 h-8"
            disabled={isLoadingPrices}
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingPrices ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {tokens.map(token => (
            <div key={token} className="text-center">
              <div className={`text-xl ${TOKEN_COLORS[token]}`}>{TOKEN_ICONS[token]}</div>
              <div className="text-xs text-gray-400">{token}</div>
              <div className="text-sm text-white font-mono">
                ${prices[token] ? formatPrice(prices[token]) : "—"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Swap Card */}
      <div className="glass-card p-4 mb-6">
        {/* From Token */}
        <div className="mb-2">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">From</span>
            {fromToken === "ZWAP" && (
              <span className="text-gray-400">
                Balance: <span className="text-cyan-400">{user?.zwap_balance?.toFixed(2) || "0"}</span>
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Select value={fromToken} onValueChange={setFromToken}>
              <SelectTrigger className="w-32 bg-[#141530] border-gray-700" data-testid="from-token">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#141530] border-gray-700">
                {tokens.filter(t => t !== toToken).map(token => (
                  <SelectItem key={token} value={token}>
                    <span className="flex items-center gap-2">
                      <span className={TOKEN_COLORS[token]}>{TOKEN_ICONS[token]}</span>
                      {token}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex-1 relative">
              <Input
                data-testid="from-amount"
                type="number"
                placeholder="0.00"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="bg-[#141530] border-gray-700 text-white text-right pr-16"
              />
              {fromToken === "ZWAP" && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleMaxAmount}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-cyan-400 text-xs h-6"
                >
                  MAX
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Swap Arrow */}
        <div className="flex justify-center my-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSwapTokens}
            className="w-10 h-10 rounded-full bg-[#141530] border border-gray-700 hover:border-cyan-500"
            data-testid="swap-direction"
          >
            <ArrowDown className="w-5 h-5 text-cyan-400" />
          </Button>
        </div>

        {/* To Token */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">To</span>
          </div>
          <div className="flex gap-2">
            <Select value={toToken} onValueChange={setToToken}>
              <SelectTrigger className="w-32 bg-[#141530] border-gray-700" data-testid="to-token">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#141530] border-gray-700">
                {tokens.filter(t => t !== fromToken).map(token => (
                  <SelectItem key={token} value={token}>
                    <span className="flex items-center gap-2">
                      <span className={TOKEN_COLORS[token]}>{TOKEN_ICONS[token]}</span>
                      {token}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              data-testid="to-amount"
              type="text"
              placeholder="0.00"
              value={toAmount}
              readOnly
              className="flex-1 bg-[#141530] border-gray-700 text-white text-right"
            />
          </div>
        </div>

        {/* Rate Info */}
        <div className="space-y-2 text-sm mb-4">
          <div className="flex justify-between">
            <span className="text-gray-400">Rate</span>
            <span className="text-white">
              1 {fromToken} = {getRate()} {toToken}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Fee (1%)</span>
            <span className="text-white">${getFee()} USD</span>
          </div>
        </div>

        {/* Swap Button */}
        <Button
          data-testid="execute-swap"
          onClick={handleSwap}
          disabled={isSwapping || !fromAmount || parseFloat(fromAmount) <= 0}
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
        >
          {isSwapping ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Swapping...
            </>
          ) : (
            <>
              <ArrowRightLeft className="w-5 h-5 mr-2" />
              Swap
            </>
          )}
        </Button>
      </div>

      {/* ZWAP Info */}
      <div className="glass-card p-4">
        <h3 className="text-white font-semibold mb-3">About ZWAP! Coin</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Network</span>
            <span className="text-cyan-400">Multichain</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Current Price</span>
            <span className="text-white">${prices.ZWAP?.toFixed(4) || "0.0250"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Your Holdings</span>
            <span className="text-white">{user?.zwap_balance?.toFixed(2) || "0"} ZWAP</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Holdings Value</span>
            <span className="text-green-400">
              ${((user?.zwap_balance || 0) * (prices.ZWAP || 0.025)).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
