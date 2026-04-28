import React, { useEffect, useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ZUPREME_LOGO } from "@/App";
import ShopItemCard from "@/components/shop/ShopItemCard";
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

export default function ShopMarketplaceCard({
  items = [],
  user,
  ownedItemIds,
  isLoading = false,
  isPurchasing = false,
  purchaseSuccess = false,
  canAffordZwap,
  canAffordZpts,
  onPurchase,
  onStripeCheckout,
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
        className="rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(236,72,153,0.12),transparent_40%),linear-gradient(180deg,rgba(8,10,18,0.96),rgba(6,8,14,0.98))] p-4 backdrop-blur-sm"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-white">Marketplace</h3>

          <img
            src={ZUPREME_LOGO}
            alt="Zupreme Imports"
            className="h-10 w-auto shrink-0 object-contain"
            style={{
              filter: "drop-shadow(0 0 12px rgba(236,72,153,0.22))",
            }}
          />
        </div>

        <div className="mb-3 flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={prevItem}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-transparent text-white/70 hover:text-pink-200"
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
                    ? "border border-pink-500/25 bg-pink-500/10 text-pink-300"
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
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-transparent text-white/70 hover:text-pink-200"
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
              <ShopItemCard
                item={currentItem}
                categoryLabel={activeCategory}
                isOwned={ownedItemIds?.has(currentItem.id || currentItem._id)}
                onOpen={openItem}
              />

              <button
                type="button"
                onClick={() => openItem(currentItem)}
                className="w-full rounded-[20px] bg-[linear-gradient(135deg,#ec4899,#a855f7)] px-4 py-4 text-center text-2xl font-semibold text-white shadow-[0_0_18px_rgba(236,72,153,0.35)]"
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
                          ? "w-6 bg-pink-400"
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
                Nothing in this category yet.
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
      />
    </>
  );
}
