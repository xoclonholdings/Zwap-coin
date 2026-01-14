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
import { Wallet, HelpCircle, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

// Wallet icons
const WalletIcon = ({ color, children }) => (
  <div 
    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
    style={{ background: color }}
  >
    {children}
  </div>
);

export default function WalletModal({ open, onOpenChange }) {
  const { connectWallet } = useApp();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState(null);
  const [error, setError] = useState(null);
  const [hasMetaMask, setHasMetaMask] = useState(false);
  const [hasTrustWallet, setHasTrustWallet] = useState(false);

  // Check for installed wallets on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasMetaMask(typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask);
      setHasTrustWallet(typeof window.trustwallet !== 'undefined' || 
        (typeof window.ethereum !== 'undefined' && window.ethereum.isTrust));
    }
  }, [open]);

  const handleConnect = async (walletType) => {
    setIsConnecting(true);
    setConnectingWallet(walletType);
    setError(null);
    
    try {
      let address = null;
      
      if (walletType === "metamask") {
        if (typeof window.ethereum !== "undefined") {
          try {
            // Request account access
            const accounts = await window.ethereum.request({ 
              method: "eth_requestAccounts" 
            });
            
            if (accounts && accounts.length > 0) {
              address = accounts[0];
              
              // Switch to Polygon network
              try {
                await window.ethereum.request({
                  method: 'wallet_switchEthereumChain',
                  params: [{ chainId: '0x89' }], // Polygon chainId
                });
              } catch (switchError) {
                // If Polygon not added, add it
                if (switchError.code === 4902) {
                  await window.ethereum.request({
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
            }
          } catch (err) {
            if (err.code === 4001) {
              setError("Connection rejected. Please approve the connection in MetaMask.");
            } else {
              setError("Failed to connect to MetaMask. Please try again.");
            }
            console.error("MetaMask error:", err);
          }
        } else {
          setError("MetaMask not detected. Please install MetaMask extension.");
          window.open("https://metamask.io/download/", "_blank");
        }
      } 
      
      else if (walletType === "trust") {
        // Check for Trust Wallet
        const trustProvider = window.trustwallet || 
          (window.ethereum?.isTrust ? window.ethereum : null);
        
        if (trustProvider) {
          try {
            const accounts = await trustProvider.request({ 
              method: "eth_requestAccounts" 
            });
            if (accounts && accounts.length > 0) {
              address = accounts[0];
            }
          } catch (err) {
            if (err.code === 4001) {
              setError("Connection rejected. Please approve in Trust Wallet.");
            } else {
              setError("Failed to connect to Trust Wallet.");
            }
          }
        } else {
          setError("Trust Wallet not detected. Please open this app in Trust Wallet browser.");
          // Deep link to Trust Wallet
          const dappUrl = encodeURIComponent(window.location.href);
          window.location.href = `https://link.trustwallet.com/open_url?coin_id=60&url=${dappUrl}`;
        }
      }
      
      else if (walletType === "walletconnect") {
        // For WalletConnect, we'll use a QR code modal approach
        try {
          // Dynamic import to avoid SSR issues
          const { createWeb3Modal } = await import('@web3modal/wagmi/react');
          // Open the Web3Modal
          // For now, show instructions
          setError("WalletConnect: Scan QR code with your mobile wallet app.");
          toast.info("Opening WalletConnect...");
          
          // Fallback: Open WalletConnect directly
          window.open("https://walletconnect.com/", "_blank");
        } catch (err) {
          setError("WalletConnect setup needed. Please use MetaMask or Trust Wallet.");
        }
      }
      
      // If we got an address, connect
      if (address) {
        await connectWallet(address);
        toast.success(`Connected: ${address.slice(0, 6)}...${address.slice(-4)}`);
        onOpenChange(false);
      }
      
    } catch (error) {
      console.error("Wallet connection error:", error);
      setError("Connection failed. Please try again.");
    } finally {
      setIsConnecting(false);
      setConnectingWallet(null);
    }
  };

  const wallets = [
    {
      id: "metamask",
      name: "MetaMask",
      color: "#F6851B",
      icon: "🦊",
      installed: hasMetaMask,
      description: hasMetaMask ? "Detected" : "Popular browser wallet",
    },
    {
      id: "trust",
      name: "Trust Wallet",
      color: "#3375BB",
      icon: "🛡️",
      installed: hasTrustWallet,
      description: hasTrustWallet ? "Detected" : "Mobile wallet",
    },
    {
      id: "walletconnect",
      name: "WalletConnect",
      color: "#3B99FC",
      icon: "🔗",
      installed: true,
      description: "Connect any wallet via QR",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#0f1029] border-cyan-500/30">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-cyan-400" />
            Connect Wallet
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Connect your wallet to save progress and earn rewards on Polygon network.
          </DialogDescription>
        </DialogHeader>

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
        
        <div className="space-y-3 mt-4">
          {wallets.map((wallet) => (
            <Button
              key={wallet.id}
              data-testid={`wallet-${wallet.id}`}
              onClick={() => handleConnect(wallet.id)}
              disabled={isConnecting}
              className="w-full wallet-btn h-16 flex items-center justify-start gap-4 bg-[#141530] hover:bg-[#1a1b40] text-white"
              variant="ghost"
            >
              <WalletIcon color={wallet.color}>{wallet.icon}</WalletIcon>
              <div className="flex-1 text-left">
                <div className="font-medium flex items-center gap-2">
                  {wallet.name}
                  {wallet.installed && wallet.id !== "walletconnect" && (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  )}
                </div>
                <div className="text-xs text-gray-500">{wallet.description}</div>
              </div>
              {isConnecting && connectingWallet === wallet.id && (
                <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
              )}
            </Button>
          ))}
          
          <div className="border-t border-gray-800 pt-4 mt-4">
            <Button
              data-testid="wallet-help"
              onClick={() => window.open("https://metamask.io/download/", "_blank")}
              className="w-full wallet-btn h-14 flex items-center justify-start gap-4 bg-[#141530]/50 hover:bg-[#1a1b40] text-gray-400 hover:text-white"
              variant="ghost"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-700/50 flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-medium">I need a wallet</div>
                <div className="text-xs text-gray-500">Get MetaMask (free)</div>
              </div>
            </Button>
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
