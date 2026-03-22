import React, { useEffect, useState } from "react";
import {
  Pause,
  Play,
  RefreshCw,
  Users,
  Activity,
  Coins,
  Database,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  BarChart3,
  Wallet,
  Sparkles,
  Trophy,
  Newspaper,
  ListOrdered,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import adminApi from "@/lib/adminApi";

export default function DashboardSection({ data, onRefresh }) {
  const treasury = data?.treasury || {};
  const analytics = data?.analytics || {};
  const topEarners = analytics?.top_earners || [];
  const leaderboard = data?.leaderboard || {};
  const news = data?.news || [];

  const [purchaseAnalytics, setPurchaseAnalytics] = useState({
    total_purchases: 0,
    total_zwap_spent: 0,
    total_zpts_spent: 0,
    top_items: [],
  });
  const [loadingPurchaseAnalytics, setLoadingPurchaseAnalytics] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [view, setView] = useState("portfolio");
  const [insightTab, setInsightTab] = useState("earners");

  useEffect(() => {
    loadPurchaseAnalytics();
  }, []);

  const loadPurchaseAnalytics = async () => {
    setLoadingPurchaseAnalytics(true);
    try {
      const result = await adminApi.get("/analytics/purchases");
      setPurchaseAnalytics(result || {});
    } catch (err) {
      console.error(err);
      toast.error("Failed to load purchase analytics");
    } finally {
      setLoadingPurchaseAnalytics(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        Promise.resolve(onRefresh?.()),
        loadPurchaseAnalytics(),
      ]);
      toast.success("Dashboard refreshed");
    } catch (err) {
      console.error(err);
      toast.error("Failed to refresh dashboard");
    } finally {
      setRefreshing(false);
    }
  };

  const summaryCards = [
    {
      label: "Total Users",
      value: analytics.total_users || 0,
      icon: Users,
      tone: "cyan",
    },
    {
      label: "Active Today",
      value: analytics.dau || 0,
      icon: Activity,
      tone: "green",
    },
    {
      label: "Treasury Balance",
      value: (treasury.on_chain_balance || 0).toFixed(2),
      icon: Database,
      tone: "blue",
    },
    {
      label: "Claimed Total",
      value: (treasury.claimed_total || 0).toFixed(2),
      icon: Coins,
      tone: "purple",
    },
    {
      label: "Total Purchases",
      value: purchaseAnalytics.total_purchases || 0,
      icon: ShoppingBag,
      tone: "cyan",
    },
    {
      label: "ZWAP Spent",
      value: (purchaseAnalytics.total_zwap_spent || 0).toFixed(2),
      icon: DollarSign,
      tone: "green",
    },
    {
      label: "zPts Spent",
      value: (purchaseAnalytics.total_zpts_spent || 0).toFixed(2),
      icon: TrendingUp,
      tone: "purple",
    },
  ];

  const toneMap = {
    cyan: {
      iconWrap: "bg-cyan-500/15 border border-cyan-400/20",
      icon: "text-cyan-300",
      value: "text-cyan-200",
    },
    green: {
      iconWrap: "bg-emerald-500/15 border border-emerald-400/20",
      icon: "text-emerald-300",
      value: "text-emerald-200",
    },
    blue: {
      iconWrap: "bg-blue-500/15 border border-blue-400/20",
      icon: "text-blue-300",
      value: "text-blue-200",
    },
    purple: {
      iconWrap: "bg-violet-500/15 border border-violet-400/20",
      icon: "text-violet-300",
      value: "text-violet-200",
    },
  };

  const viewMeta = {
    portfolio: {
      title: "Treasury Overview",
      subtitle: "Treasury flow, balance stability, and platform reserves.",
    },
    activity: {
      title: "User Activity",
      subtitle: "Daily usage, engagement spikes, and platform traffic rhythm.",
    },
    rewards: {
      title: "Reward Distribution",
      subtitle: "Claims, earned value, and reward output across the ecosystem.",
    },
  };

  const insightTabs = [
    { id: "earners", label: "Top Earners", icon: Trophy },
    { id: "purchases", label: "Top Purchased", icon: ShoppingBag },
    { id: "activity", label: "Live Activity", icon: Newspaper },
    { id: "leaderboard", label: "Leaderboard", icon: ListOrdered },
  ];

  const renderInsightContent = () => {
    if (insightTab === "earners") {
      return topEarners.length === 0 ? (
        <p className="text-gray-400 text-sm">No top earners yet</p>
      ) : (
        <div className="space-y-3">
          {topEarners.slice(0, 5).map((user, index) => (
            <div
              key={user.id || user.wallet_address || index}
              className="flex items-center justify-between rounded-2xl border border-gray-800 bg-white/[0.03] px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-white font-medium truncate">
                  {user.username || "Unnamed User"}
                </p>
                <p className="text-xs text-gray-500 font-mono truncate">
                  {user.wallet_address
                    ? `${user.wallet_address.slice(0, 8)}...${user.wallet_address.slice(-4)}`
                    : "No wallet"}
                </p>
              </div>

              <div className="text-right pl-4">
                <p className="text-cyan-300 font-bold">
                  {(user.zwap_balance || 0).toFixed(2)} ZWAP
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user.tier || "starter"}
                </p>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (insightTab === "purchases") {
      if (loadingPurchaseAnalytics) {
        return <p className="text-gray-400 text-sm">Loading purchase analytics...</p>;
      }

      return purchaseAnalytics.top_items?.length ? (
        <div className="space-y-3">
          {purchaseAnalytics.top_items.slice(0, 5).map((item, index) => (
            <div
              key={`${item.item_name}-${index}`}
              className="flex items-center justify-between rounded-2xl border border-gray-800 bg-white/[0.03] px-4 py-3"
            >
              <p className="text-white font-medium">{item.item_name}</p>
              <p className="text-cyan-300 font-bold">{item.count}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-sm">No purchases yet</p>
      );
    }

    if (insightTab === "activity") {
      return news.length > 0 ? (
        <div className="space-y-3">
          {news.slice(0, 5).map((item, index) => (
            <div
              key={item.id || index}
              className="rounded-2xl border border-gray-800 bg-white/[0.03] px-4 py-3"
            >
              <p className="text-sm text-white font-medium">
                {item.title || "Platform update"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {item.created_at
                  ? new Date(item.created_at).toLocaleString()
                  : "Recent"}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-2xl border border-gray-800 bg-white/[0.03] px-4 py-3 text-sm text-gray-400">
            Live reward activity feed placeholder
          </div>
          <div className="rounded-2xl border border-gray-800 bg-white/[0.03] px-4 py-3 text-sm text-gray-400">
            Recent streaks, claims, and campaign events can appear here
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3 text-sm">
        <div className="rounded-2xl border border-gray-800 bg-white/[0.03] px-4 py-3 flex items-center justify-between">
          <span className="text-gray-400">Entries</span>
          <span className="text-white font-semibold">
            {leaderboard?.entries?.length || 0}
          </span>
        </div>
        <div className="rounded-2xl border border-gray-800 bg-white/[0.03] px-4 py-3 flex items-center justify-between">
          <span className="text-gray-400">Category</span>
          <span className="text-white font-semibold">Earned</span>
        </div>
        <div className="rounded-2xl border border-gray-800 bg-white/[0.03] px-4 py-3 flex items-center justify-between">
          <span className="text-gray-400">Top Items Count</span>
          <span className="text-white font-semibold">
            {purchaseAnalytics.top_items?.length || 0}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-400/80">
            Admin Overview
          </p>
          <h2 className="text-3xl font-bold text-white">Dashboard Overview</h2>
          <p className="text-sm text-gray-400 max-w-2xl">
            Platform health, treasury visibility, spending behavior, and live admin
            intelligence in one place.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing}
          className="border-gray-700 bg-white/5 text-gray-200 hover:bg-white/10 w-fit"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      <div className="grid xl:grid-cols-[minmax(0,1.7fr)_360px] gap-5">
        <div className="space-y-5">
          <div className="rounded-3xl border border-gray-800 bg-[#0c101b] overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-gray-800/80">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm text-gray-400">Treasury Snapshot</p>
                  <div className="flex items-end gap-3 mt-2 flex-wrap">
                    <h3 className="text-4xl font-bold text-white">
                      {(treasury.on_chain_balance || 0).toFixed(2)}
                    </h3>
                    <span className="px-2.5 py-1 rounded-xl text-xs border border-gray-700 bg-white/5 text-gray-300">
                      ZWAP
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Claimed total: {(treasury.claimed_total || 0).toFixed(2)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {["portfolio", "activity", "rewards"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setView(tab)}
                      className={`px-3 py-2 rounded-xl text-sm border transition ${
                        view === tab
                          ? "bg-cyan-500/20 border-cyan-400/30 text-cyan-300"
                          : "bg-white/5 border-gray-800 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="rounded-3xl border border-cyan-500/15 bg-gradient-to-br from-cyan-500/10 via-violet-500/5 to-transparent min-h-[340px] flex items-center justify-center">
                <div className="text-center px-6">
                  <BarChart3 className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                  <p className="text-white text-lg font-semibold">
                    {viewMeta[view].title}
                  </p>
                  <p className="text-sm text-gray-400 mt-2 max-w-md">
                    {viewMeta[view].subtitle}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 2xl:grid-cols-4 gap-3">
                {summaryCards.map((card) => {
                  const Icon = card.icon;
                  const tone = toneMap[card.tone];

                  return (
                    <div
                      key={card.label}
                      className="rounded-2xl border border-gray-800 bg-[#101522] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[11px] uppercase tracking-wide text-gray-500">
                            {card.label}
                          </p>
                          <p className={`mt-2 text-2xl font-bold ${tone.value}`}>
                            {card.value}
                          </p>
                        </div>

                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center ${tone.iconWrap}`}
                        >
                          <Icon className={`w-4 h-4 ${tone.icon}`} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-800 bg-[#0c101b] p-5">
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-white font-semibold text-lg">Insights</h3>
                  <p className="text-sm text-gray-400">
                    Switch between leaderboard, marketplace, and activity views
                  </p>
                </div>

                <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Live admin intelligence
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {insightTabs.map((tab) => {
                  const Icon = tab.icon;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setInsightTab(tab.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition ${
                        insightTab === tab.id
                          ? "bg-cyan-500/20 border-cyan-400/30 text-cyan-300"
                          : "bg-white/5 border-gray-800 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {renderInsightContent()}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-3xl border border-gray-800 bg-[#0c101b] p-5">
            <h3 className="text-white font-semibold text-lg mb-4">System Status</h3>

            <div className="space-y-3">
              <div
                className={`px-4 py-3 rounded-2xl text-sm flex items-center gap-2 ${
                  treasury.web3_connected
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-400/20"
                    : "bg-red-500/15 text-red-300 border border-red-400/20"
                }`}
              >
                {treasury.web3_connected ? (
                  <Play className="w-4 h-4" />
                ) : (
                  <Pause className="w-4 h-4" />
                )}
                Web3: {treasury.web3_connected ? "Connected" : "Offline"}
              </div>

              <div className="px-4 py-3 rounded-2xl bg-white/[0.03] border border-gray-800 text-sm text-gray-300">
                Treasury Wallet
                <div className="font-mono text-gray-400 mt-1">
                  {treasury.treasury_wallet
                    ? `${treasury.treasury_wallet.slice(0, 8)}...${treasury.treasury_wallet.slice(-4)}`
                    : "Not available"}
                </div>
              </div>

              <div className="px-4 py-3 rounded-2xl bg-white/[0.03] border border-gray-800 text-sm text-gray-300">
                Contract
                <div className="font-mono text-gray-400 mt-1">
                  {treasury.contract_address
                    ? `${treasury.contract_address.slice(0, 8)}...${treasury.contract_address.slice(-4)}`
                    : "Not available"}
                </div>
              </div>

              <div className="px-4 py-3 rounded-2xl bg-white/[0.03] border border-gray-800 text-sm text-gray-300">
                Native Balance
                <div className="text-white font-semibold mt-1">
                  {(treasury.native_balance || 0).toFixed(4)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}