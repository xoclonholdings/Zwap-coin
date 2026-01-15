import React, { useState, useEffect } from "react";
import { useApp } from "@/App";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet, HelpCircle, Loader2, X, Maximize2, Minimize2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// Wallet providers configuration
const WALLET_PROVIDERS = [
  {
    id: "metamask",
    name: "MetaMask",
    color: "#F6851B",
    icon: "🦊",
    description: "Popular browser & mobile wallet",
    // Deep link / Universal link
    mobileUrl: "https://metamask.app.link/dapp/",
    webUrl: "https://metamask.io/download/",
    checkInstalled: () => typeof window !== 'undefined' && window.ethereum?.isMetaMask,
  },
  {
    id: "trust",
    name: "Trust Wallet",
    color: "#3375BB",
    icon: "🛡️",
    description: "Secure mobile wallet",
    mobileUrl: "https://link.trustwallet.com/open_url?coin_id=966&url=",
    webUrl: "https://trustwallet.com/download",
    checkInstalled: () => typeof window !== 'undefined' && (window.trustwallet || window.ethereum?.isTrust),
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    color: "#3B99FC",
    icon: "🔗",
    description: "Connect any mobile wallet",
    // WalletConnect web interface
    connectUrl: "https://walletconnect.com/",
  },
];

// Wallet icon component
const WalletIcon = ({ color, children }) => (
  <div 
    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
    style={{ background: color + "20" }}
  >
    {children}
  </div>
);

export default function WalletModal({ open, onOpenChange }) {
  const { connectWallet } = useApp();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState(null);
  const [embeddedUrl, setEmbeddedUrl] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Check if running on mobile
  const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const handleConnect = async (wallet) => {
    setIsConnecting(true);
    setConnectingWallet(wallet.id);
    
    try {
      // Check if wallet is installed (browser extension)
      if (wallet.checkInstalled && wallet.checkInstalled()) {
        // Direct connection via injected provider
        const provider = wallet.id === 'trust' 
          ? (window.trustwallet || window.ethereum)
          : window.ethereum;
          
        try {
          const accounts = await provider.request({ method: "eth_requestAccounts" });
          if (accounts && accounts.length > 0) {
            // Switch to Polygon
            try {
              await provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x89' }],
              });
            } catch (switchError) {
              if (switchError.code === 4902) {
                await provider.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainId: '0x89',
                    chainName: 'Polygon Mainnet',
                    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
                    rpcUrls: ['https://polygon-rpc.com'],
                    blockExplorerUrls: ['https://polygonscan.com'],
                  }],
                });
              }
            }
            
            await connectWallet(accounts[0]);
            toast.success(`Connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
            onOpenChange(false);
            setIsConnecting(false);
            return;
          }
        } catch (err) {
          console.error("Direct connection error:", err);
        }
      }
      
      // If not installed or direct connection failed, open embedded/external
      if (wallet.id === "walletconnect") {
        // Open WalletConnect in embedded view
        setEmbeddedUrl("https://walletconnect.com/");
      } else if (isMobile && wallet.mobileUrl) {
        // On mobile, use deep link
        const currentUrl = encodeURIComponent(window.location.href);
        window.location.href = wallet.mobileUrl + currentUrl;
      } else {
        // On desktop without extension, show download page in embedded
        setEmbeddedUrl(wallet.webUrl);
      }
      
    } catch (error) {
      console.error("Wallet connection error:", error);
      toast.error("Connection failed. Please try again.");
    }
    
    setIsConnecting(false);
    setConnectingWallet(null);
  };

  const closeEmbedded = () => {
    setEmbeddedUrl(null);
    setIsFullscreen(false);
  };

  // If embedded view is active
  if (embeddedUrl) {
    return (
      <div className={`fixed inset-0 z-50 bg-[#0a0b1e] flex flex-col ${isFullscreen ? '' : 'p-4'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between bg-gray-900 border-b border-gray-700 ${isFullscreen ? 'px-4 py-2' : 'px-3 py-2 rounded-t-xl'}`}>
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-cyan-400" />
            <div>
              <p className="text-white font-semibold text-sm">Connect Wallet</p>
              <p className="text-gray-500 text-[10px]">Sign in or download wallet</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 text-gray-400 hover:text-white">
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button onClick={closeEmbedded} className="p-2 text-gray-400 hover:text-red-400">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Embedded Content */}
        <div className={`flex-1 bg-white ${isFullscreen ? '' : 'rounded-b-xl overflow-hidden'}`}>
          <iframe
            src={embeddedUrl}
            title="Wallet Connection"
            className="w-full h-full border-0"
            allow="clipboard-write; clipboard-read"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
          />
        </div>

        {/* Bottom Notice */}
        {!isFullscreen && (
          <div className="bg-gray-900 px-3 py-2 rounded-b-xl border-t border-gray-700 mt-1">
            <p className="text-[10px] text-gray-500 text-center">
              After connecting in your wallet app, return here to continue
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#0f1029] border-cyan-500/30">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-cyan-400" />
            Connect Wallet
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Connect your wallet to save progress and earn rewards on Polygon.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 mt-4">
          {WALLET_PROVIDERS.map((wallet) => {
            const isInstalled = wallet.checkInstalled?.();
            
            return (
              <motion.button
                key={wallet.id}
                data-testid={`wallet-${wallet.id}`}
                onClick={() => handleConnect(wallet)}
                disabled={isConnecting}
                className="w-full h-16 flex items-center gap-4 px-4 bg-[#141530] hover:bg-[#1a1b40] rounded-xl transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <WalletIcon color={wallet.color}>{wallet.icon}</WalletIcon>
                <div className="flex-1 text-left">
                  <div className="font-medium text-white flex items-center gap-2">
                    {wallet.name}
                    {isInstalled && (
                      <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                        Installed
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">{wallet.description}</div>
                </div>
                {isConnecting && connectingWallet === wallet.id && (
                  <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                )}
              </motion.button>
            );
          })}
          
          {/* Help option */}
          <div className="border-t border-gray-800 pt-4 mt-4">
            <button
              onClick={() => setEmbeddedUrl("https://metamask.io/download/")}
              className="w-full h-14 flex items-center gap-4 px-4 bg-[#141530]/50 hover:bg-[#1a1b40] rounded-xl text-gray-400 hover:text-white transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-700/50 flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-medium">I need a wallet</div>
                <div className="text-xs text-gray-500">Get started with MetaMask</div>
              </div>
            </button>
          </div>

          {/* Network Info */}
          <div className="text-center pt-2">
            <p className="text-xs text-gray-500">
              🔷 Connecting to <span className="text-purple-400">Polygon Network</span>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
