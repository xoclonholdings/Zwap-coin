import React, { useState, useEffect } from "react";
import { useApp, api } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRightLeft, ArrowDown, RefreshCw, Loader2, Check } from "lucide-react";

const TOKEN_ICONS = { ZWAP: "⚡", BTC: "₿", ETH: "Ξ", POL: "🔷", SOL: "◎" };
const TOKEN_COLORS = { ZWAP: "text-cyan-400", BTC: "text-orange-400", ETH: "text-purple-400", POL: "text-violet-400", SOL: "text-green-400" };

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
    <div className="h-[100dvh] bg-[#0a0b1e] flex flex-col px-4 pt-4 pb-[72px] overflow-hidden" data-testid="swap-tab">
      {/* Header */}
      <div className="text-center mb-2 flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-1">
          <ArrowRightLeft className="w-6 h-6 text-blue-400" />
        </div>
        <h1 className="text-xl font-bold text-white">SWAP</h1>
      </div>

      {/* Success Banner */}
      {swapSuccess && (
        <div className="glass-card p-2 mb-2 border-green-500/30 bg-green-500/10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400" />
            <p className="text-green-400 text-xs flex-1">{swapSuccess.from_amount} {swapSuccess.from_token} → {swapSuccess.to_amount.toFixed(6)} {swapSuccess.to_token}</p>
            <Button size="sm" variant="ghost" onClick={() => setSwapSuccess(null)} className="text-gray-400 h-6 px-2">✕</Button>
          </div>
        </div>
      )}

      {/* Price Ticker */}
      <div className="glass-card p-3 mb-2 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-xs">Live Prices</span>
          <Button size="sm" variant="ghost" onClick={loadPrices} className="text-cyan-400 h-6 p-0" disabled={isLoadingPrices}>
            <RefreshCw className={`w-3 h-3 ${isLoadingPrices ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <div className="grid grid-cols-5 gap-1">
          {tokens.map(token => (
            <div key={token} className="text-center">
              <div className={`text-sm ${TOKEN_COLORS[token]}`}>{TOKEN_ICONS[token]}</div>
              <div className="text-[10px] text-gray-400">{token}</div>
              <div className="text-xs text-white font-mono">${prices[token] ? formatPrice(prices[token]) : "—"}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Swap Card */}
      <div className="glass-card p-3 flex-1 flex flex-col min-h-0">
        {/* From */}
        <div className="mb-2">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">From</span>
            {fromToken === "ZWAP" && <span className="text-gray-400">Bal: <span className="text-cyan-400">{user?.zwap_balance?.toFixed(0) || "0"}</span></span>}
          </div>
          <div className="flex gap-2">
            <Select value={fromToken} onValueChange={setFromToken}>
              <SelectTrigger className="w-24 bg-[#141530] border-gray-700 h-10" data-testid="from-token"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#141530] border-gray-700">
                {tokens.filter(t => t !== toToken).map(token => (
                  <SelectItem key={token} value={token}><span className={TOKEN_COLORS[token]}>{TOKEN_ICONS[token]}</span> {token}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex-1 relative">
              <Input data-testid="from-amount" type="number" placeholder="0" value={fromAmount} onChange={(e) => setFromAmount(e.target.value)} className="bg-[#141530] border-gray-700 text-white text-right pr-12 h-10" />
              {fromToken === "ZWAP" && <Button size="sm" variant="ghost" onClick={handleMaxAmount} className="absolute right-1 top-1/2 -translate-y-1/2 text-cyan-400 text-[10px] h-6 px-1">MAX</Button>}
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center my-1">
          <Button variant="ghost" size="icon" onClick={handleSwapTokens} className="w-8 h-8 rounded-full bg-[#141530] border border-gray-700" data-testid="swap-direction">
            <ArrowDown className="w-4 h-4 text-cyan-400" />
          </Button>
        </div>

        {/* To */}
        <div className="mb-2">
          <div className="text-xs mb-1 text-gray-400">To</div>
          <div className="flex gap-2">
            <Select value={toToken} onValueChange={setToToken}>
              <SelectTrigger className="w-24 bg-[#141530] border-gray-700 h-10" data-testid="to-token"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#141530] border-gray-700">
                {tokens.filter(t => t !== fromToken).map(token => (
                  <SelectItem key={token} value={token}><span className={TOKEN_COLORS[token]}>{TOKEN_ICONS[token]}</span> {token}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input data-testid="to-amount" type="text" placeholder="0" value={toAmount} readOnly className="flex-1 bg-[#141530] border-gray-700 text-white text-right h-10" />
          </div>
        </div>

        {/* Rate */}
        <div className="text-xs text-gray-400 mb-2">
          Rate: 1 {fromToken} = {getRate()} {toToken} • Fee: 1%
        </div>

        {/* Swap Button */}
        <Button data-testid="execute-swap" onClick={handleSwap} disabled={isSwapping || !fromAmount || parseFloat(fromAmount) <= 0}
          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 mt-auto">
          {isSwapping ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Swapping...</> : <><ArrowRightLeft className="w-4 h-4 mr-2" />Swap</>}
        </Button>
      </div>
    </div>
  );
}
