import React from "react";
import { motion } from "framer-motion";
import { Crown, ShoppingBag } from "lucide-react";

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

export default function ShopItemCard({
  item,
  categoryLabel,
  isOwned = false,
  onOpen,
}) {
  if (!item) return null;

  return (
    <motion.button
      whileTap={{ scale: 0.985 }}
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -18 }}
      transition={{ duration: 0.2 }}
      onClick={() => onOpen?.(item)}
      className="w-full space-y-4 text-left"
      type="button"
    >
      <div className="overflow-hidden rounded-[24px] bg-pink-500/[0.06] transition hover:bg-pink-500/[0.12]">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/25">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-white/20" />
            </div>
          )}

          {item.plus_only ? (
            <div className="absolute right-3 top-3 rounded-full border border-pink-400/25 bg-pink-500/15 px-2.5 py-1 text-[10px] font-medium text-pink-200">
              <span className="inline-flex items-center gap-1">
                <Crown className="h-3 w-3" />
                Plus
              </span>
            </div>
          ) : null}

          {isOwned ? (
            <div className="absolute left-3 top-3 rounded-full border border-emerald-400/20 bg-emerald-500/15 px-2.5 py-1 text-[10px] font-medium text-emerald-200">
              In Inventory
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className="truncate text-lg font-semibold text-white">
              {item.name}
            </h4>

            <p className="mt-1 line-clamp-2 text-sm text-white/60">
              {item.description || "Redeem your rewards for something worth having."}
            </p>
          </div>

          <div className="shrink-0 rounded-full border border-pink-500/25 bg-pink-500/10 px-3 py-1.5 text-xs font-semibold text-pink-200">
            {getDisplayPrice(item)}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="text-[11px] font-medium uppercase tracking-wide text-pink-300">
            {categoryLabel || "Marketplace"}
          </div>

          <div className="text-[11px] uppercase tracking-wide text-white/35">
            {isOwned ? "In inventory" : "Open item"}
          </div>
        </div>
      </div>
    </motion.button>
  );
}