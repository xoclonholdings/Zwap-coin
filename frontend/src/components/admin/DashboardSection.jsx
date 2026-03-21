import React, { useEffect, useState } from "react";
import { Pause, Play, RefreshCw, Users, Activity, Coins, Database, ShoppingBag, DollarSign, TrendingUp, BarChart3 } from "lucide-react";
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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Dashboard Overview</h2>
        <Button size="sm" variant="outline" onClick={onRefresh} className="border-gray-700">
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
          icon={Coins}
          label="Claimed Total"
          value={(treasury.claimed_total || 0).toFixed(2)}
          color="purple"
        />
        <StatCard
          icon={Database}
          label="Treasury Balance"
          value={(treasury.on_chain_balance || 0).toFixed(2)}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ShoppingBag}
          label="Total Purchases"
          value={purchaseAnalytics.total_purchases || 0}
          color="cyan"
        />
        <StatCard
          icon={DollarSign}
          label="ZWAP Spent"
          value={(purchaseAnalytics.total_zwap_spent || 0).toFixed(2)}
          color="green"
        />
        <StatCard
          icon={TrendingUp}
          label="zPts Spent"
          value={(purchaseAnalytics.total_zpts_spent || 0).toFixed(2)}
          color="purple"
        />
        <StatCard
          icon={BarChart3}
          label="Top Items"
          value={purchaseAnalytics.top_items?.length || 0}
          color="blue"
        />
      </div>

      <div className="p-4 rounded-xl border border-gray-700 bg-gray-800/30">
        <h3 className="text-white font-semibold mb-3">System Status</h3>
        <div className="flex flex-wrap gap-3">
          <div
            className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-2 ${
              treasury.web3_connected
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {treasury.web3_connected ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            Web3: {treasury.web3_connected ? "Connected" : "Offline"}
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-gray-700 bg-gray-800/30">
        <h3 className="text-white font-semibold mb-3">Top Earners</h3>

        {topEarners.length === 0 ? (
          <p className="text-gray-400 text-sm">No top earners yet</p>
        ) : (
          <div className="space-y-3">
            {topEarners.slice(0, 5).map((user, index) => (
              <div
                key={user.id || user.wallet_address || index}
                className="flex items-center justify-between rounded-lg bg-gray-900/50 px-4 py-3"
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

      <div className="p-4 rounded-xl border border-gray-700 bg-gray-800/30">
        <h3 className="text-white font-semibold mb-3">Top Purchased Items</h3>

        {loadingPurchaseAnalytics ? (
          <p className="text-gray-400 text-sm">Loading purchase analytics...</p>
        ) : purchaseAnalytics.top_items?.length ? (
          <div className="space-y-3">
            {purchaseAnalytics.top_items.slice(0, 5).map((item, index) => (
              <div
                key={`${item.item_name}-${index}`}
                className="flex items-center justify-between rounded-lg bg-gray-900/50 px-4 py-3"
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
    </div>
  );
}