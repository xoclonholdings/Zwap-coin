import React, { useMemo, useState } from "react";
import { useLogin } from "@privy-io/react-auth";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/App";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Wallet, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { WALLET_CONFIG } from "@/components/wallet/walletConfig";
import WalletRootView from "@/components/wallet/WalletRootView";
import WalletCreateView from "@/components/wallet/WalletCreateView";
import WalletConnectView from "@/components/wallet/WalletConnectView";

export default function WalletModal({ open, onOpenChange }) {
  const navigate = useNavigate();
  const { connectWallet, completeEmailAuth } = useApp();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState(null);
  const [mode, setMode] = useState("root"); // root | create | connect

  const close = () => {
    setMode("root");
    onOpenChange(false);
  };

  const { login } = useLogin({
    onComplete: (user, isNewUser) => {
      const emailAddress =
        user?.email?.address ||
        user?.google?.email ||
        user?.apple?.email ||
        "";

      const embeddedWallet =
        user?.wallet?.address ||
        user?.linkedAccounts?.find(
          (account) =>
            account?.type === "wallet" ||
            account?.type === "smart_wallet" ||
            account?.type === "embedded_wallet"
        )?.address ||
        null;

      completeEmailAuth({
        id: user?.id || `privy_${Date.now()}`,
        email: emailAddress,
        walletAddress: embeddedWallet,
        authProvider: "privy",
        privyUserId: user?.id || null,
      });

      toast.success(
        isNewUser
          ? "Wallet created in ZWAP!"
          : "Signed in to your wallet."
      );

      close();
      navigate("/dashboard");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to open wallet setup.");
    },
  });

  const switchToPolygon = async (provider) => {
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x89" }],
      });
    } catch (switchError) {
      if (switchError?.code === 4902) {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x89",
              chainName: "Polygon Mainnet",
              nativeCurrency: {
                name: "MATIC",
                symbol: "MATIC",
                decimals: 18,
              },
              rpcUrls: ["https://polygon-rpc.com"],
              blockExplorerUrls: ["https://polygonscan.com"],
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  };

  const getProvider = (walletId) => {
    if (typeof window === "undefined") return null;

    if (walletId === "trust") {
      return window.trustwallet || window.ethereum || null;
    }

    if (walletId === "coinbase") {
      return window.ethereum || window.coinbaseWalletExtension || null;
    }

    return window.ethereum || null;
  };

  const connectInjectedWallet = async (walletId) => {
    const config = WALLET_CONFIG[walletId];
    const installed = config.checkInstalled?.();

    if (!installed) {
      toast.error(`${config.name} is not available on this device right now.`);
      return;
    }

    const provider = getProvider(walletId);
    if (!provider?.request) {
      toast.error(`Could not access ${config.name}.`);
      return;
    }

    setIsConnecting(true);
    setConnectingWallet(walletId);

    try {
      const accounts = await provider.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || !accounts.length) {
        throw new Error("No wallet account returned.");
      }

      await switchToPolygon(provider);
      await connectWallet(accounts[0]);

      toast.success(
        `Connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`
      );
      close();
      navigate("/dashboard");
    } catch (error) {
      console.error(`${config.name} connection error:`, error);
      toast.error(error?.message || `Failed to connect ${config.name}`);
    } finally {
      setIsConnecting(false);
      setConnectingWallet(null);
    }
  };

  const walletOptions = useMemo(
    () => [
      {
        id: "metamask",
        name: "MetaMask",
        color: WALLET_CONFIG.metamask.color,
        icon: WALLET_CONFIG.metamask.icon,
        installed: WALLET_CONFIG.metamask.checkInstalled(),
      },
      {
        id: "coinbase",
        name: "Coinbase Wallet",
        color: WALLET_CONFIG.coinbase.color,
        icon: WALLET_CONFIG.coinbase.icon,
        installed: WALLET_CONFIG.coinbase.checkInstalled(),
      },
      {
        id: "trust",
        name: "Trust Wallet",
        color: WALLET_CONFIG.trust.color,
        icon: WALLET_CONFIG.trust.icon,
        installed: WALLET_CONFIG.trust.checkInstalled(),
      },
    ],
    [open]
  );

  const openSetup = (walletId) => {
    const url = WALLET_CONFIG[walletId]?.setupUrl;
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleEmbeddedWalletSetup = () => {
    login();
  };

  const title =
    mode === "create"
      ? "Create a Wallet"
      : mode === "connect"
        ? "Connect Existing Wallet"
        : "Set Up Wallet";

  const description =
    mode === "create"
      ? "Start with in-app setup first, or use another wallet app."
      : mode === "connect"
        ? "Choose a wallet you already use."
        : "Create a new wallet or connect one you already have.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#0f1029] border-cyan-500/30">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {mode !== "root" && (
              <button
                type="button"
                onClick={() => setMode("root")}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            <DialogTitle className="text-2xl text-white flex items-center gap-2">
              <Wallet className="w-6 h-6 text-cyan-400" />
              {title}
            </DialogTitle>
          </div>

          <DialogDescription className="text-gray-400">
            {description}
          </DialogDescription>
        </DialogHeader>

        {mode === "root" && (
          <WalletRootView
            onCreate={() => setMode("create")}
            onConnect={() => setMode("connect")}
          />
        )}

        {mode === "create" && (
          <WalletCreateView
            walletOptions={walletOptions}
            onEmbeddedSetup={handleEmbeddedWalletSetup}
            onOpenSetup={openSetup}
          />
        )}

        {mode === "connect" && (
          <WalletConnectView
            walletOptions={walletOptions}
            isConnecting={isConnecting}
            connectingWallet={connectingWallet}
            onConnect={connectInjectedWallet}
          />
        )}

        <div className="text-center pt-1">
          <p className="text-xs text-gray-500">
            🔷 Using <span className="text-purple-400">Polygon Network</span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}