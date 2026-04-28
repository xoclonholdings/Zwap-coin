import React from "react";
import {
  Check,
  Coins,
  CreditCard,
  Crown,
  Loader2,
  ShoppingBag,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function ShopPurchaseDialog({
  selectedItem,
  selectedPaymentMethod,
  selectedItemOwned,
  purchaseSuccess,
  isPurchasing,
  paymentType,
  setPaymentType,
  canAffordZwap,
  canAffordZpts,
  user,
  onClose,
  onPurchase,
  onStripeCheckout,
}) {
  return (
    <Dialog open={!!selectedItem} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-3xl border-pink-500/30 bg-[linear-gradient(180deg,rgba(14,10,24,0.98),rgba(9,8,18,0.99))]">
        {purchaseSuccess ? (
          <div className="py-4 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pink-500/15">
              <Check className="h-8 w-8 text-pink-300" />
            </div>

            <DialogTitle className="mb-2 text-xl text-white">
              Purchase Complete
            </DialogTitle>

            <DialogDescription className="mb-4 text-sm text-white/60">
              You purchased {selectedItem?.name}
            </DialogDescription>

            <div className="flex justify-center gap-2">
              <Button
                onClick={onClose}
                className="bg-[linear-gradient(135deg,#ec4899,#a855f7)] text-white"
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        ) : selectedItem ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg text-white">
                {selectedItem.name}

                {selectedItem.plus_only ? (
                  <Crown className="h-4 w-4 text-pink-300" />
                ) : null}

                {selectedItemOwned ? (
                  <span className="rounded-full border border-pink-500/20 bg-pink-500/10 px-2 py-1 text-[10px] text-pink-200">
                    OWNED
                  </span>
                ) : null}
              </DialogTitle>

              <DialogDescription className="text-sm text-white/55">
                {selectedItem.description}
              </DialogDescription>
            </DialogHeader>

            <div className="my-3 aspect-video overflow-hidden rounded-2xl bg-black/30">
              {selectedItem.image_url ? (
                <img
                  src={selectedItem.image_url}
                  alt={selectedItem.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ShoppingBag className="h-10 w-10 text-white/20" />
                </div>
              )}
            </div>

            {selectedPaymentMethod === "zwap" ? (
              <div className="mb-3 space-y-2">
                <p className="text-xs text-white/45">Pay with:</p>

                <button
                  type="button"
                  onClick={() => setPaymentType("zwap")}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-3 ${
                    paymentType === "zwap"
                      ? "border-pink-500/30 bg-pink-500/10"
                      : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  <Coins className="h-4 w-4 text-pink-300" />

                  <div className="text-left">
                    <p className="text-sm font-bold text-pink-200">
                      {selectedItem.price_zwap} ZWAP
                    </p>

                    <p
                      className={`text-[10px] ${
                        canAffordZwap(selectedItem.price_zwap)
                          ? "text-pink-300"
                          : "text-red-400"
                      }`}
                    >
                      {canAffordZwap(selectedItem.price_zwap)
                        ? "Available"
                        : "Insufficient"}
                    </p>
                  </div>
                </button>
              </div>
            ) : null}

            {selectedPaymentMethod === "zpts" ? (
              <div className="mb-3 space-y-2">
                <p className="text-xs text-white/45">Pay with:</p>

                <button
                  type="button"
                  onClick={() => setPaymentType("zpts")}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-3 ${
                    paymentType === "zpts"
                      ? "border-pink-500/30 bg-pink-500/10"
                      : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  <Zap className="h-4 w-4 text-pink-300" />

                  <div className="text-left">
                    <p className="text-sm font-bold text-pink-200">
                      {selectedItem.price_zpts} zPts
                    </p>

                    <p
                      className={`text-[10px] ${
                        canAffordZpts(selectedItem.price_zpts)
                          ? "text-pink-300"
                          : "text-red-400"
                      }`}
                    >
                      {canAffordZpts(selectedItem.price_zpts)
                        ? "Available"
                        : "Insufficient"}
                    </p>
                  </div>
                </button>
              </div>
            ) : null}

            {selectedPaymentMethod === "stripe" ? (
              <div className="mb-3 space-y-2">
                <p className="text-xs text-white/45">Payment method:</p>

                <div className="flex w-full items-center gap-3 rounded-2xl border border-pink-500/20 bg-pink-500/10 p-3">
                  <CreditCard className="h-4 w-4 text-pink-300" />

                  <div className="text-left">
                    <p className="text-sm font-bold text-pink-200">
                      ${Number(selectedItem.price_stripe || 0).toFixed(2)} USD
                    </p>
                    <p className="text-[10px] text-white/50">
                      Secure Stripe checkout
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="space-y-3">
              {selectedPaymentMethod !== "stripe" ? (
                <Button
                  data-testid="confirm-purchase"
                  onClick={onPurchase}
                  disabled={
                    isPurchasing ||
                    (selectedItem.plus_only && user?.tier !== "plus") ||
                    (paymentType === "zwap" &&
                      !canAffordZwap(selectedItem.price_zwap)) ||
                    (paymentType === "zpts" &&
                      !canAffordZpts(selectedItem.price_zpts))
                  }
                  className="w-full bg-[linear-gradient(135deg,#ec4899,#a855f7)] text-white"
                >
                  {isPurchasing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : selectedItem.plus_only && user?.tier !== "plus" ? (
                    "Plus Required"
                  ) : (
                    "Confirm Purchase"
                  )}
                </Button>
              ) : null}

              {selectedPaymentMethod === "stripe" ? (
                <Button
                  type="button"
                  onClick={onStripeCheckout}
                  disabled={
                    isPurchasing ||
                    (selectedItem.plus_only && user?.tier !== "plus")
                  }
                  className="w-full bg-[linear-gradient(135deg,#ec4899,#a855f7)] text-white"
                >
                  {isPurchasing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redirecting...
                    </>
                  ) : selectedItem.plus_only && user?.tier !== "plus" ? (
                    "Plus Required"
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pay with Card
                    </>
                  )}
                </Button>
              ) : null}
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
