import React, { useState, useEffect } from "react";
import { useApp } from "@/App";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRightLeft,
  X,
  Info,
  Maximize2,
  Minimize2,
  ChevronDown,
  ArrowDown,
  RefreshCw,
} from "lucide-react";

/**
 * COMPLIANCE NOTE:
 * Swaps are processed by external third-party services embedded in an iframe.
 * This app does not process, custody, or control any transactions.
 * The embedded service handles all wallet connections and signing.
 */

// Official token logos
const TOKEN_LOGOS = {
  ZWAP: "https://customer-assets.emergentagent.com/job_zwap-coin-mobile/artifacts/zbcxii5n_D53F824E-1DBA-4963-86D4-4D4E73400DE1.png",
  MATIC: "https://cryptologos.cc/logos/polygon-matic-logo.png",
  USDC: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
  USDT: "https://cryptologos.cc/logos/tether-usdt-logo.png",
  WETH: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
  WBTC: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
};

// Token configurations with contract addresses on Polygon
// NOTE: For external swap UIs, use the ERC-20 contract on Polygon for wrapped assets (USDC/USDT/WETH/WBTC/ZWAP).
// For native MATIC, some UIs accept "MATIC" while others accept the special pseudo-address or "ETH" (Polygon style).
const TOKENS = {
  ZWAP: {
    name: "ZWAP!",
    symbol: "ZWAP",
    address: "0xe8898453af13b9496a6e8ada92c6efdaf4967a81",
    decimals: 18,
    color: "text-cyan-400",
  },
  MATIC: {
    name: "Polygon",
    symbol: "MATIC",
    // Native MATIC (pseudo address used in some contexts; we also handle symbol mapping per service)
    address: "0x0000000000000000000000000000000000001010",
    decimals: 18,
    color: "text-violet-400",
  },
  USDC: {
    name: "USD Coin",
    symbol: "USDC",
    address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    decimals: 6,
    color: "text-blue-400",
  },
  USDT: {
    name: "Tether",
    symbol: "USDT",
    address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    decimals: 6,
    color: "text-green-400",
  },
  WETH: {
    name: "Wrapped ETH",
    symbol: "WETH",
    address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
    decimals: 18,
    color: "text-purple-400",
  },
  WBTC: {
    name: "Wrapped BTC",
    symbol: "WBTC",
    address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
    decimals: 8,
    color: "text-orange-400",
  },
};

const TokenIcon = ({ token, size = "md" }) => {
  const sizeClasses = { sm: "w-7 h-7", md: "w-9 h-9", lg: "w-11 h-11" };
  const imgSizes = { sm: "w-5 h-5", md: "w-7 h-7", lg: "w-9 h-9" };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-800 flex items-center justify-center p-1`}
    >
      {TOKEN_LOGOS[token] ? (
        <img
          src={TOKEN_LOGOS[token]}
          alt={token}
          className={`${imgSizes[size]} object-contain`}
          onError={(e) => {
            e.currentTarget.style.display = "none";
            e.currentTarget.parentElement.innerHTML = `<span class="text-xs font-bold text-white">${token?.slice(
              0,
              2
            )}</span>`;
          }}
        />
      ) : (
        <span className="text-xs font-bold text-white">{token?.slice(0, 2)}</span>
      )}
    </div>
  );
};

// Service logo component with fallback
const ServiceLogo = ({ service, size = "md" }) => {
  const [useFallback, setUseFallback] = React.useState(false);
  const sizeClasses = { sm: "w-8 h-8", md: "w-10 h-10", lg: "w-12 h-12" };

  if (useFallback) {
    return <span className="text-2xl">{service.fallbackLogo}</span>;
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-xl overflow-hidden bg-gray-800 flex items-center justify-center`}
    >
      <img
        src={service.logo}
        alt={service.name}
        className="w-full h-full object-contain p-1.5"
        onError={() => setUseFallback(true)}
      />
    </div>
  );
};

