import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/App";
import api from "@/lib/api";
import { TICKER_CATEGORY } from "@/lib/ticker/constants";
import {
  dedupeById,
  filterTickerItems,
  formatMoney,
  formatPct,
  normalizeTickerItem,
  weightedShuffle,
} from "@/lib/ticker/utils";

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function makeYouItems({ user, userRank }) {
  const items = [];
  const badgeName = user?.primary_badge || user?.badge_identity || "Zwapper";
  const streakDays = Number(user?.current_streak_days || 0);
  const zptsBalance = Number(user?.zpts_balance || user?.zPts || 0);
  const trophyCount = Number(user?.badge_trophies || 0);
  const loopsToNextUnlock = user?.loops_to_next_unlock ?? null;
  const nextBadgeDelta = user?.next_badge_delta ?? null;

  if (user?.closed_daily_loop_today) {
    items.push({
      id: "you-achievement-loop",
      category: TICKER_CATEGORY.YOU,
      subtype: "achievement",
      text: `${badgeName}, you closed your loop today.`,
      sourceLabel: "ZWAP",
      priority: 100,
    });
  }

  if (streakDays > 0) {
    items.push({
      id: "you-progress-streak",
      category: TICKER_CATEGORY.YOU,
      subtype: "progress",
      text:
        streakDays >= 28
          ? `You’re ${30 - streakDays} day${30 - streakDays === 1 ? "" : "s"} away from your next streak reward.`
          : `Your streak is alive at ${streakDays} day${streakDays === 1 ? "" : "s"}. Keep it moving.`,
      sourceLabel: "ZWAP",
      priority: 95,
    });
  }

  if (Number.isFinite(nextBadgeDelta) && nextBadgeDelta > 0) {
    items.push({
      id: "you-progress-badge",
      category: TICKER_CATEGORY.YOU,
      subtype: "encouragement",
      text: `Only ${nextBadgeDelta} more zPts to go to earn your next badge level.`,
      sourceLabel: "ZWAP",
      priority: 90,
    });
  } else if (zptsBalance > 0) {
    items.push({
      id: "you-progress-zpts",
      category: TICKER_CATEGORY.YOU,
      subtype: "encouragement",
      text: `${badgeName}, you’re building momentum with ${zptsBalance.toLocaleString()} zPts.`,
      sourceLabel: "ZWAP",
      priority: 88,
    });
  }

  if (Number.isFinite(loopsToNextUnlock) && loopsToNextUnlock > 0) {
    items.push({
      id: "you-progress-unlock",
      category: TICKER_CATEGORY.YOU,
      subtype: "progress",
      text: `${loopsToNextUnlock} full loop${loopsToNextUnlock === 1 ? "" : "s"} until your next unlock tier.`,
      sourceLabel: "ZWAP",
      priority: 82,
    });
  }

  if (trophyCount > 0) {
    items.push({
      id: "you-achievement-trophies",
      category: TICKER_CATEGORY.YOU,
      subtype: "achievement",
      text: `You’ve earned ${trophyCount} troph${trophyCount === 1 ? "y" : "ies"}. Your history is stacking.`,
      sourceLabel: "ZWAP",
      priority: 84,
    });
  }

  if (userRank?.global_rank) {
    items.push({
      id: "you-rank",
      category: TICKER_CATEGORY.YOU,
      subtype: "progress",
      text: `${userRank.username || "You"}: #${Number(userRank.local_rank || 0)} Local • #${Number(
        userRank.regional_rank || 0
      )} Regional • #${Number(userRank.global_rank || 0)} Global`,
      sourceLabel: "ZWAP",
      priority: 80,
    });
  }

  items.push({
    id: "you-fallback",
    category: TICKER_CATEGORY.YOU,
    subtype: "encouragement",
    text: `${badgeName}, stay active today and keep your momentum going.`,
    sourceLabel: "ZWAP",
    priority: 10,
  });

  return items;
}

function makeDidYouKnowItems(learnItems = []) {
  return learnItems
    .filter((item) => item?.text)
    .map((item, index) => ({
      id: `dyk-${item.module_id || "learn"}-${index}`,
      category: TICKER_CATEGORY.DID_YOU_KNOW,
      subtype: item.type === "tip" ? "tip" : "fact",
      text: item.type === "tip" ? `Tip: ${item.text}` : `Did you know? ${item.text}`,
      sourceLabel: item.module_title || "zLearn",
      priority: 60,
    }));
}

function makeAssistPrompt(assistOpportunity) {
  if (!assistOpportunity?.recipient_user_id || !assistOpportunity?.goal_label) {
    return null;
  }

  return {
    id: `assist-${assistOpportunity.recipient_user_id}-${assistOpportunity.goal_label}`,
    category: TICKER_CATEGORY.YOU,
    subtype: "assist",
    text: `A Zwapper near you is trying to complete their ${assistOpportunity.goal_label}. Send an assist to keep them going.`,
    sourceLabel: "ZWAP",
    priority: 98,
    cta: {
      type: "assist",
      label: "Assist",
      payload: {
        recipient_user_id: assistOpportunity.recipient_user_id,
        amount_zpts: Number(assistOpportunity.amount_zpts || 10),
        message: "Someone just gave you a boost. Keep going.",
      },
    },
  };
}

