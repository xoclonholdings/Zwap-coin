import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ChevronRight, ExternalLink } from "lucide-react";
import WalletIcon from "@/components/wallet/WalletIcon";

export default function WalletCreateView({
  walletOptions,
  onEmbeddedSetup,
  onOpenSetup,
}) {
  return (
    <div className="space-y-4 mt-4">
      <div>
        <p className="text-xs text-gray-400 mb-2 px-1">
          Create inside ZWAP
        </p>

        <motion.button
          onClick={onEmbeddedSetup}
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
              onClick={() => onOpenSetup(wallet.id)}
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
}