import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/App";
import api from "@/lib/api";
import {
  Trophy,
  Newspaper,
  Lightbulb,
  Gift,
  Bell,
  Users,
  Bitcoin,
  TrendingUp,
} from "lucide-react";
import { allDidYouKnow } from "@/data/education";

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";
const NEWS_API_BASE = "https://newsapi.org/v2";
const COINGECKO_KEY = process.env.REACT_APP_COINGECKO_API_KEY;
const NEWS_API_KEY = process.env.REACT_APP_NEWS_API_KEY;

const TICKER_TYPES = {
  DEAL: {
    icon: Gift,
    color: "text-yellow-300",
    chip: "DEAL",
    chipClass: "bg-yellow-500/15 text-yellow-300 border-yellow-400/20",
  },
  LEADERBOARD: {
    icon: Trophy,
    color: "text-cyan-300",
    chip: "TOP",
    chipClass: "bg-cyan-500/15 text-cyan-300 border-cyan-400/20",
  },
  NEWS: {
    icon: Newspaper,
    color: "text-blue-300",
    chip: "NEWS",
    chipClass: "bg-blue-500/15 text-blue-300 border-blue-400/20",
  },
  TIP: {
    icon: Lightbulb,
    color: "text-purple-300",
    chip: "TIP",
    chipClass: "bg-purple-500/15 text-purple-300 border-purple-400/20",
  },
  UPDATE: {
    icon: Bell,
    color: "text-green-300",
    chip: "UPDATE",
    chipClass: "bg-green-500/15 text-green-300 border-green-400/20",
  },
  STATS: {
    icon: Users,
    color: "text-pink-300",
    chip: "STATS",
    chipClass: "bg-pink-500/15 text-pink-300 border-pink-400/20",
  },
  PRICE: {
    icon: Bitcoin,
    color: "text-orange-300",
    chip: "MARKET",
    chipClass: "bg-orange-500/15 text-orange-300 border-orange-400/20",
  },
  TRENDING: {
    icon: TrendingUp,
    color: "text-emerald-300",
    chip: "TRENDING",
    chipClass: "bg-emerald-500/15 text-emerald-300 border-emerald-400/20",
  },
  WEB3: {
    icon: Newspaper,
    color: "text-sky-300",
    chip: "WEB3",
    chipClass: "bg-sky-500/15 text-sky-300 border-sky-400/20",
  },
};

const staticContent = [
  { type: "DEAL", text: "Plus subscribers get 1.5x rewards on all earnings!" },
  { type: "DEAL", text: "Weekend bonus: Double Z Points on games (Sat-Sun)" },
  { type: "UPDATE", text: "New: zTetris game now available for Plus members!" },
  { type: "TIP", text: "Tip: Play games to earn Z Points - walking only gives ZWAP!" },
  { type: "TIP", text: "Pro tip: Higher game levels = better rewards!" },
  ...allDidYouKnow.map((item) => ({
    type: "TIP",
    text: `Did you know? ${item.fact}`,
  })),
];

const formatPct = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0.0%";
  return `${num >= 0 ? "+" : ""}${num.toFixed(1)}%`;
};

const formatMoney = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "—";
  if (num >= 1000) {
    return `$${num.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }
  if (num >= 1) {
    return `$${num.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  }
  return `$${num.toLocaleString(undefined, { maximumFractionDigits: 4 })}`;
};

