import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Crown,
  Package,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Wallet,
  Coins,
  Download,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ZUPREME_LOGO } from "@/App";
import ShopPortal from "@/components/shop/ShopPortal";

const DISPLAY_ORDER = ["Featured", "All"];

function tierLabel(tier) {
  return String(tier || "starter").toLowerCase() === "plus"
    ? "Starter"
    : "Starter";
}

function getPaymentMethod(item) {
  if (!item) return "zwap";
  if (item.payment_method) return item.payment_method;
  if (item.price_stripe && Number(item.price_stripe) > 0) return "stripe";
  if (
    item.price_zpts &&
    Number(item.price_zpts) > 0 &&
    (!item.price_zwap || Number(item.price_zwap) === 0)
  ) {
    return "zpts";
  }
  return "zwap";
}

function getDisplayPrice(item) {
  if (!item) return "";
  const method = getPaymentMethod(item);

  if (method === "stripe") {
    return `$${Number(item.price_stripe || 0).toFixed(2)}`;
  }
  if (method === "zpts") {
    return `${Number(item.price_zpts || 0)} zPts`;
  }
  return `${Number(item.price_zwap || 0)} ZWAP`;
}

export default function ShopHome({
  user,
  isLoading,
  balances,
  items,
  groupedItems,
  categories,
  activeCategory,
  setActiveCategory,
  ownedItemIds,
  paymentSuccess,
  purchasedItem,
  onClearSuccess,
  onOpenInventory,
  onRefresh,
  onOpenItem,
}) {
  const [carouselIndex, setCarouselIndex] = useState(0);

  const orderedSections = useMemo(() => {
    return [
      ...DISPLAY_ORDER.filter((key) => groupedItems?.[key]?.length),
      ...categories.filter((key) => groupedItems?.[key]?.length),
    ].filter((value, index, arr) => arr.indexOf(value) === index);
  }, [groupedItems, categories]);

  const marketplaceItems = groupedItems?.[activeCategory] || [];
  const currentItem = marketplaceItems[carouselIndex] || null;

  useEffect(() => {
    setCarouselIndex(0);
  }, [activeCategory]);

  const nextItem = () => {
    if (marketplaceItems.length <= 1) return;
    setCarouselIndex((prev) => (prev + 1) % marketplaceItems.length);
  };

  const prevItem = () => {
    if (marketplaceItems.length <= 1) return;
    setCarouselIndex((prev) =>
      prev === 0 ? marketplaceItems.length - 1 : prev - 1
    );
  };

  return (
    <div
      className="min-h-[calc(100dvh-160px)] bg-[#081017] px-4 py-4 text-white"
      data-testid="shop-tab"
    >
      <div className="mx-auto w-full max-w-md space-y-4">
        {/* HERO */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,#15283b_0%,#0c1621_45%,#081017_100%)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
        >
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.08),transparent_35%,rgba(168,85,247,0.10)_70%,transparent)]" />

          <div className="relative space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200">
                    Shop
                  </span>

                  <span className="inline-flex items-center gap-1 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-2.5 py-1 text-[11px] font-semibold text-yellow-200">
                    <Crown className="h-3.5 w-3.5" />
                    {tierLabel(balances?.tier)}
                  </span>
                </div>

                <div>
                  <h1 className="text-[28px] font-semibold leading-tight tracking-tight">
                    Spend &amp; Redeem
                  </h1>
                  <p className="mt-1 text-sm text-white/65">
                    Turn rewards into real value.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={onRefresh}
                className="rounded-2xl border border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-[22px] border border-cyan-400/15 bg-cyan-400/10 p-3 shadow-[0_0_24px_rgba(34,211,238,0.08)]">
                <div className="mb-2 flex items-center gap-2 text-cyan-200/90">
                  <Wallet className="h-4 w-4" />
                  <span className="text-[11px] uppercase tracking-[0.16em]">ZWAP</span>
                </div>
                <div className="text-lg font-semibold">
                  {Number(balances?.zwap || 0).toFixed(2)}
                </div>
              </div>

              <div className="rounded-[22px] border border-emerald-400/15 bg-emerald-400/10 p-3 shadow-[0_0_24px_rgba(16,185,129,0.08)]">
                <div className="mb-2 flex items-center gap-2 text-emerald-200/90">
                  <Coins className="h-4 w-4" />
                  <span className="text-[11px] uppercase tracking-[0.16em]">zPts</span>
                </div>
                <div className="text-lg font-semibold">
                  {Number(balances?.zpts || 0).toLocaleString()}
                </div>
              </div>

              <div className="rounded-[22px] border border-violet-400/15 bg-violet-400/10 p-3 shadow-[0_0_24px_rgba(168,85,247,0.08)]">
                <div className="mb-2 flex items-center gap-2 text-violet-200/90">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-[11px] uppercase tracking-[0.16em]">Status</span>
                </div>
                <div className="text-sm font-semibold leading-snug">
                  {items?.length ? "Ready to redeem" : "Earn to unlock rewards"}
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* SUCCESS BANNER */}
        <AnimatePresence>
          {paymentSuccess && purchasedItem && (
            <motion.div
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              className="rounded-[26px] border border-emerald-500/30 bg-emerald-500/10 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.25)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/20">
                    <Check className="h-5 w-5 text-emerald-400" />
                  </div>

                  <div>
                    <p className="font-semibold text-emerald-300">Purchase successful</p>
                    <h3 className="text-lg font-bold text-white">{purchasedItem.name}</h3>
                    <p className="text-sm text-gray-300">
                      This item has been added to your inventory.
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClearSuccess}
                  className="text-sm text-gray-400 hover:text-white"
                  type="button"
                >
                  Close
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {purchasedItem.download_url && (
                  <a
                    href={purchasedItem.download_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/20 px-4 py-2 text-cyan-300 hover:bg-cyan-500/30"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </a>
                )}

                {purchasedItem.external_url && (
                  <a
                    href={purchasedItem.external_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/20 px-4 py-2 text-purple-300 hover:bg-purple-500/30"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Item
                  </a>
                )}

                <Button
                  type="button"
                  onClick={onOpenInventory}
                  className="bg-[linear-gradient(135deg,#ec4899,#8b5cf6)]"
                >
                  <Package className="mr-2 h-4 w-4" />
                  View Inventory
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ZUPREME STRIP */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[24px] border border-pink-500/20 bg-[linear-gradient(135deg,rgba(236,72,153,0.10),rgba(139,92,246,0.08),rgba(8,16,23,0.94))] px-4 py-3 shadow-[0_0_24px_rgba(236,72,153,0.10)]"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.18em] text-pink-200/80">
                External Store
              </p>
              <div className="mt-1 flex items-center gap-3">
                <img
                  src={ZUPREME_LOGO}
                  alt="Zupreme Imports"
                  className="h-9 w-auto object-contain"
                  style={{
                    filter: "drop-shadow(0 0 12px rgba(236,72,153,0.25))",
                  }}
                />
                <p className="text-xs text-white/60">
                  Your commerce portal for branded goods and store-linked rewards.
                </p>
              </div>
            </div>

            <div className="shrink-0 rounded-full border border-white/10 bg-white/5 p-2">
              <Store className="h-4 w-4 text-pink-300" />
            </div>
          </div>
        </motion.div>

        {/* TOP UTILITY */}
        <div className="flex items-center justify-between gap-3">
          <div className="rounded-[20px] border border-white/10 bg-white/[0.04] px-3 py-2 shadow-[0_12px_24px_rgba(0,0,0,0.18)]">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-cyan-300">
                {Number(user?.zwap_balance || 0).toFixed(2)} ZWAP
              </span>
              <span className="text-white/20">|</span>
              <span className="text-sm font-semibold text-purple-300">
                {user?.zpts_balance || 0} zPts
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={onOpenInventory}
            className="border-pink-500/30 text-pink-300 hover:bg-pink-500/10"
          >
            <Package className="mr-2 h-4 w-4" />
            My Inventory
          </Button>
        </div>

        {/* MARKETPLACE FIRST */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <ShoppingBag className="h-4 w-4 text-emerald-300" />
            <h2 className="text-base font-semibold">Marketplace</h2>
          </div>

          <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(32,48,74,0.55),rgba(10,16,23,0.96))] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <div className="rounded-[24px] border border-cyan-400/12 bg-[radial-gradient(circle_at_top,#20375a_0%,#101926_46%,#0a1017_100%)] p-3">
              <div className="mb-3 flex gap-2 overflow-x-auto no-scrollbar">
                {orderedSections.map((category) => {
                  const isActive = activeCategory === category;

                  return (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-cyan-400/25 to-violet-400/25 text-white border border-cyan-300/30 shadow-[0_0_18px_rgba(34,211,238,0.18)]"
                          : "border border-white/10 bg-white/[0.03] text-white/60 hover:border-cyan-400/25 hover:text-white"
                      }`}
                      type="button"
                    >
                      {String(category).replaceAll("_", " ")}
                    </button>
                  );
                })}
              </div>

              <div className="rounded-[24px] border border-white/10 bg-[#0b1320] p-3 shadow-inner">
                {isLoading ? (
                  <div className="flex min-h-[280px] items-center justify-center text-white/55">
                    Loading shop...
                  </div>
                ) : currentItem ? (
                  <div className="relative">
                    {marketplaceItems.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={prevItem}
                          className="absolute left-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white hover:bg-cyan-500/20"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>

                        <button
                          type="button"
                          onClick={nextItem}
                          className="absolute right-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white hover:bg-cyan-500/20"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </>
                    )}

                    <AnimatePresence mode="wait">
                      <motion.button
                        key={currentItem.id || currentItem._id}
                        initial={{ opacity: 0, x: 18 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -18 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => onOpenItem(currentItem)}
                        className="w-full text-left"
                        type="button"
                      >
                        <div className="overflow-hidden rounded-[24px] border border-cyan-400/12 bg-[linear-gradient(180deg,rgba(21,34,53,0.86),rgba(8,16,23,0.98))] shadow-[0_0_24px_rgba(34,211,238,0.08)]">
                          <div className="relative aspect-[16/10] overflow-hidden">
                            {currentItem.image_url ? (
                              <img
                                src={currentItem.image_url}
                                alt={currentItem.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-[#0d1622]">
                                <ShoppingBag className="h-12 w-12 text-white/20" />
                              </div>
                            )}

                            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#081017] to-transparent" />

                            {currentItem.plus_only && (
                              <div className="absolute right-3 top-3 rounded-full border border-yellow-400/20 bg-yellow-400/15 px-2.5 py-1 text-xs font-semibold text-yellow-200">
                                Plus
                              </div>
                            )}

                            {ownedItemIds.has(currentItem.id) && (
                              <div className="absolute left-3 top-3 rounded-full border border-emerald-400/20 bg-emerald-400/15 px-2.5 py-1 text-xs font-semibold text-emerald-200">
                                Owned
                              </div>
                            )}
                          </div>

                          <div className="space-y-3 p-4">
                            <div>
                              <div className="flex items-center justify-between gap-3">
                                <h3 className="line-clamp-1 text-xl font-semibold text-white">
                                  {currentItem.name}
                                </h3>
                                <span className="rounded-full border border-cyan-400/15 bg-cyan-400/10 px-2.5 py-1 text-xs font-semibold text-cyan-200">
                                  {getDisplayPrice(currentItem)}
                                </span>
                              </div>

                              <p className="mt-2 line-clamp-2 text-sm text-white/62">
                                {currentItem.description || "Redeem your rewards for something worth having."}
                              </p>
                            </div>

                            <div className="flex items-center justify-between gap-3">
                              <div className="text-xs uppercase tracking-[0.18em] text-white/35">
                                {String(activeCategory || "Marketplace").replaceAll("_", " ")}
                              </div>

                              <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/80">
                                Tap to view
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    </AnimatePresence>

                    {marketplaceItems.length > 1 && (
                      <div className="mt-3 flex justify-center gap-2">
                        {marketplaceItems.map((item, idx) => (
                          <button
                            key={item.id || item._id || idx}
                            onClick={() => setCarouselIndex(idx)}
                            className={`h-2 rounded-full transition-all ${
                              idx === carouselIndex
                                ? "w-6 bg-cyan-400"
                                : "w-2 bg-white/20 hover:bg-white/35"
                            }`}
                            type="button"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex min-h-[280px] items-center justify-center text-center text-white/45">
                    No items in this section yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* SPONSORED SECOND */}
        <ShopPortal isPlus={String(user?.tier || "").toLowerCase() === "plus"} />

        {/* TRENDING */}
        <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-300" />
            <p className="text-sm font-semibold text-white">Trending rewards</p>
          </div>
          <p className="text-sm leading-relaxed text-white/65">
            Marketplace picks, premium drops, and reward destinations rotate here as the catalog grows.
          </p>
        </div>

        <div className="border-t border-gray-800/50 py-3 text-center">
          <p className="text-xs text-gray-500">💎 1000 Z Points = 1 ZWAP</p>
        </div>
      </div>
    </div>
  );
}