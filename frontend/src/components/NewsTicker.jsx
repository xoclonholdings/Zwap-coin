import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp, api } from "@/App";
import { Trophy, TrendingUp, Newspaper, Lightbulb, Gift, Bell } from "lucide-react";

// Ticker content types
const TICKER_TYPES = {
  DEAL: { icon: Gift, color: "text-yellow-400", bg: "bg-yellow-500/20" },
  LEADERBOARD: { icon: Trophy, color: "text-cyan-400", bg: "bg-cyan-500/20" },
  NEWS: { icon: Newspaper, color: "text-blue-400", bg: "bg-blue-500/20" },
  TIP: { icon: Lightbulb, color: "text-purple-400", bg: "bg-purple-500/20" },
  UPDATE: { icon: Bell, color: "text-green-400", bg: "bg-green-500/20" },
};

// Sample ticker content (will be replaced with API data)
const getTickerContent = (user) => {
  const username = user ? `Zwapper#${(parseInt(user.wallet_address?.slice(2, 10) || "0", 16) % 9999).toString().padStart(4, '0')}` : "You";
  
  return [
    // Deals & Incentives
    { type: "DEAL", text: "🎉 Plus subscribers get 1.5x rewards on all earnings!" },
    { type: "DEAL", text: "🔥 Weekend bonus: Double Z Points on games (Sat-Sun)" },
    { type: "DEAL", text: "💎 Refer a friend, earn 100 ZWAP when they join!" },
    
    // Leaderboard (local/regional/global placeholders)
    { type: "LEADERBOARD", text: `🏆 ${username}: #247 in Los Angeles • #1,892 in California • #12,456 Global` },
    { type: "LEADERBOARD", text: "👑 Top Earner Today: CryptoKing#8821 with 2,450 ZWAP" },
    { type: "LEADERBOARD", text: "🎮 Top Gamer This Week: BlockMaster#3344 with 89 games" },
    { type: "LEADERBOARD", text: "🚶 Most Steps Today: WalkChamp#5567 with 25,432 steps" },
    
    // App Updates
    { type: "UPDATE", text: "📱 New: zTetris game now available for Plus members!" },
    { type: "UPDATE", text: "🔄 App v2.0 released - Faster swaps, better rewards" },
    { type: "UPDATE", text: "🎊 Coming Soon: zDance mode for Sustainers" },
    
    // Crypto Headlines
    { type: "NEWS", text: "📈 BTC hits new ATH! Up 5.2% in 24h" },
    { type: "NEWS", text: "🔷 Polygon network upgrade completed successfully" },
    { type: "NEWS", text: "💰 Crypto market cap surpasses $3T milestone" },
    
    // Tips & How-tos
    { type: "TIP", text: "💡 Tip: Play games to earn Z Points - walking only gives ZWAP!" },
    { type: "TIP", text: "💡 Did you know? 1000 Z Points = 1 ZWAP in the shop" },
    { type: "TIP", text: "💡 Pro tip: Higher game levels = better rewards!" },
    { type: "TIP", text: "💡 FAQ: Swap fees are only 1% - lowest in the market!" },
  ];
};

export default function NewsTicker() {
  const { user } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [tickerContent, setTickerContent] = useState([]);

  useEffect(() => {
    setTickerContent(getTickerContent(user));
  }, [user]);

  useEffect(() => {
    if (tickerContent.length === 0) return;

    const interval = setInterval(() => {
      // Fade out
      setIsVisible(false);
      
      // After fade out, change content and fade in
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % tickerContent.length);
        setIsVisible(true);
      }, 500);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [tickerContent.length]);

  if (tickerContent.length === 0) return null;

  const current = tickerContent[currentIndex];
  const config = TICKER_TYPES[current.type];
  const Icon = config.icon;

  return (
    <div className="fixed bottom-[60px] left-0 right-0 z-30 bg-[#0a0b1e]/95 backdrop-blur-lg border-t border-b border-cyan-500/10">
      <div className="max-w-lg mx-auto px-4 py-2">
        <AnimatePresence mode="wait">
          {isVisible && (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-2"
            >
              <div className={`w-6 h-6 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-3 h-3 ${config.color}`} />
              </div>
              <p className="text-xs text-gray-300 truncate">{current.text}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Progress dots */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-800">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 5, ease: "linear" }}
          key={currentIndex}
        />
      </div>
    </div>
  );
}
