import React, { useMemo, useState } from "react";
import { useApp } from "@/App";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Wallet,
  Loader2,
  ChevronRight,
  PlusCircle,
  Link2,
  ArrowLeft,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const WALLET_CONFIG = {
  metamask: {
    name: "MetaMask",
    color: "#F6851B",
    icon: "🦊",
    setupUrl: "https://metamask.io/download/",
    checkInstalled: () =>
      typeof window !== "undefined" && !!window.ethereum?.isMetaMask,
  },
  coinbase: {
    name: "Coinbase Wallet",
    color: "#1652F0",
    icon: "🔵",
    setupUrl: "https://www.coinbase.com/wallet/downloads",
    checkInstalled: () =>
      typeof window !== "undefined" &&
      (!!window.ethereum?.isCoinbaseWallet || !!window.coinbaseWalletExtension),
  },
  trust: {
    name: "Trust Wallet",
    color: "#3375BB",
    icon: "🛡️",
    setupUrl: "https://trustwallet.com/download",
    checkInstalled: () =>
      typeof window !== "undefined" &&
      (!!window.trustwallet || !!window.ethereum?.isTrust),
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
  const [mode, setMode] = useState("root"); // root | create | connect

  const close = () => {
    setMode("root");
    onOpenChange(false);
  };

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
    toast.info("In-app wallet setup coming next.");
  };

  const renderRoot = () => (
    <div className="space-y-3 mt-4">
      <motion.button
        onClick={() => setMode("create")}
        className="w-full rounded-2xl border border-cyan-500/30 bg-[#141530] hover:bg-[#1a1b40] p-4 text-left transition-colors"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/15 flex items-center justify-center">
            <PlusCircle className="w-6 h-6 text-cyan-400" />
          </div>

          <div className="flex-1">
            <p className="text-white font-semibold">Create New Wallet</p>
            <p className="text-xs text-gray-400 mt-1">
              Start fresh with in-app setup or another wallet app.
            </p>
          </div>

          <ChevronRight className="w-5 h-5 text-cyan-400" />
        </div>
      </motion.button>

      <motion.button
        onClick={() => setMode("connect")}
        className="w-full rounded-2xl border border-purple-500/30 bg-[#141530] hover:bg-[#1a1b40] p-4 text-left transition-colors"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/15 flex items-center justify-center">
            <Link2 className="w-6 h-6 text-purple-400" />
          </div>

          <div className="flex-1">
            <p className="text-white font-semibold">Connect Existing Wallet</p>
            <p className="text-xs text-gray-400 mt-1">
              Already have one? Connect it and use it with ZWAP!
            </p>
          </div>

          <ChevronRight className="w-5 h-5 text-purple-400" />
        </div>
      </motion.button>

      <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-3 mt-4">
        <p className="text-xs text-cyan-100 leading-relaxed">
          You can skip wallet setup for now. Your offline activity and progress
          can still be saved and synced later.
        </p>
      </div>
    </div>
  );

  const renderCreate = () => (
    <div className="space-y-4 mt-4">
      <div>
        <p className="text-xs text-gray-400 mb-2 px-1">
          Create inside ZWAP
        </p>

        <motion.button
          onClick={handleEmbeddedWalletSetup}
          className="w-full h-16 flex items-center gap-4 px-4 rounded-xl bg-[#141530] hover:bg-[#1a1b40] transition-colors border border-cyan-500/30"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="w-12 h-12 rounded-xl bg-cyan-500/15 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-cyan-300" />
          </div>

          <div className="flex-1 text-left">
            <div className="font-medium text-white">
              Create Wallet in App
            </div>
            <div className="text-xs text-gray-500">
              Fast setup without leaving ZWAP
            </div>
          </div>

          <ChevronRight className="w-5 h-5 text-gray-400" />
        </motion.button>
      </div>

      <div className="border-t border-white/10 my-2" />

      <div>
        <p className="text-xs text-gray-400 mb-2 px-1">
          Use a wallet app
        </p>

        <div className="space-y-3">
          {walletOptions.map((wallet) => (
            <motion.button
              key={wallet.id}
              onClick={() => openSetup(wallet.id)}
              className="w-full h-16 flex items-center gap-4 px-4 rounded-xl bg-[#141530] hover:bg-[#1a1b40] transition-colors"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <WalletIcon color={wallet.color}>{wallet.icon}</WalletIcon>

              <div className="flex-1 text-left">
                <div className="font-medium text-white">
                  {wallet.name}
                </div>
                <div className="text-xs text-gray-500">
                  Opens setup. Return here after creating your wallet.
                </div>
              </div>

              <ExternalLink className="w-4 h-4 text-gray-400" />
            </motion.button>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-3 mt-2">
        <p className="text-xs text-cyan-100 leading-relaxed">
          External wallet apps may open outside ZWAP. Once finished, come back and choose{" "}
          <span className="text-white font-medium">
            Connect Existing Wallet
          </span>.
        </p>
      </div>
    </div>
  );

  const renderConnect = () => (
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
            <div className="text-xs text-gray-500">
              {wallet.installed ? "Tap to connect" : "Not detected right now"}
            </div>
          </div>

          {isConnecting && connectingWallet === wallet.id ? (
            <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
          ) : null}
        </motion.button>
      ))}

      <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-3 mt-4">
        <p className="text-xs text-cyan-100 leading-relaxed">
          This option is for wallets already set up on your device.
        </p>
      </div>
    </div>
  );

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

        {mode === "root" && renderRoot()}
        {mode === "create" && renderCreate()}
        {mode === "connect" && renderConnect()}

        <div className="text-center pt-1">
          <p className="text-xs text-gray-500">
            🔷 Using <span className="text-purple-400">Polygon Network</span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}