export default function useTickerFeed(enabledCategories = []) {
  const { walletAddress, user } = useApp();

  const [learnItems, setLearnItems] = useState([]);
  const [marketItems, setMarketItems] = useState([]);
  const [leaderboardStats, setLeaderboardStats] = useState(null);
  const [userRank, setUserRank] = useState(null);
  const [newsItems, setNewsItems] = useState([]);
  const [assistOpportunity, setAssistOpportunity] = useState(null);

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
        const response = await fetch(`${BACKEND_URL}/api/learn/ticker?limit=12`);
        if (!response.ok) throw new Error("Failed learn ticker request");

        const data = await response.json();
        setLearnItems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch learn ticker items:", error);
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

        const response = await fetch(url.toString());
        if (!response.ok) throw new Error("Failed CoinGecko markets request");

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
    const fetchNews = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/news/ticker?limit=10`);
        if (!response.ok) {
          setNewsItems([]);
          return;
        }

        const data = await response.json();
        setNewsItems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch ticker news:", error);
        setNewsItems([]);
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchAssistOpportunity = async () => {
      if (!walletAddress) {
        setAssistOpportunity(null);
        return;
      }

      try {
        const response = await fetch(
          `${BACKEND_URL}/api/assist/opportunity?wallet_address=${encodeURIComponent(walletAddress)}`
        );

        if (!response.ok) {
          setAssistOpportunity(null);
          return;
        }

        const data = await response.json();
        setAssistOpportunity(data || null);
      } catch (error) {
        console.error("Failed to fetch assist opportunity:", error);
        setAssistOpportunity(null);
      }
    };

    fetchAssistOpportunity();
    const interval = setInterval(fetchAssistOpportunity, 180000);
    return () => clearInterval(interval);
  }, [walletAddress]);

  const items = useMemo(() => {
    const output = [];

    output.push(...makeYouItems({ user, userRank }));

    const assistItem = makeAssistPrompt(assistOpportunity);
    if (assistItem) output.push(assistItem);

    output.push(...makeDidYouKnowItems(learnItems));

    if (leaderboardStats?.top_stepper?.username) {
      output.push({
        id: "move-top-stepper",
        category: TICKER_CATEGORY.MOVE,
        subtype: "info",
        text: `Most Steps: ${leaderboardStats.top_stepper.username} with ${Number(
          leaderboardStats.top_stepper.value || 0
        ).toLocaleString()} steps`,
        sourceLabel: "ZWAP",
        priority: 40,
      });
    }

    if (leaderboardStats?.top_gamer?.username) {
      output.push({
        id: "play-top-gamer",
        category: TICKER_CATEGORY.PLAY,
        subtype: "info",
        text: `Top Gamer: ${leaderboardStats.top_gamer.username} with ${Number(
          leaderboardStats.top_gamer.value || 0
        ).toLocaleString()} games`,
        sourceLabel: "ZWAP",
        priority: 40,
      });
    }

    if (leaderboardStats?.total_users) {
      output.push({
        id: "system-total-users",
        category: TICKER_CATEGORY.SYSTEM,
        subtype: "info",
        text: `${Number(leaderboardStats.total_users || 0).toLocaleString()} Zwappers have earned ${Number(
          leaderboardStats.total_zwap_distributed || 0
        ).toLocaleString()} ZWAP.`,
        sourceLabel: "ZWAP",
        priority: 35,
      });
    }

    if (marketItems.length) {
      output.push({
        id: "market-summary",
        category: TICKER_CATEGORY.CRYPTO_MARKET,
        subtype: "summary",
        text: marketItems
          .map(
            (coin) =>
              `${coin?.symbol?.toUpperCase?.() || "COIN"} ${formatMoney(coin?.current_price)}`
          )
          .join(" • "),
        clickable: true,
        url: "https://www.coingecko.com/",
        sourceLabel: "CoinGecko",
        priority: 30,
      });

      marketItems.forEach((coin) => {
        if (!coin?.name) return;

        output.push({
          id: `market-${coin.id}`,
          category: TICKER_CATEGORY.CRYPTO_MARKET,
          subtype: "info",
          text: `${coin.name} ${formatMoney(coin.current_price)} • 24h ${formatPct(
            coin.price_change_percentage_24h_in_currency ?? coin.price_change_percentage_24h
          )}`,
          clickable: true,
          url: coin?.id
            ? `https://www.coingecko.com/en/coins/${coin.id}`
            : "https://www.coingecko.com/",
          sourceLabel: "CoinGecko",
          priority: 28,
        });
      });
    }

    newsItems.forEach((article, index) => {
      if (!article?.title) return;

      output.push({
        id: `news-${index}-${article.category || "general"}`,
        category: article.category || TICKER_CATEGORY.CURRENT_EVENTS,
        subtype: "headline",
        text: article.title,
        clickable: Boolean(article.url),
        url: article.url || null,
        sourceLabel: article.source || "News",
        priority: 22,
      });
    });

    return weightedShuffle(
      filterTickerItems(
        dedupeById(output).map(normalizeTickerItem),
        enabledCategories
      )
    );
  }, [
    assistOpportunity,
    enabledCategories,
    leaderboardStats,
    learnItems,
    marketItems,
    newsItems,
    user,
    userRank,
  ]);

  return {
    items,
  };
}