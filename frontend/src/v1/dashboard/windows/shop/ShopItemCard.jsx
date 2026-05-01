import React from "react";
import { Crown, ShoppingBag } from "lucide-react";

function getPaymentMethod(item = {}) {
  if (item.payment_method) return item.payment_method;

  if (Number(item.price_stripe || 0) > 0) return "stripe";

  if (
    Number(item.price_zpts || item.priceZpts || item.price || 0) > 0 &&
    Number(item.price_zwap || item.priceZwap || 0) === 0
  ) {
    return "zpts";
  }

  return "zwap";
}

function getDisplayPrice(item = {}) {
  const method = getPaymentMethod(item);

  if (method === "stripe") {
    return `$${Number(item.price_stripe || 0).toFixed(2)}`;
  }

  if (method === "zpts") {
    return `${Number(item.price_zpts || item.priceZpts || item.price || 0).toLocaleString()} zPts`;
  }

  return `${Number(item.price_zwap || item.priceZwap || 0).toLocaleString()} ZWAP`;
}

export default function ShopItemCard({
  item,
  categoryLabel,
  isOwned = false,
  isPurchasing = false,
  onOpen,
  onPurchase,
}) {
  if (!item) return null;

  const handleClick = () => {
    if (isPurchasing) return;

    if (typeof onOpen === "function") {
      onOpen(item);
      return;
    }

    if (typeof onPurchase === "function") {
      onPurchase(item);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPurchasing}
      className="flex h-full w-full flex-col overflow-hidden rounded-[1.15rem] border border-white/10 bg-white/[0.05] text-left disabled:cursor-default disabled:opacity-60"
    >
      <div className="relative min-h-0 flex-1 overflow-hidden bg-black/20">
        {item.image_url || item.imageUrl ? (
          <img
            src={item.image_url || item.imageUrl}
            alt={item.name || item.title || "Shop item"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full min-h-[72px] w-full items-center justify-center">
            <ShoppingBag className="h-9 w-9 text-white/20" />
          </div>
        )}

        {item.plus_only || item.plusOnly ? (
          <div className="absolute right-2 top-2 rounded-full border border-cyan-300/25 bg-cyan-300/15 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-cyan-100">
            <span className="inline-flex items-center gap-1">
              <Crown className="h-3 w-3" />
              Plus
            </span>
          </div>
        ) : null}

        {isOwned ? (
          <div className="absolute left-2 top-2 rounded-full border border-emerald-300/20 bg-emerald-400/15 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-emerald-100">
            Owned
          </div>
        ) : null}
      </div>

      <div className="shrink-0 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="truncate text-sm font-semibold text-white">
              {item.name || item.title || "Shop Item"}
            </h4>

            <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-white/50">
              {item.description || item.subtitle || "Tap to view item."}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-end justify-between gap-2">
          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-200/65">
            {categoryLabel || "Shop"}
          </p>

          <p className="shrink-0 text-xs font-black text-cyan-200">
            {getDisplayPrice(item)}
          </p>
        </div>
      </div>
    </button>
  );
}
