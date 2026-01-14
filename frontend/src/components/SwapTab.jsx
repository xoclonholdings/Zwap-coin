import React, { useState, useEffect } from "react";
import { useApp, api, CRYPTO_LOGOS } from "@/App";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRightLeft, X, RefreshCw, Info, Shield, Maximize2, Minimize2 } from "lucide-react";

/**
 * COMPLIANCE NOTE:
 * Swaps are processed by external third-party services embedded in an iframe.
 * This app does not process, custody, or control any transactions.
 * The embedded service handles all wallet connections and signing.
 */

const TOKEN_CONFIG = {
  ZWAP: { name: "ZWAP!", color: "text-cyan-400", bgColor: "bg-cyan-500/20" },
  BTC: { name: "Bitcoin", color: "text-orange-400", bgColor: "bg-orange-500/20" },
  ETH: { name: "Ethereum", color: "text-purple-400", bgColor: "bg-purple-500/20" },
  POL: { name: "Polygon", color: "text-violet-400", bgColor: "bg-violet-500/20" },
  SOL: { name: "Solana", color: "text-green-400", bgColor: "bg-green-500/20" },
};

const TokenIcon = ({ token, size = "md" }) => {
  const sizeClasses = { sm: "w-5 h-5", md: "w-8 h-8", lg: "w-10 h-10" };
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

// External swap service options
const EXTERNAL_SWAP_SERVICES = [
  {
    id: "jumper",
    name: "Jumper Exchange",
    description: "Cross-chain swaps via Li.Fi",
    url: "https://jumper.exchange/?fromChain=137&toChain=137",
    logo: "🌉",
    recommended: true,
    color: "blue",
  },
  {
    id: "1inch",
    name: "1inch",
    description: "DEX aggregator on Polygon",
    url: "https://app.1inch.io/#/137/simple/swap/MATIC/",
    logo: "🦄",
    recommended: false,
    color: "purple",
  },
  {
    id: "quickswap",
    name: "QuickSwap",
    description: "Native Polygon DEX",
    url: "https://quickswap.exchange/#/swap",
    logo: "⚡",
    recommended: false,
    color: "cyan",
  },
];

export default function SwapTab() {
  const { user, walletAddress, onchainBalance } = useApp();
  const [prices, setPrices] = useState({});
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);
  const [activeService, setActiveService] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const tokens = ["ZWAP", "BTC", "ETH", "POL", "SOL"];

  useEffect(() => {
    loadPrices();
    const interval = setInterval(loadPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadPrices = async () => {
    try { setPrices(await api.getPrices()); }
    catch (error) { console.error("Failed to load prices"); }
    finally { setIsLoadingPrices(false); }
  };

  const formatPrice = (p) => p >= 1000 ? p.toLocaleString(undefined, { maximumFractionDigits: 0 }) : p >= 1 ? p.toFixed(2) : p.toFixed(4);

  const openSwapService = (service) => {
    setIsLoading(true);
    setActiveService(service);
    // Give iframe time to load
    setTimeout(() => setIsLoading(false), 2000);
  };

  const closeSwapService = () => {
    setActiveService(null);
    setIsFullscreen(false);
    toast.success("Swap window closed");
  };

  // If a service is active, show embedded browser
  if (activeService) {
    return (
      <div className={`fixed inset-0 z-50 bg-[#0a0b1e] flex flex-col ${isFullscreen ? '' : 'p-4'}`}>
        {/* Header Bar */}
        <div className={`flex items-center justify-between bg-gray-900 border-b border-gray-700 ${isFullscreen ? 'px-4 py-2' : 'px-3 py-2 rounded-t-xl'}`}>
          <div className="flex items-center gap-2">
            <span className="text-xl">{activeService.logo}</span>
            <div>
              <p className="text-white font-semibold text-sm">{activeService.name}</p>
              <p className="text-gray-500 text-[10px]">External Service • Swaps processed externally</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={closeSwapService}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Loading Overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div 
              className="absolute inset-0 z-10 bg-[#0a0b1e] flex items-center justify-center"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center">
                <motion.div
                  className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <ArrowRightLeft className="w-8 h-8 text-blue-400" />
                </motion.div>
                <p className="text-white font-semibold">Loading {activeService.name}...</p>
                <p className="text-gray-400 text-sm mt-1">Connecting to external service</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Embedded Swap Service */}
        <div className={`flex-1 bg-white ${isFullscreen ? '' : 'rounded-b-xl overflow-hidden'}`}>
          <iframe
            src={activeService.url}
            title={activeService.name}
            className="w-full h-full border-0"
            allow="clipboard-write; clipboard-read"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
            onLoad={() => setIsLoading(false)}
          />
        </div>

        {/* Bottom Notice */}
        {!isFullscreen && (
          <div className="bg-gray-900 px-3 py-2 rounded-b-xl border-t border-gray-700 mt-1">
            <p className="text-[10px] text-gray-500 text-center">
              🔒 This swap is processed by {activeService.name}. ZWAP! does not control this transaction.
            </p>
          </div>
        )}
      </div>
    );
  }

  // Main swap tab view
  return (
    <div className="min-h-[calc(100dvh-140px)] bg-[#0a0b1e] flex flex-col px-4 py-4" data-testid="swap-tab">
      {/* Header */}
      <div className="text-center mb-4">
        <motion.div 
          className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-2"
          animate={{ 
            boxShadow: [
              "0 0 10px rgba(59,130,246,0.3)",
              "0 0 20px rgba(59,130,246,0.5)",
              "0 0 10px rgba(59,130,246,0.3)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ArrowRightLeft className="w-7 h-7 text-blue-400" />
        </motion.div>
        <h1 className="text-xl font-bold text-white">SWAP</h1>
        <p className="text-gray-400 text-xs">Swap your ZWAP!</p>
      </div>

      {/* Your Balances (Read-Only Display) */}
      <div className="glass-card p-4 mb-4 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span className="text-gray-400 text-xs">Your Reward Balances</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-gray-800/50">
            <p className="text-xs text-gray-500 mb-1">In-App Rewards</p>
            <p className="text-lg font-bold text-cyan-400">{user?.zwap_balance?.toFixed(2) || "0.00"} ZWAP</p>
          </div>
          <div className="p-3 rounded-lg bg-gray-800/50">
            <p className="text-xs text-gray-500 mb-1">Linked Wallet</p>
            <p className="text-lg font-bold text-cyan-400">{onchainBalance?.toFixed(2) || "—"} ZWAP</p>
          </div>
        </div>
      </div>

      {/* Live Prices */}
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

      {/* Swap Services */}
      <div className="flex-1">
        <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-blue-400" />
          Choose Swap Service
        </h3>
        <div className="space-y-3">
          {EXTERNAL_SWAP_SERVICES.map((service, i) => (
            <motion.button
              key={service.id}
              onClick={() => openSwapService(service)}
              className={`w-full p-4 rounded-xl border transition-all text-left ${
                service.recommended 
                  ? 'border-blue-500/50 bg-blue-500/10' 
                  : 'border-gray-700 bg-gray-800/30 hover:border-blue-500/30'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{service.logo}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold">{service.name}</p>
                    {service.recommended && (
                      <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full">Recommended</span>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs">{service.description}</p>
                </div>
                <ArrowRightLeft className="w-4 h-4 text-gray-500" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Info Notice */}
      <motion.div 
        className="mt-4 p-3 rounded-xl border border-gray-700 bg-gray-800/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-400">
            Swaps open in an embedded window within the app. Connect your wallet in the swap interface to complete transactions.
            All swaps are processed by third-party services.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
