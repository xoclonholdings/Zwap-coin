import React, { useState } from "react";
import { useApp } from "@/App";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet, HelpCircle, Loader2 } from "lucide-react";

// Wallet icons (using colored divs as placeholders)
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

  const handleConnect = async (walletType) => {
    setIsConnecting(true);
    setConnectingWallet(walletType);
    
    try {
      let address = null;
      
      if (walletType === "metamask") {
        // Check if MetaMask is installed
        if (typeof window.ethereum !== "undefined" && window.ethereum.isMetaMask) {
          const accounts = await window.ethereum.request({ 
            method: "eth_requestAccounts" 
          });
          address = accounts[0];
        } else {
          // Generate demo address for testing
          address = "0x" + Array(40).fill(0).map(() => 
            Math.floor(Math.random() * 16).toString(16)
          ).join("");
        }
      } else if (walletType === "trust") {
        // Trust Wallet - similar pattern
        if (typeof window.trustwallet !== "undefined") {
          const accounts = await window.trustwallet.request({ 
            method: "eth_requestAccounts" 
          });
          address = accounts[0];
        } else {
          address = "0x" + Array(40).fill(0).map(() => 
            Math.floor(Math.random() * 16).toString(16)
          ).join("");
        }
      } else if (walletType === "speed") {
        // Speed Wallet - demo mode
        address = "0x" + Array(40).fill(0).map(() => 
          Math.floor(Math.random() * 16).toString(16)
        ).join("");
      }
      
      if (address) {
        await connectWallet(address);
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
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
    },
    {
      id: "trust",
      name: "Trust Wallet",
      color: "#3375BB",
      icon: "🛡️",
    },
    {
      id: "speed",
      name: "Speed Wallet",
      color: "#00D632",
      icon: "⚡",
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
            You'll need a wallet to continue. Let's get you connected or help you set one up.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 mt-4">
          {wallets.map((wallet) => (
            <Button
              key={wallet.id}
              data-testid={`wallet-${wallet.id}`}
              onClick={() => handleConnect(wallet.id)}
              disabled={isConnecting}
              className="w-full wallet-btn h-14 flex items-center justify-start gap-4 bg-[#141530] hover:bg-[#1a1b40] text-white"
              variant="ghost"
            >
              <WalletIcon color={wallet.color}>{wallet.icon}</WalletIcon>
              <span className="font-medium">{wallet.name}</span>
              {isConnecting && connectingWallet === wallet.id && (
                <Loader2 className="w-5 h-5 ml-auto animate-spin text-cyan-400" />
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
                <div className="font-medium">Help me create a wallet</div>
                <div className="text-xs text-gray-500">For beginners</div>
              </div>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
