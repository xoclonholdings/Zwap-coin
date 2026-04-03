import React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import WalletIcon from "@/components/wallet/WalletIcon";

export default function WalletConnectView({
  walletOptions,
  isConnecting,
  connectingWallet,
  onConnect,
}) {
  return (
    <div className="space-y-3 mt-4">
      {walletOptions.map((wallet) => (
        <motion.button
          key={wallet.id}
          onClick={() => onConnect(wallet.id)}
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
}