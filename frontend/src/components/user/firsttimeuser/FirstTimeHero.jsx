import React from "react";
import { motion } from "framer-motion";
import { ZWAP_LOGO } from "@/App";

const SOFT_TRANSITION = { duration: 0.45, ease: "easeOut" };

export default function FirstTimeHero() {
  return (
    <>
      {/* Logo */}
      <motion.div
        className="flex justify-center mb-6 sm:mb-7"
        initial={{ opacity: 0, y: -16, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.img
          src={ZWAP_LOGO}
          alt="ZWAP!"
          className="w-28 sm:w-32 md:w-36 select-none"
          animate={{
            y: [0, -5, 0],
            scale: [1, 1.03, 1],
            filter: [
              "drop-shadow(0 0 10px rgba(34,211,238,0.28)) drop-shadow(0 0 24px rgba(59,130,246,0.18))",
              "drop-shadow(0 0 18px rgba(34,211,238,0.42)) drop-shadow(0 0 32px rgba(168,85,247,0.28))",
              "drop-shadow(0 0 10px rgba(34,211,238,0.28)) drop-shadow(0 0 24px rgba(59,130,246,0.18))",
            ],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* Hero */}
      <motion.div
        className="text-center mb-7 rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_0_60px_rgba(0,0,0,0.35)] px-5 py-7 sm:px-10 sm:py-8"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SOFT_TRANSITION, delay: 0.05 }}
      >
        <h1 className="text-3xl sm:text-4xl font-black mb-4 leading-tight tracking-tight">
          <span className="text-white">Before You Begin,</span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
            You Should Understand Wallets
          </span>
        </h1>

        <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          A wallet helps{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 font-semibold">
            ZWAP!
          </span>{" "}
          recognize you and eventually lets you claim and own rewards directly.
          But you do not have to force that step before you understand what it
          is.
        </p>
      </motion.div>
    </>
  );
}