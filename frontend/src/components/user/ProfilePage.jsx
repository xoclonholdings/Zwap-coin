import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useApp, TIERS } from "@/App";
import api from "@/lib/api";
import {
  ArrowLeft,
  Crown,
  Wallet,
  Trophy,
  Footprints,
  Gamepad2,
  ShoppingBag,
  Calendar,
  Edit2,
  Check,
  X,
  Package,
  Download,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const API_BASE = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, walletAddress, setIsWalletModalOpen, refreshUser } = useApp();

  const [isEditingName, setIsEditingName] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [inventoryItems, setInventoryItems] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);

  const rawTierConfig = TIERS[user?.tier || "starter"];
  const tierConfig = {
    multiplier:
      rawTierConfig?.multiplier ??
      rawTierConfig?.zwap_multiplier ??
      1,
    dailyZptsCap:
      rawTierConfig?.dailyZptsCap ??
      rawTierConfig?.daily_zpts_cap ??
      0,
  };

  useEffect(() => {
    if (walletAddress) {
      loadInventory();
    } else {
      setInventoryItems([]);
    }
  }, [walletAddress]);

  const adjectives = [
    "Nova",
    "Pixel",
    "Quantum",
    "Echo",
    "Neon",
    "Solar",
    "Cyber",
    "Hyper",
    "Shadow",
    "Turbo",
  ];

  const nouns = [
    "Runner",
    "Walker",
    "Strider",
    "Pilot",
    "Glider",
    "Breaker",
    "Phantom",
    "Rider",
    "Explorer",
    "Voyager",
  ];

  const generateUsername = (wallet) => {
    if (!wallet) return "Guest";

    const seed = parseInt(wallet.slice(2, 10), 16);

    const adjIndex = Math.abs(seed) % adjectives.length;
    const nounIndex = Math.abs(Math.floor(seed / 8)) % nouns.length;
    const num = Math.abs(seed) % 999;

    return `${adjectives[adjIndex]}${nouns[nounIndex]}${num}`;
  };

  const displayName = user?.custom_username || generateUsername(walletAddress);

  const avatarInitials =
    displayName
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("") || "Z";

  const handleSaveUsername = async () => {
    if (!newUsername.trim()) return;

    setIsSaving(true);
    try {
      await api.updateProfile(walletAddress, newUsername.trim(), null);
      await refreshUser();
      setIsEditingName(false);
      toast.success("Username updated!");
    } catch (error) {
      toast.error("Failed to update username");
    } finally {
      setIsSaving(false);
    }
  };

  const loadInventory = async () => {
    if (!walletAddress) return;

    setInventoryLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users/${walletAddress}/inventory`);
      const data = await res.json();
      const loaded = Array.isArray(data) ? data : data?.items || [];
      setInventoryItems(loaded);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load inventory");
    } finally {
      setInventoryLoading(false);
    }
  };

  const inventoryDisplayItems = useMemo(() => {
    const deduped = [];
    const seen = new Set();
  
    for (const item of inventoryItems) {
      const dedupeKey = `${item.item_id || ""}::${item.item_name || ""}`;
  
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);
  
      deduped.push(item);
    }
  
    return deduped.map((item, idx) => ({
      key: `${item.item_id || "item"}-${idx}`,
      ...item,
    }));
  }, [inventoryItems]);

  const stats = [
    {
      label: "Total Earned",
      value: user?.total_earned?.toFixed(0) || 0,
      icon: Trophy,
      iconClass: "text-cyan-400",
    },
    {
      label: "Total Steps",
      value: user?.total_steps?.toLocaleString() || 0,
      icon: Footprints,
      iconClass: "text-green-400",
    },
    {
      label: "Games Played",
      value: user?.games_played || 0,
      icon: Gamepad2,
      iconClass: "text-purple-400",
    },
    {
      label: "Z Points",
      value: user?.zpts_balance || 0,
      icon: ShoppingBag,
      iconClass: "text-pink-400",
    },
  ];

  return (
    <div className="min-h-screen bg-[#050510] text-white">
      <div className="fixed top-0 left-0 right-0 z-40 bg-[#0a0b1e]/95 backdrop-blur-lg border-b border-cyan-500/20">
        <div className="flex items-center px-4 py-3 max-w-lg mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mr-3 text-gray-400 hover:text-white"
            type="button"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-white">Profile</h1>
        </div>
      </div>

      <div className="pt-20 pb-8 px-4 max-w-lg mx-auto">
        <motion.div
          className="glass-card p-6 rounded-2xl mb-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {walletAddress ? (
            <>
              <div className="relative inline-block mb-4">
                <motion.div
                  className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold uppercase shadow-lg border ${
                    user?.tier === "plus"
                      ? "bg-gradient-to-br from-yellow-400/30 via-amber-500/20 to-orange-500/30 border-yellow-400/40 text-yellow-200"
                      : "bg-gradient-to-br from-cyan-500/30 via-purple-500/20 to-pink-500/30 border-cyan-400/30 text-white"
                  }`}
                  animate={{
                    boxShadow:
                      user?.tier === "plus"
                        ? [
                            "0 0 20px rgba(250,204,21,0.20)",
                            "0 0 38px rgba(251,191,36,0.35)",
                            "0 0 20px rgba(250,204,21,0.20)",
                          ]
                        : [
                            "0 0 20px rgba(34,211,238,0.20)",
                            "0 0 38px rgba(168,85,247,0.30)",
                            "0 0 20px rgba(34,211,238,0.20)",
                          ],
                  }}
                  transition={{ duration: 2.4, repeat: Infinity }}
                >
                  {avatarInitials}
                </motion.div>
              </div>

              {isEditingName ? (
                <div className="flex items-center gap-2 justify-center mb-2">
                  <Input
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Enter new username"
                    className="max-w-[200px] bg-gray-800 border-gray-700"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveUsername}
                    disabled={isSaving}
                    className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center"
                    type="button"
                  >
                    <Check className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => setIsEditingName(false)}
                    className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center"
                    type="button"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 justify-center mb-1">
                  <h2 className="text-2xl font-bold text-white">{displayName}</h2>
                  <button
                    onClick={() => {
                      setNewUsername(displayName);
                      setIsEditingName(true);
                    }}
                    className="text-gray-400 hover:text-cyan-400"
                    type="button"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <p className="text-gray-500 text-sm mb-2">
                {walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}
              </p>

              <div className="flex items-center justify-center gap-2 flex-wrap">
                {user?.tier === "plus" ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-sm font-semibold">
                    <Crown className="w-4 h-4" /> Plus
                  </span>
                ) : (
                  <>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-700/50 text-gray-400 text-sm">
                      Starter
                    </span>
                    <button
                      onClick={() => navigate("/plus")}
                      className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold hover:opacity-90 transition"
                      type="button"
                    >
                      Upgrade
                    </button>
                  </>
                )}
              </div>

              <p className="text-gray-500 text-xs mt-2 flex items-center justify-center gap-1">
                <Calendar className="w-3 h-3" />
                Member since{" "}
                {new Date(user?.created_at || Date.now()).toLocaleDateString()}
              </p>
            </>
          ) : (
            <>
              <div className="w-24 h-24 rounded-full bg-gray-700/50 flex items-center justify-center mx-auto mb-4 text-4xl">
                Z
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Guest</h2>
              <p className="text-gray-400 text-sm mb-4">
                Connect your wallet to save progress
              </p>
              <Button
                onClick={() => setIsWalletModalOpen(true)}
                className="bg-gradient-to-r from-cyan-500 to-purple-500"
              >
                <Wallet className="w-4 h-4 mr-2" /> Connect Wallet
              </Button>
            </>
          )}
        </motion.div>

        {walletAddress && (
          <motion.div
            className="grid grid-cols-2 gap-3 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="glass-card p-4 rounded-xl text-center">
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${stat.iconClass}`} />
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-gray-500 text-xs">{stat.label}</p>
                </div>
              );
            })}
          </motion.div>
        )}

        <motion.div
          className="glass-card p-5 rounded-2xl mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-bold text-white mb-4">Your Benefits</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Reward Multiplier</span>
              <span className="text-cyan-400 font-bold">
                {tierConfig.multiplier}x
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Daily Z Points Cap</span>
              <span className="text-purple-400 font-bold">
                {tierConfig.dailyZptsCap}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Game Submission Portal</span>
              <span className="text-white font-bold">
                {user?.tier === "plus" ? "Unlocked" : "Plus Only"}
              </span>
            </div>
          </div>
        </motion.div>

        {walletAddress && (
          <motion.div
            className="glass-card p-5 rounded-2xl mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-cyan-400" />
                Owned Items
              </h3>

              <Button
                type="button"
                variant="outline"
                onClick={loadInventory}
                className="border-gray-700 text-gray-300"
                disabled={inventoryLoading}
              >
                {inventoryLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Refresh"
                )}
              </Button>
            </div>

            {inventoryLoading ? (
              <div className="py-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-cyan-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Loading inventory...</p>
              </div>
            ) : inventoryDisplayItems.length === 0 ? (
              <div className="rounded-xl border border-gray-800 bg-black/20 p-5 text-center">
                <p className="text-gray-400 font-medium">No owned items yet</p>
                <p className="text-gray-500 text-sm mt-1">
                  Purchases from the shop will appear here.
                </p>
                <Button
                  type="button"
                  onClick={() => navigate("/shop")}
                  className="mt-4 bg-gradient-to-r from-pink-500 to-purple-500"
                >
                  Browse Shop
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {inventoryDisplayItems.map((item) => (
                  <div
                    key={item.key}
                    className="rounded-2xl border border-gray-800 bg-black/20 p-3 flex items-start gap-3"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-cyan-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold">
                        {item.item_name || "Owned Item"}
                      </p>

                      <p className="text-gray-500 text-xs mt-1">
                        Added{" "}
                        {item.granted_at
                          ? new Date(item.granted_at).toLocaleString()
                          : "recently"}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {item.download_url && (
                          <a
                            href={item.download_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/20 text-cyan-300 text-xs"
                          >
                            <Download className="w-3 h-3" />
                            Download
                          </a>
                        )}

                        {item.external_url && (
                          <a
                            href={item.external_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/20 text-purple-300 text-xs"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Open
                          </a>
                        )}

                        {!item.download_url && !item.external_url && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-300 text-xs">
                            <Check className="w-3 h-3" />
                            Owned
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}