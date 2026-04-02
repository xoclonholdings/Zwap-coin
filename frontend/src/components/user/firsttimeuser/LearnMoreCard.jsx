import React from "react";
import { motion } from "framer-motion";
import { BookOpen, User } from "lucide-react";

const SOFT_TRANSITION = { duration: 0.45, ease: "easeOut" };

export default function LearnMoreCard({ delay = 0 }) {
  return (
    <motion.div
      className="p-5 sm:p-6 rounded-[1.75rem] border border-purple-500/25 bg-white/[0.04] backdrop-blur-xl"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SOFT_TRANSITION, delay }}
      data-testid="wallet-learn-hint"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-2xl bg-purple-500/15 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-purple-400" />
        </div>

        <h2 className="text-lg sm:text-xl font-black text-white">
          Want to Learn More?
        </h2>
      </div>

      <p className="text-gray-300 text-sm sm:text-[15px] leading-relaxed mb-4">
        If you want more context before continuing, go through the Learn
        modules first. That way you are not guessing your way into Web3.
      </p>

      <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#0a0b1e] border border-gray-800">
        <div className="flex items-center gap-2 text-gray-500 text-xs flex-wrap">
          <span className="text-gray-600">Header:</span>
          <span className="text-cyan-400 font-bold text-sm">0.00</span>
          <span className="text-gray-600 text-[10px]">ZWAP</span>
          <span className="text-gray-700">|</span>
          <span className="text-purple-400 font-bold text-sm">0</span>
          <span className="text-gray-600 text-[10px]">zPts</span>
        </div>

        <motion.div
          className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-sm flex-shrink-0 relative"
          animate={{
            boxShadow: [
              "0 0 8px rgba(0,245,255,0.25)",
              "0 0 16px rgba(0,245,255,0.5)",
              "0 0 8px rgba(0,245,255,0.25)",
            ],
          }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <User className="w-4 h-4 text-white" />
          <span className="absolute -top-1 -right-1 px-1 py-0.5 bg-purple-500 text-[8px] text-white rounded font-bold">
            TAP
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}