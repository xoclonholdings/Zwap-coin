import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useApp, TIERS } from "@/App";
import api from "@/lib/api";
import {
  ArrowLeft,
  Trophy,
  Footprints,
  Gamepad2,
  ShoppingBag,
  Package,
  Download,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import BadgeStrip from "@/components/user/profile/BadgeStrip";
import WalletCard from "@/components/user/profile/WalletCard";
import ProfileIdentityCard from "@/components/user/profile/ProfileIdentityCard";
import { generateUsername } from "@/lib/utils/generateUsername";

const API_BASE = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ProfilePage({ onClose }) {
  const navigate = useNavigate();
  const {
    user,
    authUser,
    walletAddress,
    onchainBalance,
    setIsWalletModalOpen,
    refreshUser,
  } = useApp();

  const [isEditingName, setIsEditingName] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [inventoryItems, setInventoryItems] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);

  const safeUser = user && typeof user === "object" ? user : null;
  const safeAuthUser = authUser && typeof authUser === "object" ? authUser : null;

  const rawTierConfig = TIERS[safeUser?.tier || "starter"];
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

  const displayName = useMemo(() => {
    return (
      generateUsername({
        username: safeUser?.username || safeUser?.custom_username || safeAuthUser?.username,
        walletAddress: walletAddress || safeUser?.wallet_address,
        email: safeAuthUser?.email || safeUser?.email,
      }) || ""
    );
  }, [safeUser, safeAuthUser, walletAddress]);

  const avatarInitials = useMemo(() => {
    const cleaned = String(displayName || "")
      .replace(/[^a-zA-Z0-9 ]/g, " ")
      .trim();

    if (!cleaned) return "Z";

    const parts = cleaned.split(/\s+/).filter(Boolean);

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    return cleaned.slice(0, 2).toUpperCase();
  }, [displayName]);

  const handleSaveUsername = async () => {
    if (!walletAddress || !newUsername.trim()) return;

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
      value: safeUser?.total_earned?.toFixed(0) || 0,
      icon: Trophy,
      iconClass: "text-cyan-400",
    },
    {
      label: "Total Steps",
      value: safeUser?.total_steps?.toLocaleString() || 0,
      icon: Footprints,
      iconClass: "text-green-400",
    },
    {
      label: "Games Played",
      value: safeUser?.games_played || 0,
      icon: Gamepad2,
      iconClass: "text-purple-400",
    },
    {
      label: "zPts",
      value: safeUser?.zpts_balance || 0,
      icon: ShoppingBag,
      iconClass: "text-pink-400",
    },
  ];

  const earnedBadgeIds = safeUser?.earned_badges || [];

  const badgeProgress = {
    daily_logins: Math.min((safeUser?.daily_logins || 0) / 7, 1),
    rings_completed: Math.min((safeUser?.rings_completed || 0) / 7, 1),
    step_sessions: Math.min((safeUser?.step_sessions || 0) / 10, 1),
    sustained_movement_days: Math.min(
      (safeUser?.sustained_movement_days || 0) / 14,
      1
    ),
    assists_sent: Math.min((safeUser?.assists_sent || 0) / 5, 1),
    deep_engagement_actions: Math.min(
      (safeUser?.deep_engagement_actions || 0) / 10,
      1
    ),
    zpts_earned_total: Math.min((safeUser?.zpts_earned_total || 0) / 1000, 1),
    referrals_completed: Math.min((safeUser?.referrals_completed || 0) / 3, 1),
    modules_completed: Math.min((safeUser?.modules_completed || 0) / 5, 1),
  };

  return (
    <div className="h-full overflow-y-auto bg-[#050510] text-white">
      <div className="sticky top-0 z-40 border-b border-cyan-500/20 bg-[#0a0b1e]/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center px-4 py-3">
          <button
            onClick={onClose}
            className="mr-3 text-gray-400 hover:text-white"
            type="button"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-bold text-white">Profile</h1>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 pb-8 pt-6">
        <div className="space-y-6">
          <ProfileIdentityCard
            displayName={displayName}
            avatarInitials={avatarInitials}
            walletAddress={walletAddress}
            email={safeAuthUser?.email}
            createdAt={safeUser?.created_at}
            isEditingName={isEditingName}
            newUsername={newUsername}
            isSaving={isSaving}
            onStartEdit={() => {
              setNewUsername(displayName);
              setIsEditingName(true);
            }}
            onCancelEdit={() => setIsEditingName(false)}
            onChangeUsername={setNewUsername}
            onSaveUsername={handleSaveUsername}
            onConnectWallet={() => setIsWalletModalOpen(true)}
          />

          <WalletCard
            walletAddress={walletAddress}
            zwapBalance={onchainBalance}
            zptsBalance={safeUser?.zpts_balance || 0}
            onConnectWallet={() => setIsWalletModalOpen(true)}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
          >
            <BadgeStrip
              title="Badges"
              earnedBadgeIds={earnedBadgeIds}
              badgeProgress={badgeProgress}
            />
          </motion.div>

          {walletAddress ? (
            <motion.div
              className="grid grid-cols-2 gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={i}
                    className="glass-card rounded-xl p-4 text-center"
                  >
                    <Icon className={`mx-auto mb-2 h-6 w-6 ${stat.iconClass}`} />
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                );
              })}
            </motion.div>
          ) : null}

          <motion.div
            className="glass-card mt-6 rounded-2xl p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="mb-4 text-lg font-bold text-white">Your Benefits</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Reward Multiplier</span>
                <span className="font-bold text-cyan-400">
                  {tierConfig.multiplier}x
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Daily zPts Cap</span>
                <span className="font-bold text-purple-400">
                  {tierConfig.dailyZptsCap}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Developer Portal</span>
                <span className="font-bold text-white">
                  Free + Approval Based
                </span>
              </div>
            </div>
          </motion.div>

          {walletAddress ? (
            <motion.div
              className="glass-card mt-6 rounded-2xl p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                  <Package className="h-5 w-5 text-cyan-400" />
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
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Refresh"
                  )}
                </Button>
              </div>

              {inventoryLoading ? (
                <div className="py-8 text-center">
                  <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-cyan-400" />
                  <p className="text-sm text-gray-500">Loading inventory...</p>
                </div>
              ) : inventoryDisplayItems.length === 0 ? (
                <div className="rounded-xl border border-gray-800 bg-black/20 p-5 text-center">
                  <p className="font-medium text-gray-400">No owned items yet</p>
                  <p className="mt-1 text-sm text-gray-500">
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
                      className="flex items-start gap-3 rounded-2xl border border-gray-800 bg-black/20 p-3"
                    >
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-gray-800 bg-gray-900">
                        <Package className="h-5 w-5 text-cyan-400" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-white">
                          {item.item_name || "Owned Item"}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Added{" "}
                          {item.granted_at
                            ? new Date(item.granted_at).toLocaleString()
                            : "recently"}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.download_url ? (
                            <a
                              href={item.download_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-full border border-cyan-500/20 bg-cyan-500/15 px-3 py-1 text-xs text-cyan-300"
                            >
                              <Download className="h-3 w-3" />
                              Download
                            </a>
                          ) : null}

                          {item.external_url ? (
                            <a
                              href={item.external_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-full border border-purple-500/20 bg-purple-500/15 px-3 py-1 text-xs text-purple-300"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Open
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
