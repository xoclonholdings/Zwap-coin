import React from "react";
import {
  Activity,
  Check,
  Coins,
  CreditCard,
  Crown,
  Loader2,
  ShoppingBag,
  X,
} from "lucide-react";

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

function getItemName(item = {}) {
  return item.name || item.title || "Shop Item";
}

function getItemDescription(item = {}) {
  return item.description || item.subtitle || "Redeem your progress for utility.";
}

function getItemImage(item = {}) {
  return item.image_url || item.imageUrl || "";
}

function getZptsPrice(item = {}) {
  return Number(item.price_zpts || item.priceZpts || item.price || 0);
}

function getZwapPrice(item = {}) {
  return Number(item.price_zwap || item.priceZwap || 0);
}

function getStripePrice(item = {}) {
  return Number(item.price_stripe || item.priceStripe || 0);
}

export default function ShopPurchaseDialog({
  selectedItem,
  selectedPaymentMethod,
  selectedItemOwned = false,
  purchaseSuccess = false,
  isPurchasing = false,
  paymentType,
  setPaymentType,
  canAffordZwap = () => true,
  canAffordZpts = () => true,
  user,
  onClose,
  onPurchase,
  onStripeCheckout,
}) {
  const paymentMethod = selectedPaymentMethod || getPaymentMethod(selectedItem);
  const isPlusOnly = selectedItem?.plus_only || selectedItem?.plusOnly;
  const userTier = user?.tier || user?.membership || "zwapper";
  const hasPlusAccess = userTier === "plus" || userTier === "zitizen";

  if (!selectedItem) return null;

  return (
    <div className="absolute inset-0 z-30 flex items-end rounded-[1.5rem] bg-black/60 p-3 backdrop-blur-sm">
      <div className="relative w-full overflow-hidden rounded-[1.25rem] border border-cyan-200/15 bg-[#101827] p-4 shadow-[0_0_30px_rgba(34,211,238,0.14)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/55"
          aria-label="Close purchase dialog"
        >
          <X className="h-4 w-4" />
        </button>

        {purchaseSuccess ? (
          <div className="py-5 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
              <Check className="h-7 w-7" />
            </div>

            <h3 className="text-lg font-semibold text-white">
              Purchase Complete
            </h3>

            <p className="mt-2 text-sm text-white/55">
              You unlocked {getItemName(selectedItem)}.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="mt-5 w-full rounded-xl border border-cyan-300/25 bg-cyan-300/15 px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100"
            >
              Continue
            </button>
          </div>
        ) : (
          <>
            <div className="pr-9">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-base font-semibold text-white">
                  {getItemName(selectedItem)}
                </h3>

                {isPlusOnly ? (
                  <Crown className="h-4 w-4 shrink-0 text-cyan-200" />
                ) : null}

                {selectedItemOwned ? (
                  <span className="shrink-0 rounded-full border border-emerald-300/20 bg-emerald-400/15 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-emerald-100">
                    Owned
                  </span>
                ) : null}
              </div>

              <p className="mt-2 line-clamp-2 text-xs leading-snug text-white/55">
                {getItemDescription(selectedItem)}
              </p>
            </div>

            <div className="my-4 aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black/30">
              {getItemImage(selectedItem) ? (
                <img
                  src={getItemImage(selectedItem)}
                  alt={getItemName(selectedItem)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ShoppingBag className="h-10 w-10 text-white/20" />
                </div>
              )}
            </div>

            {paymentMethod === "zpts" ? (
              <button
                type="button"
                onClick={() => setPaymentType?.("zpts")}
                className={[
                  "mb-3 flex w-full items-center gap-3 rounded-2xl border p-3 text-left",
                  paymentType === "zpts" || !paymentType
                    ? "border-cyan-300/30 bg-cyan-300/10"
                    : "border-white/10 bg-white/[0.03]",
                ].join(" ")}
              >
                <Activity className="h-4 w-4 text-cyan-300" />

                <div>
                  <p className="text-sm font-bold text-cyan-100">
                    {getZptsPrice(selectedItem).toLocaleString()} zPts
                  </p>

                  <p
                    className={[
                      "text-[10px]",
                      canAffordZpts(getZptsPrice(selectedItem))
                        ? "text-cyan-300/75"
                        : "text-red-300",
                    ].join(" ")}
                  >
                    {canAffordZpts(getZptsPrice(selectedItem))
                      ? "Available"
                      : "Insufficient zPts"}
                  </p>
                </div>
              </button>
            ) : null}

            {paymentMethod === "zwap" ? (
              <button
                type="button"
                onClick={() => setPaymentType?.("zwap")}
                className={[
                  "mb-3 flex w-full items-center gap-3 rounded-2xl border p-3 text-left",
                  paymentType === "zwap" || !paymentType
                    ? "border-cyan-300/30 bg-cyan-300/10"
                    : "border-white/10 bg-white/[0.03]",
                ].join(" ")}
              >
                <Coins className="h-4 w-4 text-cyan-300" />

                <div>
                  <p className="text-sm font-bold text-cyan-100">
                    {getZwapPrice(selectedItem).toLocaleString()} ZWAP
                  </p>

                  <p
                    className={[
                      "text-[10px]",
                      canAffordZwap(getZwapPrice(selectedItem))
                        ? "text-cyan-300/75"
                        : "text-red-300",
                    ].join(" ")}
                  >
                    {canAffordZwap(getZwapPrice(selectedItem))
                      ? "Available"
                      : "Insufficient ZWAP"}
                  </p>
                </div>
              </button>
            ) : null}

            {paymentMethod === "stripe" ? (
              <div className="mb-3 flex w-full items-center gap-3 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-left">
                <CreditCard className="h-4 w-4 text-cyan-300" />

                <div>
                  <p className="text-sm font-bold text-cyan-100">
                    ${getStripePrice(selectedItem).toFixed(2)} USD
                  </p>

                  <p className="text-[10px] text-white/45">
                    Secure card checkout
                  </p>
                </div>
              </div>
            ) : null}

            {paymentMethod === "stripe" ? (
              <button
                type="button"
                onClick={onStripeCheckout}
                disabled={isPurchasing || (isPlusOnly && !hasPlusAccess)}
                className="flex w-full items-center justify-center rounded-xl border border-cyan-300/25 bg-cyan-300/15 px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100 disabled:cursor-default disabled:opacity-50"
              >
                {isPurchasing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redirecting
                  </>
                ) : isPlusOnly && !hasPlusAccess ? (
                  "Zitizen Required"
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay with Card
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={onPurchase}
                disabled={
                  isPurchasing ||
                  selectedItemOwned ||
                  (isPlusOnly && !hasPlusAccess) ||
                  (paymentMethod === "zpts" &&
                    !canAffordZpts(getZptsPrice(selectedItem))) ||
                  (paymentMethod === "zwap" &&
                    !canAffordZwap(getZwapPrice(selectedItem)))
                }
                className="flex w-full items-center justify-center rounded-xl border border-cyan-300/25 bg-cyan-300/15 px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100 disabled:cursor-default disabled:opacity-50"
              >
                {isPurchasing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing
                  </>
                ) : selectedItemOwned ? (
                  "Already Owned"
                ) : isPlusOnly && !hasPlusAccess ? (
                  "Zitizen Required"
                ) : (
                  "Confirm Purchase"
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
