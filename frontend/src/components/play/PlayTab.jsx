import React from "react";
import { motion } from "framer-motion";
import { useApp } from "@/App";
import PlayHome from "./PlayHome";
import PlayArcadeCard from "./PlayArcadeCard";
import GameLeaderboard from "./GameLeaderboard";

export default function PlayTab() {
  const { user } = useApp();

  const isPlus = String(user?.tier || "starter").toLowerCase() === "plus";

  const handleStartGame = (game) => {
    console.log("Start game:", game?.id, game);
  };

  return (
    <div className="w-full px-4 pb-6 pt-4">
      <div className="mx-auto w-full max-w-md space-y-4">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <PlayHome isPlus={isPlus} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <PlayArcadeCard onStartGame={handleStartGame} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <GameLeaderboard />
        </motion.div>
      </div>
    </div>
  );
}