// Helpers to handle each service's expectations for "native" MATIC on Polygon
const oneInchTokenParam = (tokenKey) => {
  if (tokenKey === "MATIC") return "MATIC";
  return TOKENS[tokenKey]?.address || "";
};

const quickswapTokenParam = (tokenKey) => {
  // QuickSwap historically uses "ETH" as the native token placeholder for Polygon
  if (tokenKey === "MATIC") return "ETH";
  return TOKENS[tokenKey]?.address || "";
};

const jumperTokenParam = (tokenKey) => {
  // Jumper supports Polygon tokens by address; for native MATIC it can accept "0x000...1010" or sometimes "MATIC".
  // We'll keep using the address (pseudo address) for consistency.
  return TOKENS[tokenKey]?.address || "";
};

// Build pre-filled URLs for each aggregator
const buildSwapUrl = (service, fromToken, toToken, amount) => {
  switch (service.id) {

  // NOTE: Keeping this for future potential uses; some services accept amount in base units,
  // but we're currently passing human amount to the service query string where supported.
  // const amountWei = amount ? (parseFloat(amount) * Math.pow(10, from?.decimals || 18)).toString() : "";

    case "jumper": {
      // Jumper Exchange URL format (Polygon -> Polygon)
      // Uses token addresses; amount is human-readable.
      const fromAddr = jumperTokenParam(fromToken);
      const toAddr = jumperTokenParam(toToken);
      const fromAmt = amount ? String(amount) : "";
      return `https://jumper.exchange/?fromChain=137&toChain=137&fromToken=${encodeURIComponent(
        fromAddr
      )}&toToken=${encodeURIComponent(toAddr)}${
        fromAmt ? `&fromAmount=${encodeURIComponent(fromAmt)}` : ""
      }`;
    }

    case "1inch": {
      // 1inch Polygon simple swap: /#/137/simple/swap/<from>/<to>?amount=...
      const fromParam = oneInchTokenParam(fromToken);
      const toParam = oneInchTokenParam(toToken);
      const amt = amount ? String(amount) : "";
      return `https://app.1inch.io/#/137/simple/swap/${encodeURIComponent(
        fromParam
      )}/${encodeURIComponent(toParam)}${amt ? `?amount=${encodeURIComponent(amt)}` : ""}`;
    }

    case "quickswap": {
      // QuickSwap swap: inputCurrency/outputCurrency
      const inputCurrency = quickswapTokenParam(fromToken);
      const outputCurrency = quickswapTokenParam(toToken);
      // QuickSwap doesn't reliably support prefilled amount via URL; we keep tokens prefilled.
      return `https://quickswap.exchange/#/swap?inputCurrency=${encodeURIComponent(
        inputCurrency
      )}&outputCurrency=${encodeURIComponent(outputCurrency)}`;
    }

    default:
      return service.baseUrl;
  }
};

