import React from "react";
import { motion } from "framer-motion";
import { ZWAP_LOGO } from "@/App";

const SOFT_TRANSITION = { duration: 0.45, ease: "easeOut" };

export default function FirstTimeHero() {
  return (
    <div className="text-center mb-7">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SOFT_TRANSITION}
      >
        <img
          src={ZWAP_LOGO}
          alt="ZWAP!"
          className="h-20 sm:h-24 mx-auto mb-3 drop-shadow-[0_0_22px_rgba(0,245,255,0.35)]"
        />
      </motion.div>

      {/* Hero Content */}
      <motion.div
        className="rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_0_60px_rgba(0,0,0,0.35)] px-5 py-7 sm:px-10 sm:py-8"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SOFT_TRANSITION, delay: 0.05 }}
      >
        <h1 className="text-3xl sm:text-4xl font-black mb-4 leading-tight tracking-tight">
          <span className="text-white">Before You Begin,</span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
            You Should Understand Wallets
          </span>
        </h1>

        <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          A wallet helps ZWAP recognize you and eventually lets you claim and
          own rewards directly. But you do not have to force that step before
          you understand what it is.
        </p>
      </motion.div>
    </div>
  );
}