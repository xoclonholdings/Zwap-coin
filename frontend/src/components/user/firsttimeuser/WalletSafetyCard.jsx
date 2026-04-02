import React from "react";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";

const SOFT_TRANSITION = { duration: 0.45, ease: "easeOut" };

export default function WalletSafetyCard({ delay = 0 }) {
  return (
    <motion.div
      className="p-5 sm:p-6 rounded-[1.75rem] border border-green-500/25 bg-white/[0.04] backdrop-blur-xl"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SOFT_TRANSITION, delay }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-2xl bg-green-500/15 flex items-center justify-center">
          <Shield className="w-5 h-5 text-green-400" />
        </div>

        <h2 className="text-lg sm:text-xl font-black text-white">
          Your Keys Stay Yours
        </h2>
      </div>

      <p className="text-gray-300 text-sm sm:text-[15px] leading-relaxed">
        ZWAP does not store, see, or ask for your private key. When you choose
        to connect a wallet, your keys stay with you. That means you stay in
        control.
      </p>
    </motion.div>
  );
}