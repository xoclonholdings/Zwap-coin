import React, { useState, useEffect } from "react";
import { useApp, api, CRYPTO_LOGOS, ZWAP_BANG } from "@/App";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowRightLeft, ExternalLink, RefreshCw, Info, AlertTriangle, Shield } from "lucide-react";

/**
 * COMPLIANCE NOTE:
 * This tab does NOT process any swaps internally.
 * All swap functionality redirects to external third-party services.
 * The app only displays prices and provides links - no transactions occur here.
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
    name: "Jumper Exchange",
    description: "Cross-chain swaps via Li.Fi",
    url: "https://jumper.exchange/",
    logo: "🌉",
    recommended: true,
  },
  {
    name: "1inch",
    description: "DEX aggregator on Polygon",
    url: "https://app.1inch.io/#/137/simple/swap/MATIC/",
    logo: "🦄",
    recommended: false,
  },
  {
    name: "Uniswap",
    description: "Popular decentralized exchange",
    url: "https://app.uniswap.org/swap",
    logo: "🦊",
    recommended: false,
  },
];

export default function SwapTab() {
  const { user, walletAddress, onchainBalance } = useApp();
  const [prices, setPrices] = useState({});
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

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

  const handleExternalSwap = (service) => {
    setSelectedService(service);
    setShowDisclaimer(true);
  };

  const confirmExternalRedirect = () => {
    if (selectedService) {
      window.open(selectedService.url, '_blank', 'noopener,noreferrer');
      toast.success(`Opening ${selectedService.name}...`);
    }
    setShowDisclaimer(false);
    setSelectedService(null);
  };

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
        <p className="text-gray-400 text-xs">External Exchange Portal</p>
      </div>

      {/* Compliance Notice */}
      <motion.div 
        className="glass-card p-3 mb-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-300">
            Swaps are processed by <span className="text-yellow-400">external third-party services</span>. 
            This app does not process, custody, or control any transactions.
          </p>
        </div>
      </motion.div>

      {/* Your Balances (Read-Only Display) */}
      <div className="glass-card p-4 mb-4 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span className="text-gray-400 text-xs">Your Reward Balances (Read-Only)</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-gray-800/50">
            <p className="text-xs text-gray-500 mb-1">In-App Rewards</p>
            <p className="text-lg font-bold text-cyan-400">{user?.zwap_balance?.toFixed(2) || "0.00"} ZWAP</p>
            <p className="text-[10px] text-gray-500">Earned from activities</p>
          </div>
          <div className="p-3 rounded-lg bg-gray-800/50">
            <p className="text-xs text-gray-500 mb-1">Linked Wallet</p>
            <p className="text-lg font-bold text-cyan-400">{onchainBalance?.toFixed(2) || "—"} ZWAP</p>
            <p className="text-[10px] text-gray-500">On-chain balance</p>
          </div>
        </div>
      </div>

      {/* Live Prices (Information Only) */}
      <div className="glass-card p-3 mb-4 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-400 text-xs">Live Market Prices</span>
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

      {/* External Swap Services */}
      <div className="flex-1">
        <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
          <ExternalLink className="w-4 h-4 text-blue-400" />
          External Swap Services
        </h3>
        <div className="space-y-3">
          {EXTERNAL_SWAP_SERVICES.map((service, i) => (
            <motion.button
              key={service.name}
              onClick={() => handleExternalSwap(service)}
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
                <ExternalLink className="w-4 h-4 text-gray-500" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Disclaimer Footer */}
      <div className="mt-4 p-3 rounded-lg bg-gray-800/30 border border-gray-700">
        <p className="text-[10px] text-gray-500 text-center">
          ⚠️ External services have their own terms. ZWAP! does not control or guarantee third-party transactions.
          Cryptocurrency values fluctuate. Only swap what you can afford to risk.
        </p>
      </div>

      {/* Confirmation Dialog */}
      {showDisclaimer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <motion.div 
            className="bg-[#0f1029] border border-blue-500/30 rounded-2xl p-6 max-w-sm w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Leaving ZWAP! App</h3>
              <p className="text-gray-400 text-sm">
                You're about to open <span className="text-blue-400">{selectedService?.name}</span>, an external third-party service.
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
              <p className="text-xs text-gray-400">
                • Transactions occur outside this app<br/>
                • We do not control external services<br/>
                • Review all details before confirming<br/>
                • Connect your wallet on the external site
              </p>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => { setShowDisclaimer(false); setSelectedService(null); }}
                className="flex-1 border-gray-600"
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmExternalRedirect}
                className="flex-1 bg-blue-500 hover:bg-blue-600"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Continue
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
