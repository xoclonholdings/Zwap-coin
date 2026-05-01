import React from "react";
import {
  getItemName,
  getItemDescription,
  getFormattedItemPrice,
} from "./shopWindowUtils";

export default function ShopWindowItemView({
  activeCategoryLabel,
  visibleItems = [],
  activeItemIndex = 0,
  onNextItem,
  onOpenPurchase,
}) {
  const activeItem =
    visibleItems[activeItemIndex] || visibleItems[0] || null;

  return (
    <div className="relative z-10 mt-5 flex min-h-0 flex-1 flex-col">
      {/* Category Label */}
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-200/60">
        {activeCategoryLabel}
      </p>

      {activeItem ? (
        <>
          {/* Item Surface (tap = next item) */}
          <button
            type="button"
            onClick={onNextItem}
            className="mt-3 flex min-h-0 flex-1 flex-col justify-center rounded-[1.15rem] border border-white/10 bg-white/[0.05] p-3 text-left"
          >
            <p className="truncate text-base font-black tracking-[-0.04em] text-white">
              {getItemName(activeItem)}
            </p>

            <p className="mt-2 line-clamp-2 text-xs leading-snug text-white/50">
              {getItemDescription(activeItem)}
            </p>

            <p className="mt-3 text-sm font-black text-cyan-200">
              {getFormattedItemPrice(activeItem)}
            </p>
          </button>

          {/* Purchase Button */}
          <button
            type="button"
            onClick={onOpenPurchase}
            className="mt-3 w-full rounded-[20px] border border-white/50 bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-300 px-5 py-2.5 text-center text-sm font-black text-white shadow-[0_0_24px_rgba(34,211,238,0.20)] transition active:scale-[0.98]"
          >
            Purchase
          </button>

          {/* Item Pagination */}
          <div className="pointer-events-none mt-2 flex shrink-0 justify-center gap-1.5 pb-0.5">
            {visibleItems.map((item, index) => (
              <span
                key={item.id || getItemName(item)}
                className={[
                  "h-1.5 rounded-full transition-all duration-300",
                  index === activeItemIndex
                    ? "w-4 bg-cyan-200/65 shadow-[0_0_8px_rgba(103,242,255,0.22)]"
                    : "w-1.5 bg-white/22",
                ].join(" ")}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="mt-3 flex flex-1 items-center justify-center rounded-[1.15rem] border border-white/10 bg-white/[0.04] px-3 text-center">
          <p className="text-xs font-medium text-white/45">
            No items in this category yet.
          </p>
        </div>
      )}
    </div>
  );
}