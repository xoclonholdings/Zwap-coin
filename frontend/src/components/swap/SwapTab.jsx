import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useApp } from "@/App";
import api from "@/lib/api";
import { toast } from "sonner";

import SwapHome from "@/components/swap/SwapHome";

/**
 * COMPLIANCE NOTE:
 * Swaps are processed by external third-party services embedded in an iframe
 * or opened in a new tab. ZWAP does not custody or control user transactions.
 * External services handle wallet connection and signing.
 */

// Official token logos
export const TOKEN_LOGOS = {
  ZWAP:
    "https://customer-assets.emergentagent.com/job_zwap-coin-mobile/artifacts/zbcxii5n_D53F824E-1DBA-4963-86D4-4D4E73400DE1.png",
  BTC: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
  ETH: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
  MATIC: "https://cryptologos.cc/logos/polygon-matic-logo.png",
  USDC: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
  USDT: "https://cryptologos.cc/logos/tether-usdt-logo.png",
  WETH: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
  WBTC: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
};

// Token configurations
export const TOKENS = {
  ZWAP: {
    name: "ZWAP!",
    symbol: "ZWAP",
    address: "0xe8898453af13b9496a6e8ada92c6efdaf4967a81",
    decimals: 18,
    color: "text-cyan-400",
    category: "reward",
  },
  zPTS: {
    name: "zPoints",
    symbol: "zPTS",
    address: null,
    decimals: 0,
    color: "text-violet-400",
    category: "internal",
  },
  BTC: {
    name: "Bitcoin",
    symbol: "BTC",
    // Under the hood this routes through Polygon WBTC
    address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
    decimals: 8,
    color: "text-orange-400",
    category: "wrapped-display",
  },
  ETH: {
    name: "Ethereum",
    symbol: "ETH",
    // Under the hood this routes through Polygon WETH
    address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
    decimals: 18,
    color: "text-indigo-300",
    category: "wrapped-display",
  },
  MATIC: {
    name: "Polygon",
    symbol: "MATIC",
    address: "0x0000000000000000000000000000000000001010",
    decimals: 18,
    color: "text-violet-400",
    category: "network",
  },
  USDC: {
    name: "USD Coin",
    symbol: "USDC",
    address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    decimals: 6,
    color: "text-blue-400",
    category: "stable",
  },
  USDT: {
    name: "Tether",
    symbol: "USDT",
    address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    decimals: 6,
    color: "text-green-400",
    category: "stable",
  },
};

export const SWAP_SERVICES = [
  {
    id: "quickswap",
    name: "QuickSwap",
    description: "Polygon route",
    baseUrl: "https://quickswap.exchange/#/swap",
    logo: "https://quickswap.exchange/logo_circle.png",
    fallbackLogo: "⚡",
    recommended: true,
    iframeSupported: true,
  },
  {
    id: "1inch",
    name: "1inch",
    description: "Aggregated route",
    baseUrl: "https://app.1inch.io/#/137/simple/swap/MATIC/",
    logo: "https://app.1inch.io/assets/images/logo.svg",
    fallbackLogo: "🦄",
    recommended: false,
    iframeSupported: false,
  },
  {
    id: "jumper",
    name: "Jumper",
    description: "Extended routing",
    baseUrl: "https://jumper.exchange/?fromChain=137&toChain=137",
    logo: "https://jumper.exchange/jumper-icon.svg",
    fallbackLogo: "🌉",
    recommended: false,
    iframeSupported: false,
  },
];

export const SWAP_MODES = [
  {
    id: "convert-zpts",
    name: "Convert zPts",
    description: "Turn points into ZWAP inside your reward flow.",
    status: "active",
    fromToken: "zPTS",
    toToken: "ZWAP",
  },
  {
    id: "swap-btc",
    name: "BTC",
    description: "Move ZWAP value toward Bitcoin.",
    status: "active",
    fromToken: "ZWAP",
    toToken: "BTC",
  },
  {
    id: "swap-eth",
    name: "ETH",
    description: "Move ZWAP value toward Ethereum.",
    status: "active",
    fromToken: "ZWAP",
    toToken: "ETH",
  },
  {
    id: "swap-usdc",
    name: "USDC",
    description: "Move ZWAP value toward stable balance.",
    status: "active",
    fromToken: "ZWAP",
    toToken: "USDC",
  },
];

