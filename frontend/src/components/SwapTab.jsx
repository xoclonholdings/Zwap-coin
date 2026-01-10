import React, { useState, useEffect } from "react";
import { useApp, api, CRYPTO_LOGOS, ZWAP_BANG } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRightLeft, ArrowDown, RefreshCw, Loader2, Check } from "lucide-react";

const TOKEN_CONFIG = {
  ZWAP: { name: "ZWAP!", color: "text-cyan-400", bgColor: "bg-cyan-500/20" },
  BTC: { name: "Bitcoin", color: "text-orange-400", bgColor: "bg-orange-500/20" },
  ETH: { name: "Ethereum", color: "text-purple-400", bgColor: "bg-purple-500/20" },
  POL: { name: "Polygon", color: "text-violet-400", bgColor: "bg-violet-500/20" },
  SOL: { name: "Solana", color: "text-green-400", bgColor: "bg-green-500/20" },
};

const TokenIcon = ({ token, size = "md" }) => {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-10 h-10"
  };
  
  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-800 flex items-center justify-center`}>
      <img 
        src={CRYPTO_LOGOS[token]} 
        alt={token} 
        className="w-full h-full object-contain p-1"
        onError={(e) => { e.target.style.display = 'none'; }}
      />
    </div>
  );
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
    const interval = setInterval(loadPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (fromAmount && prices[fromToken] && prices[toToken]) {
      const fromValue = parseFloat(fromAmount) * prices[fromToken];
      const result = (fromValue * 0.99) / prices[toToken];
      setToAmount(result.toFixed(8));
    } else { setToAmount(""); }
  }, [fromAmount, fromToken, toToken, prices]);

  const loadPrices = async () => {
    try { setPrices(await api.getPrices()); }
    catch (error) { console.error("Failed to load prices"); }
    finally { setIsLoadingPrices(false); }
  };

  const handleSwapTokens = () => {
    setFromToken(toToken); setToToken(fromToken);
    setFromAmount(""); setToAmount("");
  };

  const handleMaxAmount = () => {
    if (fromToken === "ZWAP" && user?.zwap_balance) setFromAmount(user.zwap_balance.toString());
  };

  const handleSwap = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) { toast.error("Enter valid amount"); return; }
    if (fromToken === "ZWAP" && parseFloat(fromAmount) > (user?.zwap_balance || 0)) { toast.error("Insufficient balance"); return; }

    setIsSwapping(true);
    try {
      const result = await api.executeSwap(walletAddress, fromToken, toToken, parseFloat(fromAmount));
      setSwapSuccess(result);
      await refreshUser();
      toast.success("Swap completed!");
      setFromAmount(""); setToAmount("");
    } catch (error) { toast.error(error.message || "Swap failed"); }
    finally { setIsSwapping(false); }
  };

  const formatPrice = (p) => p >= 1000 ? p.toLocaleString(undefined, { maximumFractionDigits: 0 }) : p >= 1 ? p.toFixed(2) : p.toFixed(4);
  const getRate = () => prices[fromToken] && prices[toToken] ? (prices[fromToken] / prices[toToken]).toFixed(6) : "—";

  return (
    <div className="min-h-[calc(100dvh-140px)] bg-[#0a0b1e] flex flex-col px-4 py-4" data-testid="swap-tab">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-2 pulse-glow-blue">
          <ArrowRightLeft className="w-7 h-7 text-blue-400" />
        </div>
        <h1 className="text-xl font-bold text-white">SWAP</h1>
        <p className="text-gray-400 text-xs">Swap your ZWAP!</p>
      </div>

      {/* Success Banner */}
      {swapSuccess && (
        <div className="glass-card p-3 mb-4 border-green-500/30 bg-green-500/10 rounded-xl">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400" />
            <p className="text-green-400 text-xs flex-1">
              {swapSuccess.from_amount} {swapSuccess.from_token} → {swapSuccess.to_amount.toFixed(6)} {swapSuccess.to_token}
            </p>
            <Button size="sm" variant="ghost" onClick={() => setSwapSuccess(null)} className="text-gray-400 h-6 px-2">✕</Button>
          </div>
        </div>
      )}

      {/* Price Ticker */}
      <div className="glass-card p-3 mb-4 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-400 text-xs">Live Prices</span>
          <Button size="sm" variant="ghost" onClick={loadPrices} className="text-cyan-400 h-6 p-0" disabled={isLoadingPrices}>
            <RefreshCw className={`w-3 h-3 ${isLoadingPrices ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <div className="flex justify-between">
          {tokens.map(token => (
            <div key={token} className="text-center flex-1">
              <TokenIcon token={token} size="sm" />
              <div className="text-[10px] text-gray-400 mt-1">{token}</div>
              <div className="text-xs text-white font-mono">${prices[token] ? formatPrice(prices[token]) : "—"}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Swap Card */}
      <div className="glass-card p-4 flex-1 rounded-xl">
        {/* From */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-gray-400">From</span>
            {fromToken === "ZWAP" && (
              <span className="text-gray-400">
                Balance: <span className="text-cyan-400">{user?.zwap_balance?.toFixed(0) || "0"}</span>
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Select value={fromToken} onValueChange={setFromToken}>
              <SelectTrigger className="w-28 bg-[#141530] border-gray-700 h-12" data-testid="from-token">
                <div className="flex items-center gap-2">
                  <TokenIcon token={fromToken} size="sm" />
                  <span>{fromToken}</span>
                </div>
              </SelectTrigger>
              <SelectContent className="bg-[#141530] border-gray-700">
                {tokens.filter(t => t !== toToken).map(token => (
                  <SelectItem key={token} value={token}>
                    <div className="flex items-center gap-2">
                      <TokenIcon token={token} size="sm" />
                      <span>{token}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex-1 relative">
              <Input 
                data-testid="from-amount" 
                type="number" 
                placeholder="0" 
                value={fromAmount} 
                onChange={(e) => setFromAmount(e.target.value)} 
                className="bg-[#141530] border-gray-700 text-white text-right pr-14 h-12 text-lg" 
              />
              {fromToken === "ZWAP" && (
                <Button size="sm" variant="ghost" onClick={handleMaxAmount} className="absolute right-2 top-1/2 -translate-y-1/2 text-cyan-400 text-xs h-7 px-2">
                  MAX
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center my-2">
          <Button variant="ghost" size="icon" onClick={handleSwapTokens} className="w-10 h-10 rounded-full bg-[#141530] border border-gray-700 hover:border-cyan-500" data-testid="swap-direction">
            <ArrowDown className="w-5 h-5 text-cyan-400" />
          </Button>
        </div>

        {/* To */}
        <div className="mb-4">
          <div className="text-xs mb-2 text-gray-400">To</div>
          <div className="flex gap-2">
            <Select value={toToken} onValueChange={setToToken}>
              <SelectTrigger className="w-28 bg-[#141530] border-gray-700 h-12" data-testid="to-token">
                <div className="flex items-center gap-2">
                  <TokenIcon token={toToken} size="sm" />
                  <span>{toToken}</span>
                </div>
              </SelectTrigger>
              <SelectContent className="bg-[#141530] border-gray-700">
                {tokens.filter(t => t !== fromToken).map(token => (
                  <SelectItem key={token} value={token}>
                    <div className="flex items-center gap-2">
                      <TokenIcon token={token} size="sm" />
                      <span>{token}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input 
              data-testid="to-amount" 
              type="text" 
              placeholder="0" 
              value={toAmount} 
              readOnly 
              className="flex-1 bg-[#141530] border-gray-700 text-white text-right h-12 text-lg" 
            />
          </div>
        </div>

        {/* Rate & Fee */}
        <div className="text-xs text-gray-400 mb-4 p-3 bg-gray-800/50 rounded-lg">
          <div className="flex justify-between">
            <span>Rate</span>
            <span className="text-white">1 {fromToken} = {getRate()} {toToken}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Fee</span>
            <span className="text-white">1%</span>
          </div>
        </div>

        {/* Swap Button */}
        <Button 
          data-testid="execute-swap" 
          onClick={handleSwap} 
          disabled={isSwapping || !fromAmount || parseFloat(fromAmount) <= 0}
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-500 to-cyan-500"
        >
          {isSwapping ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Swapping...</>
          ) : (
            <><ArrowRightLeft className="w-5 h-5 mr-2" />Swap</>
          )}
        </Button>
      </div>
    </div>
  );
}