// External swap services with official branding
const SWAP_SERVICES = [
  {
    id: "quickswap",
    name: "QuickSwap",
    description: "Native Polygon DEX",
    baseUrl: "https://quickswap.exchange/#/swap",
    logo: "https://quickswap.exchange/logo_circle.png",
    fallbackLogo: "⚡",
    recommended: true,
    iframeSupported: true,
  },
  {
    id: "1inch",
    name: "1inch",
    description: "Best rates via DEX aggregation",
    baseUrl: "https://app.1inch.io/#/137/simple/swap/MATIC/",
    logo: "https://app.1inch.io/assets/images/logo.svg",
    fallbackLogo: "🦄",
    recommended: false,
    iframeSupported: false,
  },
  {
    id: "jumper",
    name: "Jumper Exchange",
    description: "Cross-chain swaps via Li.Fi",
    baseUrl: "https://jumper.exchange/?fromChain=137&toChain=137",
    logo: "https://jumper.exchange/jumper-icon.svg",
    fallbackLogo: "🌉",
    recommended: false,
    iframeSupported: false,
  },
];
export default function SwapTab() {
  const { user } = useApp();
  const [prices, setPrices] = useState({});
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);

  // Swap form state
  const [fromToken, setFromToken] = useState("ZWAP");
  const [toToken, setToToken] = useState("USDC");
  const [fromAmount, setFromAmount] = useState("");
  const [showFromTokens, setShowFromTokens] = useState(false);
  const [showToTokens, setShowToTokens] = useState(false);

    // Embedded browser state
  const [activeService, setActiveService] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [externalSwapNotice, setExternalSwapNotice] = useState(null);
  
  useEffect(() => {
    loadPrices();
    const interval = setInterval(loadPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadPrices = async () => {
    try {
      setPrices(await api.getPrices());
    } catch (error) {
      console.error("Failed to load prices", error);
    } finally {
      setIsLoadingPrices(false);
    }
  };

  const swapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
  };

    const openSwapService = (service) => {
    const url = buildSwapUrl(service, fromToken, toToken, fromAmount);

    if (!service.iframeSupported) {
      window.open(url, "_blank", "noopener,noreferrer");
      setExternalSwapNotice({
        serviceName: service.name,
        fromToken,
        toToken,
        fromAmount,
        url,
      });
      toast.success(`${service.name} opened in a new tab`);
      return;
    }

    setIsLoading(true);
    setActiveService({ ...service, url });
    setTimeout(() => setIsLoading(false), 2000);
  };

  const closeSwapService = () => {
    setActiveService(null);
    setIsFullscreen(false);
    toast.success("Swap window closed");
  };

  // Estimate output (rough estimate based on prices)
  const estimatedOutput = () => {
    const amt = parseFloat(fromAmount);
    if (!fromAmount || Number.isNaN(amt) || amt <= 0) return "—";
    if (!prices[fromToken] || !prices[toToken]) return "—";

    const fromValue = amt * (prices[fromToken] || 0);
    const toAmt = fromValue / (prices[toToken] || 1);

    // Stablecoins show 2 decimals, else 6
    return toAmt.toFixed(toToken === "USDC" || toToken === "USDT" ? 2 : 6);
  };

  // Token selector dropdown
  const TokenSelector = ({ selected, onSelect, exclude, show, setShow }) => (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 rounded-xl px-3 py-2 transition-colors"
      >
        <TokenIcon token={selected} size="sm" />
        <span className="text-white font-semibold">{selected}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${
            show ? "rotate-180" : ""
          }`}
        />
      </button>

      {show && (
        <motion.div
          className="absolute z-20 mt-2 w-52 bg-gray-900 border border-gray-700 rounded-xl shadow-xl overflow-hidden"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {Object.entries(TOKENS)
            .filter(([key]) => key !== exclude)
            .map(([key, token]) => (
              <button
                type="button"
                key={key}
                onClick={() => {
                  onSelect(key);
                  setShow(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors ${
                  selected === key ? "bg-gray-800" : ""
                }`}
              >
                <TokenIcon token={key} size="sm" />
                <div className="text-left">
                  <p className="text-white font-medium">{key}</p>
                  <p className="text-gray-500 text-xs">{token.name}</p>
                </div>
              </button>
            ))}
        </motion.div>
      )}
    </div>
  );

  // If an iframe-supported service is active, show embedded browser
  if (activeService) {
    return (
      <div
        className={`fixed inset-0 z-50 bg-[#0a0b1e] flex flex-col ${
          isFullscreen ? "" : "p-4"
        }`}
      >
        {/* Header Bar */}
        <div
          className={`flex items-center justify-between bg-gray-900 border-b border-gray-700 ${
            isFullscreen ? "px-4 py-2" : "px-3 py-2 rounded-t-xl"
          }`}
        >
          <div className="flex items-center gap-2">
            <ServiceLogo service={activeService} size="sm" />
            <div>
              <p className="text-white font-semibold text-sm">{activeService.name}</p>
              <p className="text-gray-500 text-[10px]">
                External Service • Pre-filled with your swap details
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-gray-400 hover:text-white"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
            <button
              type="button"
              onClick={closeSwapService}
              className="p-2 text-gray-400 hover:text-red-400"
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
                <p className="text-gray-400 text-sm mt-1">
                  Pre-filling: {fromAmount || "0"} {fromToken} → {toToken}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Embedded Swap Service */}
        <div className={`flex-1 bg-white ${isFullscreen ? "" : "rounded-b-xl overflow-hidden"}`}>
          <iframe
            src={activeService.url}
            title={activeService.name}
            className="w-full h-full border-0"
            allow="clipboard-write; clipboard-read"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
            onLoad={() => setIsLoading(false)}
          />
        </div>

        {!isFullscreen && (
          <div className="bg-gray-900 px-3 py-2 rounded-b-xl border-t border-gray-700 mt-1">
            <p className="text-[10px] text-gray-500 text-center">
              🔒 Connect your wallet in {activeService.name} to complete the swap
            </p>
          </div>
        )}
      </div>
    );
  }

  // Main swap tab view with form
  const fromUsd =
    fromAmount && prices[fromToken]
      ? (parseFloat(fromAmount || "0") * prices[fromToken]).toFixed(2)
      : "0.00";

  const rate =
    prices[fromToken] && prices[toToken]
      ? (prices[fromToken] / prices[toToken]).toFixed(6)
      : "—";

  return (
    <div
      className="min-h-[calc(100dvh-140px)] bg-[#0a0b1e] flex flex-col px-4 py-4"
      data-testid="swap-tab"
    >
      {/* Header */}
      <div className="text-center mb-4">
        <motion.div
          className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-2"
          animate={{
            boxShadow: [
              "0 0 10px rgba(59,130,246,0.3)",
              "0 0 20px rgba(59,130,246,0.5)",
              "0 0 10px rgba(59,130,246,0.3)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ArrowRightLeft className="w-6 h-6 text-blue-400" />
        </motion.div>
        <h1 className="text-xl font-bold text-white">SWAP</h1>
        <p className="text-gray-400 text-xs">Swap your ZWAP!</p>
      </div>

      {/* Swap Form */}
      <div className="glass-card p-4 mb-4 rounded-xl border border-gray-700">
        {/* From Token */}
        <div className="mb-2">
          <label className="text-xs text-gray-500 mb-1 block">You Pay</label>
          <div className="flex items-center gap-3 bg-gray-800/50 rounded-xl p-3">
            <TokenSelector
              selected={fromToken}
              onSelect={setFromToken}
              exclude={toToken}
              show={showFromTokens}
              setShow={setShowFromTokens}
            />
            <Input
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="flex-1 bg-transparent border-0 text-right text-xl text-white font-mono focus-visible:ring-0"
            />
          </div>
          <div className="flex justify-between mt-1 px-1">
            <span className="text-xs text-gray-500">≈ ${fromUsd}</span>
            <button
              type="button"
              onClick={() => {
                if (fromToken === "ZWAP") {
                  setFromAmount(user?.zwap_balance?.toString() || "0");
                } else {
                  toast.message("Max is only wired for ZWAP balance right now.");
                }
              }}
              className="text-xs text-cyan-400 hover:text-cyan-300"
            >
              Max: {fromToken === "ZWAP" ? user?.zwap_balance?.toFixed(2) || "0" : "—"}
            </button>
          </div>
        </div>

        {/* Swap Direction Button */}
        <div className="flex justify-center -my-1 relative z-10">
          <motion.button
            type="button"
            onClick={swapTokens}
            className="w-10 h-10 rounded-full bg-gray-700 border-4 border-[#0a0b1e] flex items-center justify-center hover:bg-gray-600 transition-colors"
            whileHover={{ rotate: 180 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowDown className="w-5 h-5 text-cyan-400" />
          </motion.button>
        </div>

        {/* To Token */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">You Receive (estimate)</label>
          <div className="flex items-center gap-3 bg-gray-800/50 rounded-xl p-3">
            <TokenSelector
              selected={toToken}
              onSelect={setToToken}
              exclude={fromToken}
              show={showToTokens}
              setShow={setShowToTokens}
            />
            <div className="flex-1 text-right">
              <p className="text-xl text-white font-mono">{estimatedOutput()}</p>
            </div>
          </div>
          <div className="flex justify-between mt-1 px-1">
            <span className="text-xs text-gray-500">≈ ${fromUsd}</span>
            <span className="text-xs text-gray-500">
              Rate: 1 {fromToken} ≈ {rate} {toToken}
            </span>
          </div>
        </div>
      </div>
      
            {externalSwapNotice && (
        <div className="mb-4 space-y-2">
          <div className="p-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-white font-semibold text-sm">
                  {externalSwapNotice.serviceName} opened in a new tab
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Complete your swap there, then return here and refresh your wallet balance.
                </p>
                <p className="text-cyan-400 text-xs mt-2">
                  {externalSwapNotice.fromAmount || "0"} {externalSwapNotice.fromToken} →{" "}
                  {externalSwapNotice.toToken}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setExternalSwapNotice(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="border-gray-700 text-white"
              onClick={async () => {
                try {
                  await loadPrices();
                  toast.success("Swap data refreshed");
                } catch {
                  toast.error("Failed to refresh");
                }
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="text-gray-300"
              onClick={() => {
                if (externalSwapNotice?.url) {
                  window.open(externalSwapNotice.url, "_blank", "noopener,noreferrer");
                }
              }}
            >
              Open Again
            </Button>
          </div>
        </div>
      )}
      
            <div className="mb-4">
        <Button
          type="button"
          onClick={() => openSwapService(SWAP_SERVICES[0])}
          disabled={!fromAmount || parseFloat(fromAmount) <= 0}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white h-12 rounded-xl"
        >
          <ArrowRightLeft className="w-4 h-4 mr-2" />
          Swap Now
        </Button>
      </div>

      {/* Swap Services */}
      <div className="flex-1">
        <h3 className="text-white font-semibold text-sm mb-3">Choose Exchange</h3>
        <div className="space-y-2">
          {SWAP_SERVICES.map((service, i) => (
            <motion.button
              type="button"
              key={service.id}
              onClick={() => openSwapService(service)}
              disabled={!fromAmount || parseFloat(fromAmount) <= 0}
              className={`w-full p-3 rounded-xl border transition-all text-left ${
                service.recommended
                  ? "border-blue-500/50 bg-blue-500/10"
                  : "border-gray-700 bg-gray-800/30 hover:border-blue-500/30"
              } ${
                !fromAmount || parseFloat(fromAmount) <= 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: fromAmount ? 1.02 : 1 }}
              whileTap={{ scale: fromAmount ? 0.98 : 1 }}
            >
              <div className="flex items-center gap-3">
                <ServiceLogo service={service} size="md" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold text-sm">{service.name}</p>
                    {service.recommended && (
                      <span className="text-[9px] bg-blue-500 text-white px-1.5 py-0.5 rounded-full">
                        Best
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs">{service.description}</p>
                </div>
                <ArrowRightLeft className="w-4 h-4 text-gray-500" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Info Notice */}
      <motion.div
        className="mt-3 p-3 rounded-xl border border-gray-700 bg-gray-800/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-gray-400">
            Your swap details will be <span className="text-cyan-400">pre-filled</span> in the exchange.
            Just connect your wallet there to complete the swap.
          </p>
        </div>
      </motion.div>
    </div>
  );
}