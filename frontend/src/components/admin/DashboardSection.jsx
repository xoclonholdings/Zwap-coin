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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import adminApi from "@/lib/adminApi";
import StatCard from "@/components/admin/StatCard";

export default function DashboardSection({ data, onRefresh }) {
  const treasury = data?.treasury || {};
  const analytics = data?.analytics || {};
  const topEarners = analytics?.top_earners || [];

  const [purchaseAnalytics, setPurchaseAnalytics] = useState({
    total_purchases: 0,
    total_zwap_spent: 0,
    total_zpts_spent: 0,
    top_items: [],
  });
  const [loadingPurchaseAnalytics, setLoadingPurchaseAnalytics] = useState(true);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
          <p className="text-sm text-gray-400 mt-1">
            Platform health, reward flow, and admin visibility
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={onRefresh}
          className="border-gray-700 w-fit"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Users"
          value={analytics.total_users || 0}
          color="cyan"
        />
        <StatCard
          icon={Activity}
          label="Active Today"
          value={analytics.dau || 0}
          color="green"
        />
        <StatCard
          icon={Database}
          label="Treasury Balance"
          value={(treasury.on_chain_balance || 0).toFixed(2)}
          color="blue"
        />
        <StatCard
          icon={Coins}
          label="Claimed Total"
          value={(treasury.claimed_total || 0).toFixed(2)}
          color="purple"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-5 rounded-2xl border border-gray-700 bg-gray-800/30">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold text-lg">
                  Platform Activity
                </h3>
                <p className="text-sm text-gray-400">
                  Reward and engagement visualization area
                </p>
              </div>
            </div>

            <div className="h-72 rounded-xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-purple-500/5 to-transparent flex items-center justify-center">
              <div className="text-center px-4">
                <BarChart3 className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
                <p className="text-white font-medium">Activity Graph Placeholder</p>
                <p className="text-sm text-gray-400 mt-1">
                  This panel can later show claims, rewards, or DAU trends
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl border border-gray-700 bg-gray-800/30">
              <div className="flex items-center gap-3 mb-2">
                <ShoppingBag className="w-5 h-5 text-cyan-400" />
                <p className="text-sm text-gray-400">Total Purchases</p>
              </div>
              <p className="text-2xl font-bold text-white">
                {purchaseAnalytics.total_purchases || 0}
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-gray-700 bg-gray-800/30">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                <p className="text-sm text-gray-400">ZWAP Spent</p>
              </div>
              <p className="text-2xl font-bold text-white">
                {(purchaseAnalytics.total_zwap_spent || 0).toFixed(2)}
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-gray-700 bg-gray-800/30">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <p className="text-sm text-gray-400">zPts Spent</p>
              </div>
              <p className="text-2xl font-bold text-white">
                {(purchaseAnalytics.total_zpts_spent || 0).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-gray-700 bg-gray-800/30">
            <h3 className="text-white font-semibold text-lg mb-4">Top Earners</h3>

            {topEarners.length === 0 ? (
              <p className="text-gray-400 text-sm">No top earners yet</p>
            ) : (
              <div className="space-y-3">
                {topEarners.slice(0, 5).map((user, index) => (
                  <div
                    key={user.id || user.wallet_address || index}
                    className="flex items-center justify-between rounded-xl bg-gray-900/50 px-4 py-3"
                  >
                    <div>
                      <p className="text-white font-medium">
                        {user.username || "Unnamed User"}
                      </p>
                      <p className="text-xs text-gray-500 font-mono">
                        {user.wallet_address
                          ? `${user.wallet_address.slice(0, 8)}...${user.wallet_address.slice(-4)}`
                          : "No wallet"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-cyan-400 font-bold">
                        {(user.zwap_balance || 0).toFixed(2)} ZWAP
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {user.tier || "starter"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-5 rounded-2xl border border-gray-700 bg-gray-800/30">
            <h3 className="text-white font-semibold text-lg mb-4">System Status</h3>

            <div className="space-y-3">
              <div
                className={`px-3 py-2 rounded-xl text-sm flex items-center gap-2 ${
                  treasury.web3_connected
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {treasury.web3_connected ? (
                  <Play className="w-4 h-4" />
                ) : (
                  <Pause className="w-4 h-4" />
                )}
                Web3: {treasury.web3_connected ? "Connected" : "Offline"}
              </div>

              <div className="px-3 py-2 rounded-xl text-sm bg-gray-900/60 text-gray-300">
                Treasury Wallet:{" "}
                <span className="font-mono text-gray-400">
                  {treasury.treasury_wallet
                    ? `${treasury.treasury_wallet.slice(0, 8)}...${treasury.treasury_wallet.slice(-4)}`
                    : "Not available"}
                </span>
              </div>

              <div className="px-3 py-2 rounded-xl text-sm bg-gray-900/60 text-gray-300">
                Contract:{" "}
                <span className="font-mono text-gray-400">
                  {treasury.contract_address
                    ? `${treasury.contract_address.slice(0, 8)}...${treasury.contract_address.slice(-4)}`
                    : "Not available"}
                </span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-gray-700 bg-gray-800/30">
            <h3 className="text-white font-semibold text-lg mb-4">
              Top Purchased Items
            </h3>

            {loadingPurchaseAnalytics ? (
              <p className="text-gray-400 text-sm">Loading purchase analytics...</p>
            ) : purchaseAnalytics.top_items?.length ? (
              <div className="space-y-3">
                {purchaseAnalytics.top_items.slice(0, 5).map((item, index) => (
                  <div
                    key={`${item.item_name}-${index}`}
                    className="flex items-center justify-between rounded-xl bg-gray-900/50 px-4 py-3"
                  >
                    <p className="text-white font-medium">{item.item_name}</p>
                    <p className="text-cyan-400 font-bold">{item.count}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No purchases yet</p>
            )}
          </div>

          <div className="p-5 rounded-2xl border border-gray-700 bg-gray-800/30">
            <h3 className="text-white font-semibold text-lg mb-3">
              Live Activity Feed
            </h3>

            <div className="space-y-3 text-sm text-gray-400">
              <div className="rounded-xl bg-gray-900/50 px-4 py-3">
                Live reward activity feed placeholder
              </div>
              <div className="rounded-xl bg-gray-900/50 px-4 py-3">
                Recent streaks, claims, and campaign events can appear here
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}