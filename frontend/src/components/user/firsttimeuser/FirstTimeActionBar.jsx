import React from "react";
import { motion } from "framer-motion";
import { Wallet, BookOpen, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const SOFT_TRANSITION = { duration: 0.45, ease: "easeOut" };

export default function FirstTimeActionBar({
  onContinueEmail,
  onGetWallet,
  onLearnMore,
  delay = 0,
}) {
  return (
    <motion.div
      className="text-center mt-8"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SOFT_TRANSITION, delay }}
    >
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onLearnMore}
          className="w-full sm:w-1/3 h-12 sm:h-14 text-sm font-semibold"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Learn More
        </Button>

        <Button
          type="button"
          onClick={onContinueEmail}
          className="w-full sm:w-1/3 h-12 sm:h-14 text-sm font-bold bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_25px_rgba(0,245,255,0.25)] hover:shadow-[0_0_50px_rgba(0,245,255,0.45)] transition-all"
        >
          <Mail className="w-4 h-4 mr-2" />
          Continue with Email
        </Button>

        <Button
          type="button"
          onClick={onGetWallet}
          className="w-full sm:w-1/3 h-12 sm:h-14 text-sm font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-purple-500 shadow-[0_0_25px_rgba(0,245,255,0.3)] hover:shadow-[0_0_50px_rgba(0,245,255,0.5)] transition-all"
        >
          <Wallet className="w-5 h-5 mr-2" />
          Get Wallet
        </Button>
      </div>

      <p className="text-gray-600 text-xs mt-3 leading-relaxed">
        You can start with email now and connect a wallet later when you are ready to claim ZWAP.
      </p>
    </motion.div>
  );
}