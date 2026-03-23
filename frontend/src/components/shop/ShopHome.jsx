import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Crown,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Wallet,
  Coins,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ShopCategoryCarousel from "@/components/shop/ShopCategoryCarousel";
import ShopPortal from "@/components/shop/ShopPortal";
import ShopRewardsFeedback from "@/components/shop/ShopRewardsFeedback";

const CATEGORY_ORDER = [
  "Featured",
  "Digital",
  "Rewards",
  "Boosts",
  "Subscriptions",
  "All",
];

function normalizeCategory(item) {
  const raw =
    item?.category ||
    item?.subcategory ||
    (item?.is_featured ? "Featured" : null) ||
    "Rewards";

  const value = String(raw).trim().toLowerCase();

  if (value.includes("feature")) return "Featured";
  if (value.includes("digital")) return "Digital";
  if (value.includes("reward")) return "Rewards";
  if (value.includes("boost")) return "Boosts";
  if (value.includes("sub")) return "Subscriptions";

  return "Rewards";
}

function tierBadgeLabel(tier) {
  return String(tier || "starter").toLowerCase() === "plus"
    ? "Plus Member"
    : "Starter";
}

export default function ShopHome({
  user,
  loading,
  items,
  balances,
  purchasingId,
  feedback,
  onDismissFeedback,
  onPurchase,
  onRefresh,
  onOpenPlus,
  onOpenSponsored,
}) {
  const grouped = useMemo(() => {
    const base = {
      Featured: [],
      Digital: [],
      Rewards: [],
      Boosts: [],
      Subscriptions: [],
      All: items || [],
    };

    (items || []).forEach((item) => {
      const category = normalizeCategory(item);
      if (!base[category]) base[category] = [];
      base[category].push(item);

      if (item?.is_featured && !base.Featured.includes(item)) {
        base.Featured.push(item);
      }
    });

    if (base.Featured.length === 0) {
      base.Featured = (items || []).slice(0, 6);
    }

    return base;
  }, [items]);

  const spendableLabel = useMemo(() => {
    const zwap = Number(balances?.zwap || 0);
    const zpts = Number(balances?.zpts || 0);
    return zwap > 0 || zpts > 0 ? "Ready to redeem" : "Earn to unlock rewards";
  }, [balances]);

  return (
    <div
      className="min-h-[calc(100dvh-140px)] bg-[#081017] px-4 py-4 text-white"
      data-testid="shop-tab"
    >
      <div className="mx-auto w-full max-w-md space-y-4">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,#14273a_0%,#0b1420_48%,#081017_100%)] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_20px_60px_rgba(0,0,0,0.45)]"
        >
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.10),transparent_38%,rgba(168,85,247,0.10)_72%,transparent)]" />
          <div className="relative space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-cyan-400/25 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">
                    Shop
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-violet-400/25 bg-violet-400/10 px-2.5 py-1 text-[11px] font-semibold text-violet-200">
                    <Crown className="h-3.5 w-3.5" />
                    {tierBadgeLabel(balances?.tier)}
                  </span>
                </div>

                <div>
                  <h1 className="text-[28px] font-semibold leading-tight tracking-tight">
                    Spend &amp; Redeem
                  </h1>
                  <p className="mt-1 text-sm text-white/68">
                    Turn rewards into real value.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={onRefresh}
                className="shrink-0 rounded-2xl border border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-[22px] border border-cyan-400/15 bg-cyan-400/8 p-3 shadow-[0_0_25px_rgba(34,211,238,0.08)]">
                <div className="mb-2 flex items-center gap-2 text-cyan-200/90">
                  <Wallet className="h-4 w-4" />
                  <span className="text-[11px] uppercase tracking-[0.18em]">
                    ZWAP
                  </span>
                </div>
                <div className="text-lg font-semibold">
                  {Number(balances?.zwap || 0).toLocaleString()}
                </div>
              </div>

              <div className="rounded-[22px] border border-emerald-400/15 bg-emerald-400/8 p-3 shadow-[0_0_25px_rgba(16,185,129,0.08)]">
                <div className="mb-2 flex items-center gap-2 text-emerald-200/90">
                  <Coins className="h-4 w-4" />
                  <span className="text-[11px] uppercase tracking-[0.18em]">
                    zPts
                  </span>
                </div>
                <div className="text-lg font-semibold">
                  {Number(balances?.zpts || 0).toLocaleString()}
                </div>
              </div>

              <div className="rounded-[22px] border border-violet-400/15 bg-violet-400/8 p-3 shadow-[0_0_25px_rgba(168,85,247,0.08)]">
                <div className="mb-2 flex items-center gap-2 text-violet-200/90">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-[11px] uppercase tracking-[0.18em]">
                    Status
                  </span>
                </div>
                <div className="text-sm font-semibold leading-snug">
                  {spendableLabel}
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <ShopPortal
          isPlus={String(balances?.tier || "").toLowerCase() === "plus"}
          onOpenPlus={onOpenPlus}
          onOpenSponsored={onOpenSponsored}
        />

        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <ShoppingBag className="h-4 w-4 text-cyan-300" />
            <h2 className="text-base font-semibold">Marketplace</h2>
          </div>

          {CATEGORY_ORDER.map((category) => {
            const categoryItems = grouped?.[category] || [];
            if (!categoryItems.length) return null;

            return (
              <ShopCategoryCarousel
                key={category}
                title={category}
                items={categoryItems}
                loading={loading}
                purchasingId={purchasingId}
                onPurchase={onPurchase}
              />
            );
          })}
        </section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="rounded-[26px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.28)]"
        >
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-300" />
            <h3 className="text-sm font-semibold">Trending rewards</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(items || []).slice(0, 4).map((item, index) => (
              <div
                key={item?._id || item?.id || `${item?.name}-${index}`}
                className="rounded-[20px] border border-white/10 bg-[#0d1622] p-3"
              >
                <div className="truncate text-sm font-medium text-white">
                  {item?.name || "Reward"}
                </div>
                <div className="mt-1 text-xs text-white/55">
                  {index === 0
                    ? "Most viewed"
                    : index === 1
                    ? "Popular pick"
                    : index === 2
                    ? "Fast redeem"
                    : "Community favorite"}
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      </div>

      <ShopRewardsFeedback feedback={feedback} onDismiss={onDismissFeedback} />
    </div>
  );
}

