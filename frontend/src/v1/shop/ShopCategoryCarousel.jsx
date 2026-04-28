import React from "react";
import { motion } from "framer-motion";
import ShopItemCard from "@/components/shop/ShopItemCard";

export default function ShopCategoryCarousel({
  title,
  items,
  loading,
  purchasingId,
  onPurchase,
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold tracking-wide text-white">
          {title}
        </h3>
        <span className="text-xs text-white/45">
          {items?.length || 0} item{(items?.length || 0) === 1 ? "" : "s"}
        </span>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-3">
          {loading
            ? Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`${title}-skeleton-${index}`}
                  className="h-[345px] w-[238px] shrink-0 animate-pulse rounded-[26px] border border-white/10 bg-white/5"
                />
              ))
            : (items || []).map((item, index) => {
                const itemId = item?._id || item?.id || `${title}-${index}`;
                return (
                  <ShopItemCard
                    key={itemId}
                    item={item}
                    isPurchasing={purchasingId === (item?._id || item?.id)}
                    onPurchase={onPurchase}
                  />
                );
              })}
        </div>
      </div>
    </motion.section>
  );
}