const mapTokenToRouteAddress = (tokenKey) => {
  if (tokenKey === "BTC") return TOKENS.BTC.address;
  if (tokenKey === "ETH") return TOKENS.ETH.address;
  return TOKENS[tokenKey]?.address || "";
};

const oneInchTokenParam = (tokenKey) => {
  if (tokenKey === "MATIC") return "MATIC";
  return mapTokenToRouteAddress(tokenKey);
};

const quickswapTokenParam = (tokenKey) => {
  if (tokenKey === "MATIC") return "ETH";
  return mapTokenToRouteAddress(tokenKey);
};

const jumperTokenParam = (tokenKey) => {
  return mapTokenToRouteAddress(tokenKey);
};

const buildSwapUrl = (service, fromToken, toToken, amount) => {
  switch (service.id) {
    case "jumper": {
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
      const fromParam = oneInchTokenParam(fromToken);
      const toParam = oneInchTokenParam(toToken);
      const amt = amount ? String(amount) : "";

      return `https://app.1inch.io/#/137/simple/swap/${encodeURIComponent(
        fromParam
      )}/${encodeURIComponent(toParam)}${
        amt ? `?amount=${encodeURIComponent(amt)}` : ""
      }`;
    }

    case "quickswap": {
      const inputCurrency = quickswapTokenParam(fromToken);
      const outputCurrency = quickswapTokenParam(toToken);

      return `https://quickswap.exchange/#/swap?inputCurrency=${encodeURIComponent(
        inputCurrency
      )}&outputCurrency=${encodeURIComponent(outputCurrency)}`;
    }

    default:
      return service.baseUrl;
  }
};

const formatAmount = (value, digits = 6) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0";

  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
};

