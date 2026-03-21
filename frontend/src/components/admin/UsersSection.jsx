import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Eye, Play, Ban, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import adminApi from "@/lib/adminApi";

export default function UsersSection() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPurchases, setUserPurchases] = useState([]);
  const [refundingPurchaseId, setRefundingPurchaseId] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async (searchTerm = "") => {
    setLoading(true);
    try {
      const data = await adminApi.get(
        `/users?limit=50${searchTerm ? `&search=${searchTerm}` : ""}`
      );
      setUsers(data.users || []);
    } catch {
      toast.error("Failed to load users");
    }
    setLoading(false);
  };

  const suspendUser = async (wallet) => {
    if (!confirm("Suspend this user?")) return;
    try {
      await adminApi.post(`/users/${wallet}/suspend`, { reason: "Admin action" });
      toast.success("User suspended");
      loadUsers(search);
    } catch {
      toast.error("Failed to suspend user");
    }
  };

  const unsuspendUser = async (wallet) => {
    try {
      await adminApi.post(`/users/${wallet}/unsuspend`);
      toast.success("User unsuspended");
      loadUsers(search);
    } catch {
      toast.error("Failed to unsuspend user");
    }
  };

  const loadUserPurchases = async (wallet) => {
    try {
      const data = await adminApi.get(`/users/${wallet}/purchases`);
      setUserPurchases(data.purchases || []);
    } catch {
      setUserPurchases([]);
    }
  };

  const refundPurchase = async (purchaseId) => {
    if (!purchaseId) return;
    if (!window.confirm("Refund this purchase?")) return;

    setRefundingPurchaseId(purchaseId);

    try {
      await adminApi.post(`/purchases/${purchaseId}/refund`, {});
      toast.success("Purchase refunded");

      if (selectedUser?.wallet_address) {
        await loadUserPurchases(selectedUser.wallet_address);
        await loadUsers(search);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to refund purchase");
    } finally {
      setRefundingPurchaseId(null);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">User Management</h2>

      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by wallet or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadUsers(search)}
            className="pl-10 bg-gray-800 border-gray-700 h-10"
          />
        </div>

        <Button
          onClick={() => loadUsers(search)}
          className="h-10 bg-cyan-600 hover:bg-cyan-700"
        >
          <Search className="w-4 h-4" />
        </Button>
      </div>

      <div className="rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-800/80">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Wallet
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Username
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Tier
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  ZWAP
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800">
              {users.map((user) => (
                <tr
                  key={user.wallet_address}
                  className="hover:bg-gray-800/50 cursor-pointer"
                  onClick={() => {
                    setSelectedUser(user);
                    loadUserPurchases(user.wallet_address);
                  }}
                >
                  <td className="px-4 py-3 text-sm text-white font-mono">
                    {user.wallet_address?.slice(0, 8)}...{user.wallet_address?.slice(-4)}
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-300">
                    {user.username || "—"}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        user.tier === "plus"
                          ? "bg-purple-500/20 text-purple-400"
                          : "bg-gray-700 text-gray-400"
                      }`}
                    >
                      {user.tier || "starter"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-sm text-cyan-400 font-medium">
                    {user.zwap_balance?.toFixed(2) || "0"}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        user.status === "suspended"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      {user.status || "active"}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUser(user);
                          loadUserPurchases(user.wallet_address);
                        }}
                        className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white"
                        type="button"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {user.status === "suspended" ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            unsuspendUser(user.wallet_address);
                          }}
                          className="p-1.5 rounded hover:bg-green-900/50 text-gray-400 hover:text-green-400"
                          type="button"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            suspendUser(user.wallet_address);
                          }}
                          className="p-1.5 rounded hover:bg-red-900/50 text-gray-400 hover:text-red-400"
                          type="button"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="p-8 text-center text-gray-400">Loading users...</div>
        )}

        {!loading && users.length === 0 && (
          <div className="p-8 text-center text-gray-400">No users found</div>
        )}
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <motion.div
            className="bg-[#0f1029] border border-gray-700 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg">User Details</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-white"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-gray-800/50 rounded-lg">
                <p className="text-xs text-gray-500">Wallet Address</p>
                <p className="text-white font-mono text-sm break-all">
                  {selectedUser.wallet_address}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-500">Username</p>
                  <p className="text-white">{selectedUser.username || "Not set"}</p>
                </div>

                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-500">Tier</p>
                  <p className="text-white capitalize">
                    {selectedUser.tier || "starter"}
                  </p>
                </div>

                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-500">Status</p>
                  <p
                    className={
                      selectedUser.status === "suspended"
                        ? "text-red-400 font-bold"
                        : "text-green-400 font-bold"
                    }
                  >
                    {selectedUser.status || "active"}
                  </p>
                </div>

                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-500">ZWAP Balance</p>
                  <p className="text-cyan-400 font-bold">
                    {selectedUser.zwap_balance?.toFixed(4) || "0"}
                  </p>
                </div>

                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-500">Z Points</p>
                  <p className="text-purple-400 font-bold">
                    {selectedUser.zpts_balance || "0"}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-400 mb-2">Recent Purchases</p>

                {userPurchases.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {userPurchases.map((purchase, i) => (
                      <div
                        key={purchase.id || i}
                        className="bg-gray-800/40 rounded-lg px-3 py-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-white text-sm font-medium">
                              {purchase.item_name || "Item"}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {purchase.timestamp
                                ? new Date(purchase.timestamp).toLocaleString()
                                : "No timestamp"}
                            </p>

                            {purchase.refunded && (
                              <p className="text-red-400 text-xs mt-1">
                                Refunded
                                {purchase.refunded_at
                                  ? ` • ${new Date(purchase.refunded_at).toLocaleString()}`
                                  : ""}
                              </p>
                            )}
                          </div>

                          <div className="text-right">
                            <p className="text-cyan-400 text-sm font-medium">
                              {purchase.amount || 0} {purchase.payment_type || ""}
                            </p>

                            {!purchase.refunded ? (
                              <Button
                                size="sm"
                                className="mt-2 bg-red-600 hover:bg-red-700 h-8 px-3 text-xs"
                                disabled={refundingPurchaseId === purchase.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  refundPurchase(purchase.id);
                                }}
                              >
                                {refundingPurchaseId === purchase.id ? "Refunding..." : "Refund"}
                              </Button>
                            ) : (
                              <span className="inline-block mt-2 text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">
                                Refunded
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No purchases</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              {selectedUser.status === "suspended" ? (
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    unsuspendUser(selectedUser.wallet_address);
                    setSelectedUser(null);
                  }}
                >
                  Unsuspend User
                </Button>
              ) : (
                <Button
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => {
                    suspendUser(selectedUser.wallet_address);
                    setSelectedUser(null);
                  }}
                >
                  Suspend User
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => setSelectedUser(null)}
                className="border-gray-700"
              >
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}