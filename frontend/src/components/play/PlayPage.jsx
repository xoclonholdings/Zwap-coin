import React from "react";
import { motion } from "framer-motion";
import PlayHome from "./PlayHome";
import PlayTab from "./PlayTab";
import GameLeaderboard from "./GameLeaderboard";

export default function PlayPage() {
  return (
    <div className="w-full px-4 pb-6 pt-4">
      <div className="mx-auto w-full max-w-md space-y-4">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <PlayHome />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <PlayTab />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <GameLeaderboard />
        </motion.div>
      </div>
    </div>
  );
}