export default function SwapTab() {
  const { user, refreshUser } = useApp();

  const [prices, setPrices] = useState({});
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);

  const [activeMode, setActiveMode] = useState("convert-zpts");
  const [fromToken, setFromToken] = useState("zPTS");
  const [toToken, setToToken] = useState("ZWAP");
  const [fromAmount, setFromAmount] = useState("");

  const [activeService, setActiveService] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRouteLoading, setIsRouteLoading] = useState(false);

  const [externalSwapNotice, setExternalSwapNotice] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [history, setHistory] = useState([]);

  const isPlus = user?.subscription_tier === "plus" || user?.tier === "plus";

  const loadPrices = useCallback(async () => {
    try {
      const data = await api.getPrices();
      setPrices(data || {});
    } catch (error) {
      console.error("Failed to load prices", error);
    } finally {
      setIsLoadingPrices(false);
    }
  }, []);

  useEffect(() => {
    loadPrices();
    const interval = setInterval(loadPrices, 30000);
    return () => clearInterval(interval);
  }, [loadPrices]);

  useEffect(() => {
    const mode = SWAP_MODES.find((item) => item.id === activeMode);
    if (!mode) return;

    setFromToken(mode.fromToken);
    setToToken(mode.toToken);
    setFromAmount("");
  }, [activeMode]);

  const availableAssets = useMemo(() => {
    return ["ZWAP", "BTC", "ETH", "USDC"];
  }, []);

  const walletZwapBalance = Number(user?.zwap_balance ?? 0);
  const walletZptsBalance = Number(user?.zpts_balance ?? 0);

  const availableToConvert = useMemo(() => {
    if (fromToken === "ZWAP") return walletZwapBalance;
    if (fromToken === "zPTS") return walletZptsBalance;
    return 0;
  }, [fromToken, walletZwapBalance, walletZptsBalance]);

  const fromUsd = useMemo(() => {
    const amountNum = parseFloat(fromAmount || "0");
    if (!Number.isFinite(amountNum) || amountNum <= 0) return "0.00";
    if (!prices[fromToken]) return "0.00";

    return (amountNum * prices[fromToken]).toFixed(2);
  }, [fromAmount, fromToken, prices]);

  const estimatedOutput = useMemo(() => {
    const amt = parseFloat(fromAmount);
    if (!fromAmount || Number.isNaN(amt) || amt <= 0) return "—";

    if (fromToken === "zPTS" && toToken === "ZWAP") {
      return formatAmount(amt / 1000, 6);
    }

    if (!prices[fromToken] || !prices[toToken]) return "—";

    const fromValue = amt * prices[fromToken];
    const toAmt = fromValue / (prices[toToken] || 1);

    return formatAmount(toAmt, toToken === "USDC" || toToken === "USDT" ? 2 : 6);
  }, [fromAmount, fromToken, toToken, prices]);

  const rate = useMemo(() => {
    if (fromToken === "zPTS" && toToken === "ZWAP") {
      return "0.001000";
    }

    if (!prices[fromToken] || !prices[toToken]) return "—";

    return (prices[fromToken] / prices[toToken]).toFixed(6);
  }, [fromToken, toToken, prices]);

  const bestRouteLabel = useMemo(() => {
    if (fromToken === "zPTS" && toToken === "ZWAP") return "Internal conversion";
    if (toToken === "BTC") return "Bitcoin route ready";
    if (toToken === "ETH") return "Ethereum route ready";
    if (toToken === "USDC") return "Stable route ready";
    return "Best route ready";
  }, [fromToken, toToken]);

  const readyNowLabel = useMemo(() => {
    if (fromToken === "zPTS") return `${Math.floor(walletZptsBalance)} zPts`;
    return `${walletZwapBalance.toFixed(2)} ZWAP`;
  }, [fromToken, walletZptsBalance, walletZwapBalance]);

  const swapTokens = () => {
    if (fromToken === "zPTS" || toToken === "zPTS") {
      toast.message("zPts conversion follows a guided path.");
      return;
    }

    setFromToken(toToken);
    setToToken(fromToken);
  };

  const handleSelectMode = (modeId) => {
    const mode = SWAP_MODES.find((item) => item.id === modeId);
    if (!mode) return;

    if (mode.status === "locked") {
      toast.message("This route is locked for now.");
      return;
    }

    if (mode.status === "future") {
      toast.message("This route is coming soon.");
      return;
    }

    setActiveMode(modeId);
  };

  const handleSetMax = () => {
    if (fromToken === "ZWAP") {
      setFromAmount(String(walletZwapBalance));
      return;
    }

    if (fromToken === "zPTS") {
      setFromAmount(String(Math.floor(walletZptsBalance)));
      return;
    }

    toast.message("Max is currently available for reward balances.");
  };

  const refreshSwapData = useCallback(async () => {
    try {
      await loadPrices();

      if (typeof refreshUser === "function") {
        await refreshUser();
      }

      setFeedback({
        type: "success",
        title: "Balances refreshed",
        message: "Your swap and reward balances are now up to date.",
      });

      toast.success("Swap data refreshed");
    } catch (error) {
      setFeedback({
        type: "error",
        title: "Refresh failed",
        message: "We could not refresh your balances right now.",
      });

      toast.error("Failed to refresh");
    }
  }, [refreshUser, loadPrices]);

  const recordHistoryItem = useCallback((item) => {
    setHistory((prev) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: new Date().toISOString(),
        ...item,
      },
      ...prev,
    ]);
  }, []);

  const openSwapService = useCallback(
    (service) => {
      if (!fromAmount || parseFloat(fromAmount) <= 0) {
        toast.error("Enter an amount first");
        return;
      }

      if (fromToken === toToken) {
        toast.error("Select two different assets");
        return;
      }

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

        setFeedback({
          type: "route",
          title: "Route opened",
          message:
            "Your conversion path was opened in a secure external flow. Complete the confirmation, then return to refresh balances.",
        });

        recordHistoryItem({
          type: "route-opened",
          label: `${fromAmount} ${fromToken} → ${toToken}`,
          status: "External route opened",
        });

        toast.success("Conversion route opened");
        return;
      }

      setIsRouteLoading(true);
      setActiveService({ ...service, url });

      setFeedback({
        type: "pending",
        title: "Preparing route",
        message: `Opening ${fromAmount} ${fromToken} → ${toToken}`,
      });

      window.setTimeout(() => {
        setIsRouteLoading(false);
      }, 1500);
    },
    [fromAmount, fromToken, toToken, recordHistoryItem]
  );

  const executePrimaryAction = async () => {
    const amountNum = parseFloat(fromAmount);

    if (!fromAmount || !Number.isFinite(amountNum) || amountNum <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    if (fromToken === toToken) {
      toast.error("Select two different assets");
      return;
    }

    if (fromToken === "zPTS" && toToken === "ZWAP") {
      if (amountNum > walletZptsBalance) {
        toast.error("Not enough zPts available");
        return;
      }

      try {
        setFeedback({
          type: "pending",
          title: "Converting zPts",
          message: "Processing your reward conversion...",
        });

        await api.convertZpts();

        if (typeof refreshUser === "function") {
          await refreshUser();
        }

        const converted = amountNum / 1000;

        setFeedback({
          type: "success",
          title: "Conversion complete",
          message: `${formatAmount(amountNum, 0)} zPts converted into ${formatAmount(
            converted,
            6
          )} ZWAP.`,
        });

        recordHistoryItem({
          type: "conversion",
          label: `${formatAmount(amountNum, 0)} zPts → ${formatAmount(
            converted,
            6
          )} ZWAP`,
          status: "Completed",
        });

        setFromAmount("");
        toast.success("zPts converted to ZWAP");
        return;
      } catch (error) {
        console.error("zPts conversion failed", error);

        setFeedback({
          type: "error",
          title: "Conversion failed",
          message: "We could not complete your zPts conversion right now.",
        });

        toast.error("Conversion failed");
        return;
      }
    }

    const bestService =
      SWAP_SERVICES.find((service) => service.id === "quickswap") ||
      SWAP_SERVICES[0];

    openSwapService(bestService);
  };

  const closeSwapService = () => {
    setActiveService(null);
    setIsFullscreen(false);
    setIsRouteLoading(false);

    setFeedback({
      type: "info",
      title: "Route closed",
      message: "You can return to the utility flow whenever you're ready.",
    });

    toast.success("Swap window closed");
  };

  const primaryActionLabel = useMemo(() => {
    if (fromToken === "zPTS" && toToken === "ZWAP") return "Convert Now";
    if (toToken === "BTC") return "Continue to BTC";
    if (toToken === "ETH") return "Continue to ETH";
    if (toToken === "USDC") return "Continue to USDC";
    return "Continue Swap";
  }, [fromToken, toToken]);

  const portalData = useMemo(() => {
    return {
      supportedAssets: ["ZWAP", "BTC", "ETH", "USDC"],
      routeStatus: bestRouteLabel,
      infoLines: [
        "Choose a familiar asset path and let ZWAP prepare the route for you.",
        "Some routes may require wallet confirmation in a secure external flow.",
        "More advanced details stay behind the scenes so the experience stays simple.",
      ],
    };
  }, [bestRouteLabel]);

  return (
    <SwapHome
      user={user}
      isPlus={isPlus}
      prices={prices}
      isLoadingPrices={isLoadingPrices}
      tokens={TOKENS}
      tokenLogos={TOKEN_LOGOS}
      services={SWAP_SERVICES}
      modes={SWAP_MODES}
      availableAssets={availableAssets}
      activeMode={activeMode}
      fromToken={fromToken}
      toToken={toToken}
      fromAmount={fromAmount}
      fromUsd={fromUsd}
      estimatedOutput={estimatedOutput}
      rate={rate}
      activeService={activeService}
      isFullscreen={isFullscreen}
      isRouteLoading={isRouteLoading}
      externalSwapNotice={externalSwapNotice}
      feedback={feedback}
      history={history}
      availableToConvert={availableToConvert}
      readyNowLabel={readyNowLabel}
      bestRouteLabel={bestRouteLabel}
      primaryActionLabel={primaryActionLabel}
      portalData={portalData}
      onSetFromToken={setFromToken}
      onSetToToken={setToToken}
      onSetFromAmount={setFromAmount}
      onSwapTokens={swapTokens}
      onSelectMode={handleSelectMode}
      onSetMax={handleSetMax}
      onRefresh={refreshSwapData}
      onPrimaryAction={executePrimaryAction}
      onOpenRoute={openSwapService}
      onDismissExternalNotice={() => setExternalSwapNotice(null)}
      onCloseFeedback={() => setFeedback(null)}
      onToggleFullscreen={() => setIsFullscreen((prev) => !prev)}
      onCloseSwapService={closeSwapService}
    />
  );
}