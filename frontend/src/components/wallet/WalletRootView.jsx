import React from "react";
import { motion } from "framer-motion";
import { PlusCircle, Link2, ChevronRight } from "lucide-react";

export default function WalletRootView({ onCreate, onConnect }) {
  return (
    <div className="space-y-3 mt-4">
      <motion.button
        onClick={onCreate}
        className="w-full rounded-2xl border border-cyan-500/30 bg-[#141530] hover:bg-[#1a1b40] p-4 text-left transition-colors"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/15 flex items-center justify-center">
            <PlusCircle className="w-6 h-6 text-cyan-400" />
          </div>

          <div className="flex-1">
            <p className="text-white font-semibold">Create New Wallet</p>
            <p className="text-xs text-gray-400 mt-1">
              Start fresh with in-app setup or another wallet app.
            </p>
          </div>

          <ChevronRight className="w-5 h-5 text-cyan-400" />
        </div>
      </motion.button>

      <motion.button
        onClick={onConnect}
        className="w-full rounded-2xl border border-purple-500/30 bg-[#141530] hover:bg-[#1a1b40] p-4 text-left transition-colors"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/15 flex items-center justify-center">
            <Link2 className="w-6 h-6 text-purple-400" />
          </div>

          <div className="flex-1">
            <p className="text-white font-semibold">Connect Existing Wallet</p>
            <p className="text-xs text-gray-400 mt-1">
              Already have one? Connect it and use it with ZWAP!
            </p>
          </div>

          <ChevronRight className="w-5 h-5 text-purple-400" />
        </div>
      </motion.button>

      <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-3 mt-4">
        <p className="text-xs text-cyan-100 leading-relaxed">
          You can skip wallet setup for now. Your offline activity and progress
          can still be saved and synced later.
        </p>
      </div>
    </div>
  );
}