import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useApp } from "@/App";
import api from "@/lib/api";
import { toast } from "sonner";

import SwapHome from "@/components/swap/SwapHome";

// Official token logos
export const TOKEN_LOGOS = {
  ZWAP:
    "https://customer-assets.emergentagent.com/job_zwap-coin-mobile/artifacts/zbcxii5n_D53F824E-1DBA-4963-86D4-4D4E73400DE1.png",
  BTC: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
  ETH: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
  MATIC: "https://cryptologos.cc/logos/polygon-matic-logo.png",
  USDC: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
  USDT: "https://cryptologos.cc/logos/tether-usdt-logo.png",
};

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
    address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
    decimals: 8,
    color: "text-orange-400",
    category: "wrapped-display",
  },
  ETH: {
    name: "Ethereum",
    symbol: "ETH",
    address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
    decimals: 18,
    color: "text-indigo-300",
    category: "wrapped-display",
  },
  USDC: {
    name: "USD Coin",
    symbol: "USDC",
    address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    decimals: 6,
    color: "text-blue-400",
    category: "stable",
  },
};

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

export const SWAP_PROVIDER = {
  id: "embedded-swap",
  name: "ZWAP Swap Flow",
  description: "Embedded conversion flow",
  iframeSupported: true,
};

const mapTokenToRouteAddress = (tokenKey) => {
  return TOKENS[tokenKey]?.address || "";
};

const buildEmbeddedSwapUrl = ({ fromToken, toToken, amount }) => {
  const fromAddress = mapTokenToRouteAddress(fromToken);
  const toAddress = mapTokenToRouteAddress(toToken);
  const fromAmount = amount ? String(amount) : "";

  return `https://jumper.exchange/?fromChain=137&toChain=137&fromToken=${encodeURIComponent(
    fromAddress
  )}&toToken=${encodeURIComponent(toAddress)}${
    fromAmount ? `&fromAmount=${encodeURIComponent(fromAmount)}` : ""
  }`;
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

  const [feedback, setFeedback] = useState(null);
  const [history, setHistory] = useState([]);

  const isPlus = user?.subscription_tier === "plus" || user?.tier === "plus";

  const loadPrices = useCallback(async () => {
    try {
      const data = await api.getPrices();

      const normalizedPrices = {
        ...(data || {}),
        BTC: data?.BTC ?? data?.WBTC ?? null,
        ETH: data?.ETH ?? data?.WETH ?? null,
      };

      setPrices(normalizedPrices);
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

    return formatAmount(toAmt, toToken === "USDC" ? 2 : 6);
  }, [fromAmount, fromToken, toToken, prices]);

  const rate = useMemo(() => {
    if (fromToken === "zPTS" && toToken === "ZWAP") {
      return "0.001000";
    }

    if (!prices[fromToken] || !prices[toToken]) return "—";

    return (prices[fromToken] / prices[toToken]).toFixed(6);
  }, [fromToken, toToken, prices]);

  const bestRouteLabel = useMemo(() => {
    if (fromToken === "zPTS" && toToken === "ZWAP") return "Direct conversion";
    if (toToken === "BTC") return "Bitcoin path selected";
    if (toToken === "ETH") return "Ethereum path selected";
    if (toToken === "USDC") return "Stable path selected";
    return "Swap path selected";
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

  const openEmbeddedSwapFlow = useCallback(() => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      toast.error("Enter an amount first");
      return;
    }

    if (fromToken === toToken) {
      toast.error("Select two different assets");
      return;
    }

    const url = buildEmbeddedSwapUrl({
      fromToken,
      toToken,
      amount: fromAmount,
    });

    setIsRouteLoading(true);
    setActiveService({
      ...SWAP_PROVIDER,
      url,
    });

    setFeedback({
      type: "pending",
      title: "Preparing swap flow",
      message: `Opening ${fromAmount} ${fromToken} → ${toToken}`,
    });

    recordHistoryItem({
      type: "route-opened",
      label: `${fromAmount} ${fromToken} → ${toToken}`,
      status: "Opened in app",
    });

    window.setTimeout(() => {
      setIsRouteLoading(false);
    }, 1200);
  }, [fromAmount, fromToken, toToken, recordHistoryItem]);

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

    openEmbeddedSwapFlow();
  };

  const closeSwapService = () => {
    setActiveService(null);
    setIsFullscreen(false);
    setIsRouteLoading(false);

    setFeedback({
      type: "info",
      title: "Swap flow closed",
      message: "You are back in the app.",
    });

    toast.success("Returned to ZWAP");
  };

  const primaryActionLabel = useMemo(() => {
    if (fromToken === "zPTS" && toToken === "ZWAP") return "Convert Now";
    if (toToken === "BTC") return "Continue to BTC";
    if (toToken === "ETH") return "Continue to ETH";
    if (toToken === "USDC") return "Continue to USDC";
    return "Continue";
  }, [fromToken, toToken]);

  return (
    <SwapHome
      user={user}
      isPlus={isPlus}
      isLoadingPrices={isLoadingPrices}
      tokens={TOKENS}
      tokenLogos={TOKEN_LOGOS}
      modes={SWAP_MODES}
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
      feedback={feedback}
      history={history}
      availableToConvert={availableToConvert}
      readyNowLabel={readyNowLabel}
      bestRouteLabel={bestRouteLabel}
      primaryActionLabel={primaryActionLabel}
      onSetFromAmount={setFromAmount}
      onSwapTokens={swapTokens}
      onSelectMode={handleSelectMode}
      onSetMax={handleSetMax}
      onRefresh={refreshSwapData}
      onPrimaryAction={executePrimaryAction}
      onCloseFeedback={() => setFeedback(null)}
      onToggleFullscreen={() => setIsFullscreen((prev) => !prev)}
      onCloseSwapService={closeSwapService}
    />
  );
}