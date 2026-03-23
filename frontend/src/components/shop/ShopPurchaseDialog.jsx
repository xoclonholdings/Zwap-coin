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
  onViewInventory,
}) {
  return (
    <Dialog open={!!selectedItem} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-3xl border-pink-500/30 bg-[#0f1029]">
        {purchaseSuccess ? (
          <div className="py-4 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
              <Check className="h-8 w-8 text-green-400" />
            </div>

            <DialogTitle className="mb-2 text-xl text-white">
              Purchase Complete
            </DialogTitle>
            <DialogDescription className="mb-4 text-sm text-gray-400">
              You purchased {selectedItem?.name}
            </DialogDescription>

            <div className="flex justify-center gap-2">
              <Button
                onClick={onViewInventory}
                className="bg-gradient-to-r from-pink-500 to-purple-500"
              >
                View Inventory
              </Button>
              <Button onClick={onClose} variant="outline" className="border-gray-700">
                Continue Shopping
              </Button>
            </div>
          </div>
        ) : selectedItem ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg text-white">
                {selectedItem.name}
                {selectedItem.plus_only && <Crown className="h-4 w-4 text-yellow-400" />}
                {selectedItemOwned && (
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/20 px-2 py-1 text-[10px] text-emerald-300">
                    OWNED
                  </span>
                )}
              </DialogTitle>

              <DialogDescription className="text-sm text-gray-400">
                {selectedItem.description}
              </DialogDescription>
            </DialogHeader>

            <div className="my-3 aspect-video overflow-hidden rounded-2xl bg-gray-900">
              {selectedItem.image_url ? (
                <img
                  src={selectedItem.image_url}
                  alt={selectedItem.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ShoppingBag className="h-10 w-10 text-gray-600" />
                </div>
              )}
            </div>

            {selectedPaymentMethod === "zwap" && (
              <div className="mb-3 space-y-2">
                <p className="text-xs text-gray-400">Pay with:</p>
                <button
                  type="button"
                  onClick={() => setPaymentType("zwap")}
                  className={`w-full rounded-2xl border p-3 ${
                    paymentType === "zwap"
                      ? "border-cyan-500 bg-cyan-500/20"
                      : "border-white/10 bg-white/[0.03]"
                  } flex items-center gap-3`}
                >
                  <Coins className="h-4 w-4 text-cyan-400" />
                  <div className="text-left">
                    <p className="text-sm font-bold text-cyan-300">
                      {selectedItem.price_zwap} ZWAP
                    </p>
                    <p
                      className={`text-[10px] ${
                        canAffordZwap(selectedItem.price_zwap)
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {canAffordZwap(selectedItem.price_zwap)
                        ? "✓ Available"
                        : "✗ Insufficient"}
                    </p>
                  </div>
                </button>
              </div>
            )}

            {selectedPaymentMethod === "zpts" && (
              <div className="mb-3 space-y-2">
                <p className="text-xs text-gray-400">Pay with:</p>
                <button
                  type="button"
                  onClick={() => setPaymentType("zpts")}
                  className={`w-full rounded-2xl border p-3 ${
                    paymentType === "zpts"
                      ? "border-purple-500 bg-purple-500/20"
                      : "border-white/10 bg-white/[0.03]"
                  } flex items-center gap-3`}
                >
                  <Zap className="h-4 w-4 text-purple-400" />
                  <div className="text-left">
                    <p className="text-sm font-bold text-purple-300">
                      {selectedItem.price_zpts} zPts
                    </p>
                    <p
                      className={`text-[10px] ${
                        canAffordZpts(selectedItem.price_zpts)
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {canAffordZpts(selectedItem.price_zpts)
                        ? "✓ Available"
                        : "✗ Insufficient"}
                    </p>
                  </div>
                </button>
              </div>
            )}

            {selectedPaymentMethod === "stripe" && (
              <div className="mb-3 space-y-2">
                <p className="text-xs text-gray-400">Payment method:</p>
                <div className="flex w-full items-center gap-3 rounded-2xl border border-emerald-500 bg-emerald-500/15 p-3">
                  <CreditCard className="h-4 w-4 text-emerald-400" />
                  <div className="text-left">
                    <p className="text-sm font-bold text-emerald-300">
                      ${Number(selectedItem.price_stripe || 0).toFixed(2)} USD
                    </p>
                    <p className="text-[10px] text-emerald-400">
                      Secure Stripe checkout
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {selectedPaymentMethod !== "stripe" && (
                <Button
                  data-testid="confirm-purchase"
                  onClick={onPurchase}
                  disabled={
                    isPurchasing ||
                    (selectedItem.plus_only && user?.tier !== "plus") ||
                    (paymentType === "zwap" && !canAffordZwap(selectedItem.price_zwap)) ||
                    (paymentType === "zpts" && !canAffordZpts(selectedItem.price_zpts))
                  }
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500"
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
              )}

              {selectedPaymentMethod === "stripe" && (
                <Button
                  type="button"
                  onClick={onStripeCheckout}
                  disabled={isPurchasing || (selectedItem.plus_only && user?.tier !== "plus")}
                  className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-black hover:opacity-90"
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
              )}
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}