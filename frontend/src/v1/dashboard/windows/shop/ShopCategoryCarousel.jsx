import React from "react";
import ShopItemCard from "@/components/shop/ShopItemCard";

export default function ShopCategoryCarousel({
  title = "Shop",
  items = [],
  loading = false,
  purchasingId,
  onPurchase,
}) {
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <section className="flex h-full min-h-0 w-full flex-col overflow-hidden">
      <div className="mb-2 flex shrink-0 items-center justify-between px-0.5">
        <h3 className="truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-200/75">
          {title}
        </h3>

        <span className="shrink-0 text-[10px] font-medium text-white/40">
          {safeItems.length} item{safeItems.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <div className="flex h-full snap-x gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {loading
            ? Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={`${title}-skeleton-${index}`}
                  className="h-full min-w-[78%] shrink-0 snap-start rounded-[1.15rem] border border-white/10 bg-white/[0.05]"
                />
              ))
            : safeItems.map((item, index) => {
                const itemId = item?._id || item?.id || `${title}-${index}`;

                return (
                  <div
                    key={itemId}
                    className="h-full min-w-[78%] shrink-0 snap-start overflow-hidden"
                  >
                    <ShopItemCard
                      item={item}
                      isPurchasing={purchasingId === (item?._id || item?.id)}
                      onPurchase={onPurchase}
                    />
                  </div>
                );
              })}
        </div>
      </div>
    </section>
  );
}
