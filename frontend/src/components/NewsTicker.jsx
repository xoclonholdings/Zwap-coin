import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/App";
import api from "@/lib/api";
import { Trophy, TrendingUp, Newspaper, Lightbulb, Gift, Bell, Users } from "lucide-react";
import { allDidYouKnow } from "@/data/education";

// Ticker content types
const TICKER_TYPES = {
  DEAL: { icon: Gift, color: "text-yellow-400", bg: "bg-yellow-500/20" },
  LEADERBOARD: { icon: Trophy, color: "text-cyan-400", bg: "bg-cyan-500/20" },
  NEWS: { icon: Newspaper, color: "text-blue-400", bg: "bg-blue-500/20" },
  TIP: { icon: Lightbulb, color: "text-purple-400", bg: "bg-purple-500/20" },
  UPDATE: { icon: Bell, color: "text-green-400", bg: "bg-green-500/20" },
  STATS: { icon: Users, color: "text-pink-400", bg: "bg-pink-500/20" },
};

// Static content
const staticContent = [
  // Deals & Incentives
  { type: "DEAL", text: "Plus subscribers get 1.5x rewards on all earnings!" },
  { type: "DEAL", text: "Weekend bonus: Double Z Points on games (Sat-Sun)" },
  { type: "DEAL", text: "Refer a friend, earn 100 ZWAP when they join!" },
  
  // App Updates
  { type: "UPDATE", text: "New: zTetris game now available for Plus members!" },
  { type: "UPDATE", text: "App v2.0 released - Faster swaps, better rewards" },
  
  // Tips & How-tos
  { type: "TIP", text: "Tip: Play games to earn Z Points - walking only gives ZWAP!" },
  { type: "TIP", text: "Pro tip: Higher game levels = better rewards!" },
  { type: "TIP", text: "FAQ: Swap fees are only 1% - lowest in the market!" },
  
  // Education "Did You Know?" facts from spine
  ...allDidYouKnow.map((item) => ({ type: "TIP", text: `Did you know? ${item.fact}` })),
];

export default function NewsTicker() {
  const { user, walletAddress } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [tickerContent, setTickerContent] = useState([]);
  const [leaderboardStats, setLeaderboardStats] = useState(null);
  const [userRank, setUserRank] = useState(null);

  // Fetch leaderboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await api.getLeaderboardStats();
        setLeaderboardStats(stats);
      } catch (error) {
        console.error("Failed to fetch leaderboard stats:", error);
      }
    };
    
    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  // Fetch user rank if connected
  useEffect(() => {
    const fetchUserRank = async () => {
      if (!walletAddress) return;
      try {
        const rank = await api.getUserRank(walletAddress, "earned");
        setUserRank(rank);
      } catch (error) {
        console.error("Failed to fetch user rank:", error);
      }
    };
    
    fetchUserRank();
  }, [walletAddress]);

  // Build ticker content
  useEffect(() => {
    const content = [...staticContent];
    
    // Add dynamic leaderboard content
    if (leaderboardStats) {
      if (leaderboardStats.top_earner?.username !== "N/A") {
        content.push({
          type: "LEADERBOARD",
          text: `Top Earner: ${leaderboardStats.top_earner.username} with ${leaderboardStats.top_earner.value.toLocaleString()} ZWAP`
        });
      }
      if (leaderboardStats.top_gamer?.username !== "N/A") {
        content.push({
          type: "LEADERBOARD",
          text: `Top Gamer: ${leaderboardStats.top_gamer.username} with ${leaderboardStats.top_gamer.value.toLocaleString()} games`
        });
      }
      if (leaderboardStats.top_stepper?.username !== "N/A") {
        content.push({
          type: "LEADERBOARD",
          text: `Most Steps: ${leaderboardStats.top_stepper.username} with ${leaderboardStats.top_stepper.value.toLocaleString()} steps`
        });
      }
      if (leaderboardStats.total_users > 0) {
        content.push({
          type: "STATS",
          text: `${leaderboardStats.total_users.toLocaleString()} Zwappers have earned ${leaderboardStats.total_zwap_distributed.toLocaleString()} ZWAP!`
        });
      }
    }
    
    // Add user rank if available
    if (userRank) {
      content.push({
        type: "LEADERBOARD",
        text: `${userRank.username}: #${userRank.local_rank} Local • #${userRank.regional_rank} Regional • #${userRank.global_rank} Global`
      });
    }
    
    setTickerContent(content);
  }, [leaderboardStats, userRank]);

  // Rotate ticker
  useEffect(() => {
    if (tickerContent.length === 0) return;

    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % tickerContent.length);
        setIsVisible(true);
      }, 800);
    }, 8000);

    return () => clearInterval(interval);
  }, [tickerContent.length]);

  if (tickerContent.length === 0) return null;

  const current = tickerContent[currentIndex];
  const config = TICKER_TYPES[current.type];
  const Icon = config.icon;

  return (
    <div className="fixed bottom-[68px] left-0 right-0 z-30 bg-[#0a0b1e]/95 backdrop-blur-lg border-t border-cyan-500/20">
      <div className="max-w-lg mx-auto px-4 py-3">
        <AnimatePresence mode="wait">
          {isVisible && (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3"
            >
              <motion.div 
                className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0`}
                animate={{ 
                  boxShadow: [
                    "0 0 10px rgba(0,245,255,0.2)",
                    "0 0 20px rgba(0,245,255,0.4)",
                    "0 0 10px rgba(0,245,255,0.2)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Icon className={`w-4 h-4 ${config.color}`} />
              </motion.div>
              <p className="text-sm text-gray-200 leading-tight">{current.text}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800/50">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 8, ease: "linear" }}
          key={currentIndex}
        />
      </div>
    </div>
  );
}
