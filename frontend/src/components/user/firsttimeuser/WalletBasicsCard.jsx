import React from "react";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";
import { walletModule } from "@/data/education";

const SOFT_TRANSITION = { duration: 0.45, ease: "easeOut" };

export default function WalletBasicsCard({ delay = 0 }) {
  return (
    <motion.div
      className="p-5 sm:p-6 rounded-[1.75rem] border border-blue-500/25 bg-white/[0.04] backdrop-blur-xl"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SOFT_TRANSITION, delay }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-2xl bg-blue-500/15 flex items-center justify-center">
          <Wallet className="w-5 h-5 text-blue-400" />
        </div>

        <h2 className="text-lg sm:text-xl font-black text-white">
          What Is a Crypto Wallet?
        </h2>
      </div>

      <p className="text-gray-300 text-sm sm:text-[15px] leading-relaxed">
        {walletModule.core}
      </p>

      <div className="mt-4 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
        <p className="text-blue-300 text-sm italic leading-relaxed">
          "{walletModule.analogy}"
        </p>
      </div>
    </motion.div>
  );
}