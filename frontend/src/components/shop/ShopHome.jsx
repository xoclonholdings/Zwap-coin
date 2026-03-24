import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Crown,
  Package,
  RefreshCw,
  ShoppingBag,
  Sparkles,
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
    ? "Plus"
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
      className="min-h-[calc(100dvh-140px)] bg-[#081017] px-4 py-4 text-white"
      data-testid="shop-tab"
    >
      <div className="mx-auto w-full max-w-md space-y-4">
        <div className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.14),_transparent_30%),linear-gradient(180deg,rgba(11,10,24,0.96),rgba(9,12,18,0.98))] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">
                  Shop
                </p>

                <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[11px] font-medium text-amber-300">
                  {tierLabel(balances?.tier)}
                </div>
              </div>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                Spend &amp; Redeem
              </h1>
              <p className="mt-1 text-sm text-white/55">
                Turn rewards into real value.
              </p>
            </div>

            <button
              type="button"
              onClick={onRefresh}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/10"
            >
              <RefreshCw className="h-5 w-5 text-violet-300" />
            </button>
          </div>

          <div className="mb-4 grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-white/45">
                ZWAP
              </p>
              <p className="mt-1 text-sm font-medium text-violet-300">
                {Number(balances?.zwap || 0).toFixed(2)}
              </p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-white/45">
                zPts
              </p>
              <p className="mt-1 text-sm font-medium text-cyan-300">
                {Number(balances?.zpts || 0).toLocaleString()}
              </p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-white/45">
                Status
              </p>
              <p className="mt-1 text-sm font-medium text-white/85">
                {items?.length ? "Ready" : "Locked"}
              </p>
            </div>
          </div>

          <div className="rounded-[24px] border border-cyan-400/12 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.10),_transparent_32%),linear-gradient(180deg,rgba(8,16,23,0.96),rgba(7,12,18,0.98))] p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-white/45">
                  Marketplace
                </p>
                <h3 className="mt-1 text-lg font-semibold text-white">
                  Reward Catalog
                </h3>
              </div>

              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
                Live Items
              </div>
            </div>

            <p className="mb-4 text-sm text-white/55">
              Browse categories, shuffle rewards, and open items to redeem.
            </p>

            <div className="mb-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {orderedSections.map((category) => {
                const isActive = activeCategory === category;

                return (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium transition ${
                      isActive
                        ? "border border-cyan-400/18 bg-cyan-400/10 text-cyan-300"
                        : "border border-white/8 bg-white/[0.03] text-white/55 hover:text-white"
                    }`}
                    type="button"
                  >
                    {String(category).replaceAll("_", " ")}
                  </button>
                );
              })}
            </div>

            <div className="rounded-[22px] border border-cyan-400/14 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_26%),linear-gradient(180deg,rgba(8,16,23,0.94),rgba(7,12,18,0.98))] p-3">
              {isLoading ? (
                <div className="flex items-center justify-center rounded-2xl border border-white/8 bg-black/20 px-4 py-10 text-white/55">
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Loading shop...
                </div>
              ) : currentItem ? (
                <div className="relative">
                  {marketplaceItems.length > 1 ? (
                    <>
                      <button
                        type="button"
                        onClick={prevItem}
                        className="absolute left-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white hover:bg-cyan-400/10"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={nextItem}
                        className="absolute right-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white hover:bg-cyan-400/10"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </>
                  ) : null}

                  <AnimatePresence mode="wait">
                    <motion.button
                      key={currentItem.id || currentItem._id}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, x: 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -18 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => onOpenItem(currentItem)}
                      className="w-full rounded-[22px] border border-cyan-400/12 bg-cyan-400/[0.05] p-3 text-left transition hover:bg-cyan-400/[0.09]"
                      type="button"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/25">
                          {currentItem.image_url ? (
                            <img
                              src={currentItem.image_url}
                              alt={currentItem.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ShoppingBag className="h-8 w-8 text-white/25" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="truncate text-[15px] font-semibold text-white">
                              {currentItem.name}
                            </h3>

                            {currentItem.plus_only ? (
                              <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                                Plus
                              </span>
                            ) : null}
                          </div>

                          <p className="mt-1 line-clamp-2 text-sm text-white/60">
                            {currentItem.description ||
                              "Redeem your rewards for something worth having."}
                          </p>

                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-[11px] font-medium text-cyan-300">
                              {String(activeCategory || "Marketplace").replaceAll("_", " ")}
                            </span>

                            <span className="text-sm font-medium text-white">
                              {getDisplayPrice(currentItem)}
                            </span>
                          </div>

                          <div className="mt-1 flex items-center justify-between">
                            <p className="text-[11px] uppercase tracking-wide text-white/35">
                              {ownedItemIds.has(currentItem.id) ? "Owned item" : "Tap to view"}
                            </p>

                            <span className="text-[11px] text-white/45">
                              Open
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  </AnimatePresence>

                  {marketplaceItems.length > 1 ? (
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
                  ) : null}
                </div>
              ) : (
                <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-8 text-center">
                  <p className="text-sm text-white/60">
                    No items in this section yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {paymentSuccess && purchasedItem ? (
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
                {purchasedItem.download_url ? (
                  <a
                    href={purchasedItem.download_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/20 px-4 py-2 text-cyan-300 hover:bg-cyan-500/30"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </a>
                ) : null}

                {purchasedItem.external_url ? (
                  <a
                    href={purchasedItem.external_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/20 px-4 py-2 text-purple-300 hover:bg-purple-500/30"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Item
                  </a>
                ) : null}

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
          ) : null}
        </AnimatePresence>

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

        <ShopPortal isPlus={String(user?.tier || "").toLowerCase() === "plus"} />

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