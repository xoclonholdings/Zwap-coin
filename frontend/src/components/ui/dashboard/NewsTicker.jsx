import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/App";
import api from "@/lib/api";
import {
  Trophy,
  Newspaper,
  Bell,
  Users,
  Bitcoin,
  TrendingUp,
  ExternalLink,
  X,
  Globe,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";
const NEWS_API_BASE = "https://newsapi.org/v2";
const COINGECKO_KEY = process.env.REACT_APP_COINGECKO_API_KEY;
const NEWS_API_KEY = process.env.REACT_APP_NEWS_API_KEY;

const TICKER_TYPES = {
  LEARN: {
    icon: Sparkles,
    color: "text-violet-300",
    chip: "zLEARN",
    chipClass: "bg-violet-500/15 text-violet-300 border-violet-400/20",
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

const shuffleArray = (items) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

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

function SourceBrowserModal({ item, onClose }) {
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    if (item?.url) {
      setIframeLoaded(false);
    }
  }, [item]);

  if (!item?.url) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="flex h-full w-full flex-col">
          <div className="flex items-center justify-between border-b border-white/10 bg-[#0b1222]/95 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {item.sourceLabel || "Source"}
              </p>
              <p className="truncate text-xs text-gray-400">{item.text}</p>
            </div>

            <div className="ml-3 flex items-center gap-2">
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-gray-300 transition hover:bg-white/[0.08] hover:text-white"
                title="Open in new tab"
              >
                <ExternalLink className="h-4 w-4" />
              </a>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-gray-300 transition hover:bg-white/[0.08] hover:text-white"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="relative flex-1 bg-[#060b16]">
            {!iframeLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                  <Globe className="h-5 w-5 text-cyan-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Loading source...</p>
                  <p className="mt-1 text-xs text-gray-400">
                    Some websites block in-app embedding. If that happens, use the
                    open button above.
                  </p>
                </div>
              </div>
            )}

            <iframe
              src={item.url}
              title={item.text || item.sourceLabel || "Source"}
              className="h-full w-full border-0"
              onLoad={() => setIframeLoaded(true)}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function NewsTicker() {
  const { walletAddress } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [leaderboardStats, setLeaderboardStats] = useState(null);
  const [userRank, setUserRank] = useState(null);
  const [marketItems, setMarketItems] = useState([]);
  const [trendingItems, setTrendingItems] = useState([]);
  const [web3Headlines, setWeb3Headlines] = useState([]);
  const [learnItems, setLearnItems] = useState([]);
  const [sourceItem, setSourceItem] = useState(null);

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
    const fetchLearnTicker = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/learn/ticker?limit=12`
        );
        if (!response.ok) {
          throw new Error("Failed learn ticker request");
        }

        const data = await response.json();
        setLearnItems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch zLearn ticker items:", error);
        setLearnItems([]);
      }
    };

    fetchLearnTicker();
    const interval = setInterval(fetchLearnTicker, 180000);
    return () => clearInterval(interval);
  }, []);

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

  const tickerContent = useMemo(() => {
    const content = [];

    learnItems.forEach((item, index) => {
      if (!item?.text) return;

      content.push({
        id: `learn-${item.module_id || "module"}-${index}`,
        type: "LEARN",
        text: item.type === "tip" ? `Tip: ${item.text}` : `Did you know? ${item.text}`,
        clickable: false,
        url: null,
        sourceLabel: item.module_title || "zLearn",
      });
    });

    if (marketItems.length) {
      content.push({
        id: "market-summary",
        type: "PRICE",
        text: marketItems
          .map(
            (coin) =>
              `${coin?.symbol?.toUpperCase?.() || "COIN"} ${formatMoney(
                coin?.current_price
              )}`
          )
          .join(" • "),
        clickable: true,
        url: "https://www.coingecko.com/",
        sourceLabel: "CoinGecko",
      });

      marketItems.forEach((coin) => {
        if (!coin?.name) return;

        content.push({
          id: `market-${coin.id}`,
          type: "PRICE",
          text: `${coin.name} ${formatMoney(coin.current_price)} • 24h ${formatPct(
            coin.price_change_percentage_24h_in_currency ??
              coin.price_change_percentage_24h
          )}`,
          clickable: true,
          url: coin?.id
            ? `https://www.coingecko.com/en/coins/${coin.id}`
            : "https://www.coingecko.com/",
          sourceLabel: "CoinGecko",
        });
      });
    }

    if (trendingItems.length) {
      const trendingNames = trendingItems
        .map((item) => item?.item?.name)
        .filter(Boolean);

      if (trendingNames.length) {
        content.push({
          id: "trending-summary",
          type: "TRENDING",
          text: `Trending: ${trendingNames.join(" • ")}`,
          clickable: true,
          url: "https://www.coingecko.com/en/search/trending-crypto",
          sourceLabel: "CoinGecko",
        });
      }
    }

    if (leaderboardStats) {
      const topEarner = leaderboardStats?.top_earner;
      const topGamer = leaderboardStats?.top_gamer;
      const topStepper = leaderboardStats?.top_stepper;

      if (topEarner?.username && topEarner.username !== "N/A") {
        content.push({
          id: "leaderboard-top-earner",
          type: "LEADERBOARD",
          text: `Top Earner: ${topEarner.username} with ${Number(
            topEarner.value || 0
          ).toLocaleString()} ZWAP`,
          clickable: false,
          url: null,
          sourceLabel: "ZWAP",
        });
      }

      if (topGamer?.username && topGamer.username !== "N/A") {
        content.push({
          id: "leaderboard-top-gamer",
          type: "LEADERBOARD",
          text: `Top Gamer: ${topGamer.username} with ${Number(
            topGamer.value || 0
          ).toLocaleString()} games`,
          clickable: false,
          url: null,
          sourceLabel: "ZWAP",
        });
      }

      if (topStepper?.username && topStepper.username !== "N/A") {
        content.push({
          id: "leaderboard-top-stepper",
          type: "LEADERBOARD",
          text: `Most Steps: ${topStepper.username} with ${Number(
            topStepper.value || 0
          ).toLocaleString()} steps`,
          clickable: false,
          url: null,
          sourceLabel: "ZWAP",
        });
      }

      if (Number(leaderboardStats?.total_users || 0) > 0) {
        content.push({
          id: "stats-total-users",
          type: "STATS",
          text: `${Number(
            leaderboardStats.total_users || 0
          ).toLocaleString()} Zwappers have earned ${Number(
            leaderboardStats.total_zwap_distributed || 0
          ).toLocaleString()} ZWAP!`,
          clickable: false,
          url: null,
          sourceLabel: "ZWAP",
        });
      }
    }

    if (userRank?.username) {
      content.push({
        id: "user-rank",
        type: "LEADERBOARD",
        text: `${userRank.username}: #${Number(
          userRank.local_rank || 0
        )} Local • #${Number(userRank.regional_rank || 0)} Regional • #${Number(
          userRank.global_rank || 0
        )} Global`,
        clickable: false,
        url: null,
        sourceLabel: "ZWAP",
      });
    }

    web3Headlines.forEach((article, index) => {
      if (!article?.title) return;

      content.push({
        id: `headline-${index}`,
        type: "WEB3",
        text: article.title,
        clickable: Boolean(article?.url),
        url: article?.url || null,
        sourceLabel: article?.source?.name || "News",
      });
    });

    return shuffleArray(content);
  }, [learnItems, leaderboardStats, userRank, marketItems, trendingItems, web3Headlines]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [tickerContent.length]);

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

  if (tickerContent.length === 0) return null;

  const current = tickerContent[currentIndex];
  const config = TICKER_TYPES[current?.type] || TICKER_TYPES.NEWS;
  const Icon = config.icon;
  const isClickable = Boolean(current?.clickable && current?.url);

  const handleOpenSource = () => {
    if (!isClickable) return;
    setSourceItem(current);
  };

  return (
    <>
      <div className="relative z-30">
        <div className="mx-auto w-full max-w-[1680px] px-3 py-2 xl:px-6 2xl:px-8">
          <div className="mx-auto max-w-lg xl:max-w-[760px] 2xl:max-w-[820px]">
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
                        {isClickable ? (
                          <button
                            type="button"
                            onClick={handleOpenSource}
                            className="flex w-full items-center gap-2 overflow-hidden text-left"
                            title={`${current?.text || ""} • Source: ${
                              current?.sourceLabel || "External"
                            }`}
                          >
                            <motion.span
                              className="whitespace-nowrap text-[13px] text-gray-100"
                              initial={{ x: "100%" }}
                              animate={{ x: "-100%" }}
                              transition={{ duration: 12, ease: "linear" }}
                            >
                              {current?.text || ""}
                            </motion.span>
                          </button>
                        ) : (
                          <motion.p
                            className="whitespace-nowrap text-[13px] text-gray-100"
                            title={current?.text || ""}
                            initial={{ x: "100%" }}
                            animate={{ x: "-100%" }}
                            transition={{ duration: 12, ease: "linear" }}
                          >
                            {current?.text || ""}
                          </motion.p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  type="button"
                  onClick={handleOpenSource}
                  disabled={!isClickable}
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition ${
                    isClickable
                      ? "border-white/10 bg-white/[0.05] text-gray-200 hover:bg-white/[0.10] hover:text-white"
                      : "border-white/5 bg-white/[0.03] text-gray-500"
                  }`}
                >
                  {isClickable ? (
                    <span className="inline-flex items-center gap-1">
                      See More
                      <ChevronRight className="h-3 w-3" />
                    </span>
                  ) : (
                    current?.sourceLabel || "ZWAP"
                  )}
                </button>
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
      </div>

      <SourceBrowserModal
        item={sourceItem}
        onClose={() => setSourceItem(null)}
      />
    </>
  );
}