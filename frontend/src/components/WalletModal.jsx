import React, { useState } from "react";
import { useApp } from "@/App";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Wallet, HelpCircle, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

// Simple beginner-first wallet setup
const WALLET_CONFIG = {
  metamask: {
    name: "MetaMask",
    color: "#F6851B",
    icon: "🦊",
    installUrl: "https://metamask.io/download/",
    mobileUrl: "https://metamask.app.link/dapp/",
    checkInstalled: () =>
      typeof window !== "undefined" && !!window.ethereum?.isMetaMask,
  },
  trust: {
    name: "Trust Wallet",
    color: "#3375BB",
    icon: "🛡️",
    installUrl: "https://trustwallet.com/download",
    mobileUrl: "https://link.trustwallet.com/open_url?coin_id=966&url=",
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

  const isMobile =
    typeof window !== "undefined" &&
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const isMetaMaskInstalled = WALLET_CONFIG.metamask.checkInstalled();

  const close = () => onOpenChange(false);

  const connectMetaMask = async () => {
    if (!window?.ethereum?.request) {
      window.open(WALLET_CONFIG.metamask.installUrl, "_blank", "noopener,noreferrer");
      return;
    }

    setIsConnecting(true);

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || !accounts.length) {
        throw new Error("No wallet account returned.");
      }

      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x89" }],
        });
      } catch (switchError) {
        if (switchError?.code === 4902) {
          await window.ethereum.request({
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

      await connectWallet(accounts[0]);
      toast.success(
        `Connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`
      );
      close();
    } catch (error) {
      console.error("MetaMask connection error:", error);
      toast.error(error?.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const openMetaMaskInstall = () => {
    window.open(WALLET_CONFIG.metamask.installUrl, "_blank", "noopener,noreferrer");
  };

  const openTrustWallet = () => {
    if (isMobile) {
      const currentUrl = encodeURIComponent(window.location.href);
      window.location.href = `${WALLET_CONFIG.trust.mobileUrl}${currentUrl}`;
      return;
    }

    window.open(WALLET_CONFIG.trust.installUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#0f1029] border-cyan-500/30">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-cyan-400" />
            Connect Wallet
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            The easiest option for most people is MetaMask on Polygon.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          <motion.button
            data-testid="wallet-metamask"
            onClick={connectMetaMask}
            disabled={isConnecting}
            className="w-full h-16 flex items-center gap-4 px-4 bg-[#141530] hover:bg-[#1a1b40] rounded-xl transition-colors border border-cyan-500/20"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <WalletIcon color={WALLET_CONFIG.metamask.color}>
              {WALLET_CONFIG.metamask.icon}
            </WalletIcon>

            <div className="flex-1 text-left">
              <div className="font-medium text-white flex items-center gap-2">
                {isMetaMaskInstalled ? "Connect MetaMask" : "Install MetaMask"}
                {isMetaMaskInstalled && (
                  <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                    Installed
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {isMetaMaskInstalled
                  ? "Recommended for desktop users"
                  : "Best place to start if you’re new"}
              </div>
            </div>

            {isConnecting ? (
              <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
            ) : !isMetaMaskInstalled ? (
              <ExternalLink className="w-4 h-4 text-gray-500" />
            ) : null}
          </motion.button>

          <motion.button
            data-testid="wallet-trust"
            onClick={openTrustWallet}
            disabled={isConnecting}
            className="w-full h-16 flex items-center gap-4 px-4 bg-[#141530]/70 hover:bg-[#1a1b40] rounded-xl transition-colors"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <WalletIcon color={WALLET_CONFIG.trust.color}>
              {WALLET_CONFIG.trust.icon}
            </WalletIcon>

            <div className="flex-1 text-left">
              <div className="font-medium text-white">
                {isMobile ? "Open Trust Wallet" : "Get Trust Wallet"}
              </div>
              <div className="text-xs text-gray-500">
                {isMobile
                  ? "Use your mobile wallet app"
                  : "Alternative mobile-first wallet"}
              </div>
            </div>

            <ExternalLink className="w-4 h-4 text-gray-500" />
          </motion.button>

          <div className="border-t border-gray-800 pt-4 mt-4">
            <button
              onClick={openMetaMaskInstall}
              className="w-full h-14 flex items-center gap-4 px-4 bg-[#141530]/50 hover:bg-[#1a1b40] rounded-xl text-gray-300 hover:text-white transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-700/50 flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-medium">I need a wallet</div>
                <div className="text-xs text-gray-500">
                  Start with MetaMask for the simplest setup
                </div>
              </div>
            </button>
          </div>

          <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-3">
            <p className="text-xs text-cyan-100">
              New here? <span className="font-semibold">MetaMask</span> is the easiest
              choice for desktop. After installing it, come back and click{" "}
              <span className="font-semibold">Connect MetaMask</span>.
            </p>
          </div>

          <div className="text-center pt-1">
            <p className="text-xs text-gray-500">
              🔷 Connecting to <span className="text-purple-400">Polygon Network</span>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}