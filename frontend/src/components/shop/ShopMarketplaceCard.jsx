import React, { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import { ZUPREME_LOGO } from "@/App";
import ShopPurchaseDialog from "@/components/shop/ShopPurchaseDialog";

const SHOP_CATEGORIES = [
  "Sponsored",
  "Digital",
  "Rewards",
  "Subscriptions",
  "Merch",
  "Bundles",
];

function normalizeCategory(value) {
  return String(value || "").trim().toLowerCase();
}

function filterItemsByCategory(items, category) {
  return (items || []).filter((item) => {
    const itemCategory = normalizeCategory(item?.category);
    const itemType = normalizeCategory(item?.type);
    const deliveryType = normalizeCategory(item?.delivery_type);
    const source = normalizeCategory(item?.source);

    switch (category) {
      case "Sponsored":
        return (
          item?.is_sponsored === true ||
          itemCategory === "sponsor" ||
          itemCategory === "sponsored" ||
          source === "sponsor" ||
          source === "sponsored"
        );

      case "Digital":
        return (
          itemCategory === "digital" ||
          itemType === "ebook" ||
          itemType === "download" ||
          deliveryType === "digital"
        );

      case "Rewards":
        return itemCategory === "reward" || itemCategory === "rewards";

      case "Subscriptions":
        return (
          itemCategory === "subscription" ||
          itemCategory === "subscriptions" ||
          itemType === "subscription" ||
          item?.is_subscription === true
        );

      case "Merch":
        return (
          itemCategory === "merch" ||
          itemType === "physical" ||
          deliveryType === "physical"
        );

      case "Bundles":
        return (
          itemCategory === "bundle" ||
          itemCategory === "bundles" ||
          itemType === "bundle" ||
          Array.isArray(item?.bundle_items)
        );

      default:
        return false;
    }
  });
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

export default function ShopPortal({
  items = [],
  user,
  ownedItemIds,
  isLoading = false,
  isPurchasing = false,
  purchaseSuccess = false,
  canAffordZwap,
  canAffordZpts,
  onRefresh,
  onPurchase,
  onStripeCheckout,
  onViewInventory,
}) {
  const [activeCategory, setActiveCategory] = useState("Sponsored");
  const [carouselIndex, setCarouselIndex] = useState(0);

  const [selectedItem, setSelectedItem] = useState(null);
  const [paymentType, setPaymentType] = useState("zwap");

  const groupedItems = useMemo(() => {
    const groups = {};
    SHOP_CATEGORIES.forEach((category) => {
      groups[category] = filterItemsByCategory(items, category);
    });
    return groups;
  }, [items]);

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

  const openItem = useCallback((item) => {
    setSelectedItem(item);
    setPaymentType(getPaymentMethod(item));
  }, []);

  const closeItem = useCallback(() => {
    setSelectedItem(null);
    setPaymentType("zwap");
  }, []);

  const selectedPaymentMethod = getPaymentMethod(selectedItem);
  const selectedItemOwned = selectedItem
    ? ownedItemIds?.has(selectedItem.id || selectedItem._id)
    : false;

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,16,23,0.96),rgba(8,12,18,0.98))] p-4 backdrop-blur-sm"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-white/45">
              Marketplace
            </p>
            <h3 className="mt-1 text-lg font-semibold text-white">
              Marketplace
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRefresh}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            <div className="rounded-[18px] border border-pink-500/20 bg-[linear-gradient(135deg,rgba(236,72,153,0.10),rgba(139,92,246,0.08),rgba(8,16,23,0.94))] px-3 py-2">
              <img
                src={ZUPREME_LOGO}
                alt="Zupreme Imports"
                className="h-8 w-auto object-contain"
                style={{
                  filter: "drop-shadow(0 0 12px rgba(236,72,153,0.22))",
                }}
              />
            </div>
          </div>
        </div>

        <div className="mb-3 flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={prevItem}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/25 text-white hover:bg-white/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {SHOP_CATEGORIES.map((category) => {
            const isActive = activeCategory === category;

            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`whitespace-nowrap rounded-2xl px-4 py-3 text-xs font-medium transition ${
                  isActive
                    ? "border border-cyan-400/18 bg-cyan-400/10 text-cyan-300"
                    : "border border-white/8 bg-white/[0.03] text-white/55 hover:text-white"
                }`}
              >
                {category}
              </button>
            );
          })}

          <button
            type="button"
            onClick={nextItem}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/25 text-white hover:bg-white/10"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="rounded-[22px] bg-white/[0.03] p-3">
          {isLoading ? (
            <div className="flex min-h-[360px] items-center justify-center rounded-[22px] bg-black/20 text-white/55">
              Loading shop...
            </div>
          ) : currentItem ? (
            <div className="space-y-4">
              <AnimatePresence mode="wait">
                <motion.button
                  key={currentItem.id || currentItem._id}
                  whileTap={{ scale: 0.985 }}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => openItem(currentItem)}
                  className="w-full overflow-hidden rounded-[24px] bg-cyan-400/[0.05] text-left transition hover:bg-cyan-400/[0.09]"
                  type="button"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-black/25">
                    {currentItem.image_url ? (
                      <img
                        src={currentItem.image_url}
                        alt={currentItem.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ShoppingBag className="h-12 w-12 text-white/20" />
                      </div>
                    )}
                  </div>
                </motion.button>
              </AnimatePresence>

              <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="truncate text-lg font-semibold text-white">
                      {currentItem.name}
                    </h4>
                    <p className="mt-1 line-clamp-2 text-sm text-white/60">
                      {currentItem.description ||
                        "Redeem your rewards for something worth having."}
                    </p>
                  </div>

                  <div className="shrink-0 rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-200">
                    {getDisplayPrice(currentItem)}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="text-[11px] font-medium uppercase tracking-wide text-cyan-300">
                    {activeCategory}
                  </div>

                  <div className="text-[11px] uppercase tracking-wide text-white/35">
                    {ownedItemIds?.has(currentItem.id || currentItem._id)
                      ? "Owned item"
                      : "Tap to view"}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => openItem(currentItem)}
                className="w-full rounded-[20px] bg-[linear-gradient(135deg,#7cc36d,#8bd06c)] px-4 py-4 text-center text-2xl font-semibold text-[#081017]"
              >
                Purchase
              </button>

              {marketplaceItems.length > 1 ? (
                <div className="flex justify-center gap-2">
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
            <div className="rounded-[22px] bg-black/20 px-4 py-12 text-center">
              <p className="text-sm text-white/60">
                No items in this section yet.
              </p>
            </div>
          )}
        </div>
      </motion.section>

      <ShopPurchaseDialog
        selectedItem={selectedItem}
        selectedPaymentMethod={selectedPaymentMethod}
        selectedItemOwned={selectedItemOwned}
        purchaseSuccess={purchaseSuccess}
        isPurchasing={isPurchasing}
        paymentType={paymentType}
        setPaymentType={setPaymentType}
        canAffordZwap={canAffordZwap}
        canAffordZpts={canAffordZpts}
        user={user}
        onClose={closeItem}
        onPurchase={() => onPurchase?.(selectedItem, paymentType)}
        onStripeCheckout={() => onStripeCheckout?.(selectedItem)}
        onViewInventory={onViewInventory}
      />
    </>
  );
}
