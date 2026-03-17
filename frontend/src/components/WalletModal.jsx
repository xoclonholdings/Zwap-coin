import React, { useState } from "react";
import { useApp } from "@/App";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Wallet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const WALLET_CONFIG = {
  metamask: {
    name: "MetaMask",
    color: "#F6851B",
    icon: "🦊",
    checkInstalled: () =>
      typeof window !== "undefined" && !!window.ethereum?.isMetaMask,
  },
  trust: {
    name: "Trust Wallet",
    color: "#3375BB",
    icon: "🛡️",
    checkInstalled: () =>
      typeof window !== "undefined" &&
      (!!window.trustwallet || !!window.ethereum?.isTrust),
  },
  coinbase: {
    name: "Coinbase Wallet",
    color: "#1652F0",
    icon: "🔵",
    checkInstalled: () =>
      typeof window !== "undefined" &&
      (!!window.ethereum?.isCoinbaseWallet || !!window.coinbaseWalletExtension),
  },
};

const WalletIcon = ({ color, children }) => (
  <div
    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
    style={{ background: `${color}20` }}
  >
    {children}
  </div>
);

export default function WalletModal({ open, onOpenChange }) {
  const { connectWallet } = useApp();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState(null);

  const close = () => onOpenChange(false);

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
    } catch (error) {
      console.error(`${config.name} connection error:`, error);
      toast.error(error?.message || `Failed to connect ${config.name}`);
    } finally {
      setIsConnecting(false);
      setConnectingWallet(null);
    }
  };

  const walletOptions = [
    {
      id: "metamask",
      name: "MetaMask",
      subtitle: WALLET_CONFIG.metamask.checkInstalled()
        ? "Tap to connect"
        : "Not detected right now",
      color: WALLET_CONFIG.metamask.color,
      icon: WALLET_CONFIG.metamask.icon,
      installed: WALLET_CONFIG.metamask.checkInstalled(),
    },
    {
      id: "trust",
      name: "Trust Wallet",
      subtitle: WALLET_CONFIG.trust.checkInstalled()
        ? "Tap to connect"
        : "Not detected right now",
      color: WALLET_CONFIG.trust.color,
      icon: WALLET_CONFIG.trust.icon,
      installed: WALLET_CONFIG.trust.checkInstalled(),
    },
    {
      id: "coinbase",
      name: "Coinbase Wallet",
      subtitle: WALLET_CONFIG.coinbase.checkInstalled()
        ? "Tap to connect"
        : "Not detected right now",
      color: WALLET_CONFIG.coinbase.color,
      icon: WALLET_CONFIG.coinbase.icon,
      installed: WALLET_CONFIG.coinbase.checkInstalled(),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#0f1029] border-cyan-500/30">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-cyan-400" />
            Connect your wallet
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose a wallet you already use.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {walletOptions.map((wallet) => (
            <motion.button
              key={wallet.id}
              onClick={() => connectInjectedWallet(wallet.id)}
              disabled={!wallet.installed || isConnecting}
              className={`w-full h-16 flex items-center gap-4 px-4 rounded-xl transition-colors ${
                wallet.installed
                  ? "bg-[#141530] hover:bg-[#1a1b40]"
                  : "bg-[#141530]/40 opacity-50 cursor-not-allowed"
              }`}
              whileHover={wallet.installed ? { scale: 1.01 } : {}}
              whileTap={wallet.installed ? { scale: 0.99 } : {}}
            >
              <WalletIcon color={wallet.color}>{wallet.icon}</WalletIcon>

              <div className="flex-1 text-left">
                <div className="font-medium text-white flex items-center gap-2">
                  {wallet.name}
                  {wallet.installed && (
                    <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                      Available
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">{wallet.subtitle}</div>
              </div>

              {isConnecting && connectingWallet === wallet.id ? (
                <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
              ) : null}
            </motion.button>
          ))}
        </div>

        <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-3 mt-4">
          <p className="text-xs text-cyan-100">
            This screen is for people who already have a wallet. If your wallet
            is not showing as available, go back and use the simpler setup path.
          </p>
        </div>

        <div className="text-center pt-1">
          <p className="text-xs text-gray-500">
            🔷 Connecting to <span className="text-purple-400">Polygon Network</span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}