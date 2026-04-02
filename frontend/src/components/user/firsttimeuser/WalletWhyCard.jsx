import React from "react";
import { motion } from "framer-motion";
import { KeyRound, ChevronRight } from "lucide-react";

const SOFT_TRANSITION = { duration: 0.45, ease: "easeOut" };

export default function WalletWhyCard({ delay = 0 }) {
  return (
    <motion.div
      className="p-5 sm:p-6 rounded-[1.75rem] border border-cyan-500/25 bg-white/[0.04] backdrop-blur-xl"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SOFT_TRANSITION, delay }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 flex items-center justify-center">
          <KeyRound className="w-5 h-5 text-cyan-400" />
        </div>

        <h2 className="text-lg sm:text-xl font-black text-white">
          Why You Need One
        </h2>
      </div>

      <ul className="space-y-3 text-gray-300 text-sm sm:text-[15px] leading-relaxed">
        <li className="flex items-start gap-2">
          <ChevronRight className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
          <span>
            A wallet gives you a portable identity inside ZWAP when you are ready
            to save, claim, swap, or own rewards directly.
          </span>
        </li>

        <li className="flex items-start gap-2">
          <ChevronRight className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
          <span>
            It connects your rewards and activity to you, so they can follow
            you across sessions and devices.
          </span>
        </li>

        <li className="flex items-start gap-2">
          <ChevronRight className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
          <span>
            You do not need to force the wallet step too early. You can explore
            first, then connect when it becomes useful.
          </span>
        </li>
      </ul>
    </motion.div>
  );
}