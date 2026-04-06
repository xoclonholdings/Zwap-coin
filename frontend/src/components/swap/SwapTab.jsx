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
  MATIC: {
    name: "Polygon",
    symbol: "MATIC",
    address: "0x0000000000000000000000000000000000001010",
    decimals: 18,
    color: "text-violet-400",
    category: "network",
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
    id: "swap-pol",
    name: "POL",
    description: "Move ZWAP value toward Polygon.",
    status: "active",
    fromToken: "ZWAP",
    toToken: "MATIC",
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

const ZPTS_CONVERSION_THRESHOLD = 1000;

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

function getProgressZone(zptsBalance) {
  const balance = Math.max(0, Number(zptsBalance || 0));

  if (balance >= ZPTS_CONVERSION_THRESHOLD) {
    return "Conversion Ready";
  }

  const ratio = balance / ZPTS_CONVERSION_THRESHOLD;

  if (ratio >= 0.95) return "Near Conversion";
  if (ratio >= 0.7) return "Approaching";
  if (ratio >= 0.3) return "Building";
  return "Starting";
}

export default function SwapTab() {
  const { user, walletAddress, refreshUser } = useApp();

  const [prices, setPrices] = useState({});
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);

  const [onchainBalance, setOnchainBalance] = useState(null);
  const [isLoadingOnchainBalance, setIsLoadingOnchainBalance] = useState(true);

  const [activeMode, setActiveMode] = useState("swap-pol");
  const [fromToken, setFromToken] = useState("ZWAP");
  const [toToken, setToToken] = useState("MATIC");
  const [fromAmount, setFromAmount] = useState("");

  const [activeService, setActiveService] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRouteLoading, setIsRouteLoading] = useState(false);

  const [feedback, setFeedback] = useState(null);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);

  const isPlus = user?.subscription_tier === "plus" || user?.tier === "plus";

  const internalZwapBalance = Number(user?.zwap_balance ?? 0);
  const walletZptsBalance = Number(user?.zpts_balance ?? 0);
  const swappableWalletZwapBalance = Number(onchainBalance ?? 0);

  const progressZone = useMemo(() => {
    return getProgressZone(walletZptsBalance);
  }, [walletZptsBalance]);

  const isConversionReady = walletZptsBalance >= ZPTS_CONVERSION_THRESHOLD;
  const hasWalletZwap = swappableWalletZwapBalance > 0;
  const hasInternalZwapToClaim = internalZwapBalance > 0;

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

  const loadOnchainBalance = useCallback(async () => {
    if (!walletAddress) {
      setOnchainBalance(null);
      setIsLoadingOnchainBalance(false);
      return;
    }

    try {
      setIsLoadingOnchainBalance(true);
      const data = await api.getOnchainBalance(walletAddress);

      const rawBalance =
        data?.onchain_balance ??
        data?.zwap_balance ??
        data?.balance ??
        data?.ZWAP ??
        0;

      setOnchainBalance(Number(rawBalance) || 0);
    } catch (error) {
      console.error("Failed to load on-chain balance", error);
      setOnchainBalance(0);
    } finally {
      setIsLoadingOnchainBalance(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    loadPrices();
    const interval = setInterval(loadPrices, 30000);
    return () => clearInterval(interval);
  }, [loadPrices]);

  useEffect(() => {
    loadOnchainBalance();
  }, [loadOnchainBalance]);

  useEffect(() => {
    const mode = SWAP_MODES.find((item) => item.id === activeMode);
    if (!mode) return;

    setFromToken(mode.fromToken);
    setToToken(mode.toToken);
    setFromAmount("");
  }, [activeMode]);

  const availableToConvert = useMemo(() => {
    if (fromToken === "ZWAP") return swappableWalletZwapBalance;
    return 0;
  }, [fromToken, swappableWalletZwapBalance]);

  const fromUsd = useMemo(() => {
    const amountNum = parseFloat(fromAmount || "0");
    if (!Number.isFinite(amountNum) || amountNum <= 0) return "0.00";
    if (!prices[fromToken]) return "0.00";

    return (amountNum * prices[fromToken]).toFixed(2);
  }, [fromAmount, fromToken, prices]);

  const estimatedOutput = useMemo(() => {
    const amt = parseFloat(fromAmount);
    if (!fromAmount || Number.isNaN(amt) || amt <= 0) return "—";
    if (!prices[fromToken] || !prices[toToken]) return "—";

    const fromValue = amt * prices[fromToken];
    const toAmt = fromValue / (prices[toToken] || 1);

    return formatAmount(toAmt, toToken === "USDC" ? 2 : 4);
  }, [fromAmount, fromToken, toToken, prices]);

  const rate = useMemo(() => {
    if (!prices[fromToken] || !prices[toToken]) return "—";
    return (prices[fromToken] / prices[toToken]).toFixed(4);
  }, [fromToken, toToken, prices]);

  const swapTokens = () => {
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
      setFromAmount(String(swappableWalletZwapBalance));
      return;
    }

    toast.message("Max is available for your wallet ZWAP balance.");
  };

  const refreshSwapData = useCallback(async () => {
    try {
      await loadPrices();

      if (typeof refreshUser === "function") {
        await refreshUser();
      }

      await loadOnchainBalance();

      setFeedback({
        type: "success",
        title: "Balances refreshed",
        message: "Your swap progress and balances are up to date.",
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
  }, [refreshUser, loadPrices, loadOnchainBalance]);

  const openEmbeddedSwapFlow = useCallback(() => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      toast.error("Enter an amount first");
      return;
    }

    if (fromToken === toToken) {
      toast.error("Select two different assets");
      return;
    }

    if (fromToken === "ZWAP" && !hasWalletZwap) {
      toast.error("Claim ZWAP to your wallet before swapping");
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

    window.setTimeout(() => {
      setIsRouteLoading(false);
    }, 1200);
  }, [fromAmount, fromToken, toToken, hasWalletZwap]);

  const executePrimaryAction = async () => {
    const amountNum = parseFloat(fromAmount);

    if (fromToken === "ZWAP" && !hasWalletZwap) {
      if (hasInternalZwapToClaim) {
        try {
          setFeedback({
            type: "pending",
            title: "Claiming ZWAP",
            message: "Sending your available ZWAP to your wallet...",
          });

          await api.claimZwap(walletAddress);

          if (typeof refreshUser === "function") {
            await refreshUser();
          }

          await loadOnchainBalance();

          setFeedback({
            type: "success",
            title: "ZWAP claimed",
            message: "Your ZWAP is now in your wallet and ready for swap.",
          });

          toast.success("ZWAP claimed to wallet");
          return;
        } catch (error) {
          console.error("ZWAP claim failed", error);

          setFeedback({
            type: "error",
            title: "Claim failed",
            message: "We could not claim ZWAP to your wallet right now.",
          });

          toast.error("Claim failed");
          return;
        }
      }

      toast.error("Claim ZWAP to your wallet before swapping");
      return;
    }

    if (!fromAmount || !Number.isFinite(amountNum) || amountNum <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    if (fromToken === toToken) {
      toast.error("Select two different assets");
      return;
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

  const openConvertModal = () => {
    setIsConvertModalOpen(true);
  };

  const closeConvertModal = () => {
    setIsConvertModalOpen(false);
  };

  const primaryActionLabel = useMemo(() => {
    if (fromToken === "ZWAP" && !hasWalletZwap) {
      return hasInternalZwapToClaim ? "Claim ZWAP" : "Claim to Wallet";
    }

    if (toToken === "MATIC") return "Continue to POL";
    if (toToken === "BTC") return "Continue to BTC";
    if (toToken === "ETH") return "Continue to ETH";
    if (toToken === "USDC") return "Continue to USDC";
    return "Continue";
  }, [fromToken, toToken, hasWalletZwap, hasInternalZwapToClaim]);

  return (
    <SwapHome
      user={user}
      isPlus={isPlus}
      isLoadingPrices={isLoadingPrices || isLoadingOnchainBalance}
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
      availableToConvert={availableToConvert}
      progressZone={progressZone}
      isConversionReady={isConversionReady}
      isConvertModalOpen={isConvertModalOpen}
      primaryActionLabel={primaryActionLabel}
      onSetFromAmount={setFromAmount}
      onSwapTokens={swapTokens}
      onSelectMode={handleSelectMode}
      onSetMax={handleSetMax}
      onRefresh={refreshSwapData}
      onPrimaryAction={executePrimaryAction}
      onOpenConvertModal={openConvertModal}
      onCloseConvertModal={closeConvertModal}
      onCloseFeedback={() => setFeedback(null)}
      onToggleFullscreen={() => setIsFullscreen((prev) => !prev)}
      onCloseSwapService={closeSwapService}
    />
  );
}