export default function NewsTicker() {
  const { walletAddress } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [tickerContent, setTickerContent] = useState([]);
  const [leaderboardStats, setLeaderboardStats] = useState(null);
  const [userRank, setUserRank] = useState(null);
  const [marketItems, setMarketItems] = useState([]);
  const [trendingItems, setTrendingItems] = useState([]);
  const [web3Headlines, setWeb3Headlines] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await api.getLeaderboardStats();
        setLeaderboardStats(stats || null);
      } catch (error) {
        console.error("Failed to fetch leaderboard stats:", error);
        setLeaderboardStats(null);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchUserRank = async () => {
      if (!walletAddress) {
        setUserRank(null);
        return;
      }

      try {
        const rank = await api.getUserRank(walletAddress, "earned");
        setUserRank(rank || null);
      } catch (error) {
        console.error("Failed to fetch user rank:", error);
        setUserRank(null);
      }
    };

    fetchUserRank();
  }, [walletAddress]);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const url = new URL(`${COINGECKO_BASE}/coins/markets`);
        url.searchParams.set("vs_currency", "usd");
        url.searchParams.set(
          "ids",
          "bitcoin,ethereum,solana,polygon-ecosystem-token"
        );
        url.searchParams.set("order", "market_cap_desc");
        url.searchParams.set("per_page", "4");
        url.searchParams.set("page", "1");
        url.searchParams.set("sparkline", "false");
        url.searchParams.set("price_change_percentage", "24h");

        const response = await fetch(url.toString(), {
          headers: COINGECKO_KEY ? { "x-cg-pro-api-key": COINGECKO_KEY } : {},
        });

        if (!response.ok) {
          throw new Error("Failed CoinGecko markets request");
        }

        const data = await response.json();
        setMarketItems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch market data:", error);
        setMarketItems([]);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 120000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await fetch(`${COINGECKO_BASE}/search/trending`, {
          headers: COINGECKO_KEY ? { "x-cg-pro-api-key": COINGECKO_KEY } : {},
        });

        if (!response.ok) {
          throw new Error("Failed CoinGecko trending request");
        }

        const data = await response.json();
        setTrendingItems(Array.isArray(data?.coins) ? data.coins.slice(0, 3) : []);
      } catch (error) {
        console.error("Failed to fetch trending coins:", error);
        setTrendingItems([]);
      }
    };

    fetchTrending();
    const interval = setInterval(fetchTrending, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchWeb3News = async () => {
      if (!NEWS_API_KEY) {
        setWeb3Headlines([]);
        return;
      }

      try {
        const url = new URL(`${NEWS_API_BASE}/top-headlines`);
        url.searchParams.set(
          "q",
          "crypto OR bitcoin OR ethereum OR blockchain OR web3"
        );
        url.searchParams.set("language", "en");
        url.searchParams.set("pageSize", "5");
        url.searchParams.set("apiKey", NEWS_API_KEY);

        const response = await fetch(url.toString());

        if (!response.ok) {
          throw new Error("Failed NewsAPI request");
        }

        const data = await response.json();
        const articles = Array.isArray(data?.articles) ? data.articles : [];

        setWeb3Headlines(
          articles
            .filter((article) => article?.title && article.title !== "[Removed]")
            .slice(0, 4)
        );
      } catch (error) {
        console.error("Failed to fetch Web3 news:", error);
        setWeb3Headlines([]);
      }
    };

    fetchWeb3News();
    const interval = setInterval(fetchWeb3News, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const content = [...staticContent];

    if (marketItems.length) {
      content.push({
        type: "PRICE",
        text: marketItems
          .map(
            (coin) =>
              `${coin?.symbol?.toUpperCase?.() || "COIN"} ${formatMoney(
                coin?.current_price
              )}`
          )
          .join(" • "),
      });

      marketItems.forEach((coin) => {
        if (!coin?.name) return;

        content.push({
          type: "PRICE",
          text: `${coin.name} ${formatMoney(coin.current_price)} • 24h ${formatPct(
            coin.price_change_percentage_24h_in_currency ??
              coin.price_change_percentage_24h
          )}`,
        });
      });
    }

    if (trendingItems.length) {
      const trendingNames = trendingItems
        .map((item) => item?.item?.name)
        .filter(Boolean);

      if (trendingNames.length) {
        content.push({
          type: "TRENDING",
          text: `Trending: ${trendingNames.join(" • ")}`,
        });
      }
    }

    if (leaderboardStats) {
      const topEarner = leaderboardStats?.top_earner;
      const topGamer = leaderboardStats?.top_gamer;
      const topStepper = leaderboardStats?.top_stepper;

      if (topEarner?.username && topEarner.username !== "N/A") {
        content.push({
          type: "LEADERBOARD",
          text: `Top Earner: ${topEarner.username} with ${Number(
            topEarner.value || 0
          ).toLocaleString()} ZWAP`,
        });
      }

      if (topGamer?.username && topGamer.username !== "N/A") {
        content.push({
          type: "LEADERBOARD",
          text: `Top Gamer: ${topGamer.username} with ${Number(
            topGamer.value || 0
          ).toLocaleString()} games`,
        });
      }

      if (topStepper?.username && topStepper.username !== "N/A") {
        content.push({
          type: "LEADERBOARD",
          text: `Most Steps: ${topStepper.username} with ${Number(
            topStepper.value || 0
          ).toLocaleString()} steps`,
        });
      }

      if (Number(leaderboardStats?.total_users || 0) > 0) {
        content.push({
          type: "STATS",
          text: `${Number(
            leaderboardStats.total_users || 0
          ).toLocaleString()} Zwappers have earned ${Number(
            leaderboardStats.total_zwap_distributed || 0
          ).toLocaleString()} ZWAP!`,
        });
      }
    }

    if (userRank?.username) {
      content.push({
        type: "LEADERBOARD",
        text: `${userRank.username}: #${Number(
          userRank.local_rank || 0
        )} Local • #${Number(userRank.regional_rank || 0)} Regional • #${Number(
          userRank.global_rank || 0
        )} Global`,
      });
    }

    web3Headlines.forEach((article) => {
      if (!article?.title) return;

      content.push({
        type: "WEB3",
        text: article.title,
      });
    });

    setTickerContent(content);
  }, [leaderboardStats, userRank, marketItems, trendingItems, web3Headlines]);

  useEffect(() => {
    if (tickerContent.length === 0) return;

    const interval = setInterval(() => {
      setIsVisible(false);

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % tickerContent.length);
        setIsVisible(true);
      }, 350);
    }, 12000);

    return () => clearInterval(interval);
  }, [tickerContent.length]);

  useEffect(() => {
    if (currentIndex >= tickerContent.length && tickerContent.length > 0) {
      setCurrentIndex(0);
    }
  }, [tickerContent.length, currentIndex]);

  if (tickerContent.length === 0) return null;

  const current = tickerContent[currentIndex];
  const config = TICKER_TYPES[current?.type] || TICKER_TYPES.NEWS;
  const Icon = config.icon;

  return (
    <div className="relative z-30">
      <div className="mx-auto max-w-lg px-3 py-2">
        <div className="relative overflow-hidden rounded-2xl border border-cyan-500/15 bg-[#0b1222]/95 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="flex items-center gap-3 px-3 py-2.5">
            <motion.div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5"
              animate={{
                boxShadow: [
                  "0 0 0 rgba(0,0,0,0)",
                  "0 0 14px rgba(34,211,238,0.18)",
                  "0 0 0 rgba(0,0,0,0)",
                ],
              }}
              transition={{ duration: 2.2, repeat: Infinity }}
            >
              <Icon className={`h-4 w-4 ${config.color}`} />
            </motion.div>

            <span
              className={`hidden shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold tracking-[0.18em] sm:inline-flex ${config.chipClass}`}
            >
              {config.chip}
            </span>

            <div className="min-w-0 flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                {isVisible && (
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <motion.p
                      className="whitespace-nowrap pr-10 text-[13px] text-gray-100"
                      title={current?.text || ""}
                      initial={{ x: "100%" }}
                      animate={{ x: "-100%" }}
                      transition={{ duration: 12, ease: "linear" }}
                    >
                      {current?.text || ""}
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
            <motion.div
              key={currentIndex}
              className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-500"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 12, ease: "linear" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}