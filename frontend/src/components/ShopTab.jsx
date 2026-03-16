import React, { useState, useEffect, useMemo } from "react";
import { useApp, ZUPREME_LOGO } from "@/App";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Loader2,
  Crown,
  Coins,
  Zap,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  CreditCard,
  Package,
  Sparkles,
  ExternalLink,
  Download,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ShopTab() {
  const { user, walletAddress, refreshUser } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const query = new URLSearchParams(location.search);
  const paymentSuccess = query.get("payment") === "success";
  const purchasedItemId = query.get("item");

  const [items, setItems] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inventoryLoading, setInventoryLoading] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  const [paymentType, setPaymentType] = useState("zwap");
  const [activeCategory, setActiveCategory] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const [purchasedItem, setPurchasedItem] = useState(null);
  const [showInventory, setShowInventory] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    if (walletAddress) {
      loadInventory();
    } else {
      setInventoryItems([]);
    }
  }, [walletAddress]);

  useEffect(() => {
    if (!purchasedItemId || items.length === 0) return;
    const found = items.find((item) => item.id === purchasedItemId);
    if (found) setPurchasedItem(found);
  }, [purchasedItemId, items]);

  useEffect(() => {
    setCarouselIndex(0);
  }, [activeCategory]);

  const loadItems = async () => {
    setIsLoading(true);
    try {
      const data = await api.getShopItems();
      const loaded = Array.isArray(data) ? data : data?.items || [];
      setItems(loaded);

      const categoryList = [...new Set(
        loaded
          .map((item) => item.category)
          .filter(Boolean)
      )];

      if (categoryList.length > 0 && !activeCategory) {
        setActiveCategory(categoryList[0]);
      }
    } catch (error) {
      toast.error("Failed to load items");
    } finally {
      setIsLoading(false);
    }
  };

  const loadInventory = async () => {
    if (!walletAddress) return;

    setInventoryLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users/${walletAddress}/inventory`);
      const data = await res.json();
      const loaded = Array.isArray(data) ? data : data?.items || [];
      setInventoryItems(loaded);
    } catch (error) {
      console.error(error);
    } finally {
      setInventoryLoading(false);
    }
  };

  const ownedItemIds = useMemo(
    () => new Set(inventoryItems.map((item) => item.item_id)),
    [inventoryItems]
  );

  const categories = useMemo(
    () => [...new Set(items.map((item) => item.category).filter(Boolean))],
    [items]
  );

  const filteredItems = useMemo(
    () => items.filter((item) => item.category === activeCategory),
    [items, activeCategory]
  );

  const currentItem = filteredItems[carouselIndex] || null;

  const canAffordZwap = (price) => (user?.zwap_balance || 0) >= Number(price || 0);
  const canAffordZpts = (price) => Number(price || 0) > 0 && (user?.zpts_balance || 0) >= Number(price || 0);

  const getPaymentMethod = (item) => {
    if (!item) return "zwap";
    if (item.payment_method) return item.payment_method;
    if (item.price_stripe && Number(item.price_stripe) > 0) return "stripe";
    if (item.price_zpts && Number(item.price_zpts) > 0 && (!item.price_zwap || Number(item.price_zwap) === 0)) {
      return "zpts";
    }
    return "zwap";
  };

  const getDisplayPrice = (item) => {
    if (!item) return "";
    const method = getPaymentMethod(item);

    if (method === "stripe") {
      return `$${Number(item.price_stripe || 0).toFixed(2)}`;
    }
    if (method === "zpts") {
      return `${Number(item.price_zpts || 0)} zPts`;
    }
    return `${Number(item.price_zwap || 0)} ZWAP`;
  };

  const nextItem = () => {
    if (filteredItems.length <= 1) return;
    setCarouselIndex((prev) => (prev + 1) % filteredItems.length);
  };

  const prevItem = () => {
    if (filteredItems.length <= 1) return;
    setCarouselIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
  };

  const openItem = (item) => {
    setSelectedItem(item);
    setPurchaseSuccess(false);
    setPaymentType(getPaymentMethod(item));
  };

  const handleCloseDialog = () => {
    setSelectedItem(null);
    setPurchaseSuccess(false);
    setPaymentType("zwap");
  };

  const clearSuccessState = () => {
    query.delete("payment");
    query.delete("item");
    navigate(
      {
        pathname: "/success",
        search: query.toString() ? `?${query.toString()}` : "",
      },
      { replace: true }
    );
  };

  const handlePurchase = async () => {
    if (!selectedItem || !walletAddress) return;

    setIsPurchasing(true);
    try {
      await api.purchaseItem(walletAddress, selectedItem.id, paymentType);
      setPurchaseSuccess(true);
      await refreshUser();
      await loadInventory();
      toast.success(`Purchased ${selectedItem.name}!`);
    } catch (error) {
      toast.error(error.message || "Purchase failed");
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleStripeCheckout = async () => {
    if (!selectedItem || !walletAddress) return;

    setIsPurchasing(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/stripe/create-checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          item_id: selectedItem.id,
          wallet_address: walletAddress,
          purchase_type: "shop_item",
          origin_url: window.location.origin,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data?.detail || "Failed to create Stripe checkout session");
      }

      window.location.href = data.url;
    } catch (error) {
      toast.error(error.message || "Stripe checkout failed");
    } finally {
      setIsPurchasing(false);
    }
  };

  const selectedPaymentMethod = getPaymentMethod(selectedItem);
  const selectedItemOwned = selectedItem ? ownedItemIds.has(selectedItem.id) : false;

  const inventoryDisplayItems = useMemo(() => {
    return inventoryItems.map((owned) => {
      const fullItem = items.find((item) => item.id === owned.item_id);
      return {
        ...owned,
        name: owned.item_name || fullItem?.name || "Owned Item",
        image_url: fullItem?.image_url || null,
        description: fullItem?.description || "",
        download_url: fullItem?.download_url || null,
        external_url: fullItem?.external_url || null,
      };
    });
  }, [inventoryItems, items]);

  return (
    <div
      className="min-h-[calc(100dvh-160px)] bg-[#0a0b1e] flex flex-col px-4 py-4"
      data-testid="shop-tab"
    >
      {/* Hero */}
      <div className="text-center mb-4">
        <motion.div
          className="w-16 h-16 rounded-2xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center mx-auto mb-3"
          animate={{
            boxShadow: [
              "0 0 10px rgba(236,72,153,0.18)",
              "0 0 24px rgba(236,72,153,0.35)",
              "0 0 10px rgba(236,72,153,0.18)",
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <ShoppingBag className="w-8 h-8 text-pink-400" />
        </motion.div>

        <h1 className="text-2xl font-bold text-white">SHOP</h1>
        <p className="text-gray-400 text-sm">Collect, unlock, and own your rewards</p>
      </div>

      {/* Success Banner */}
      <AnimatePresence>
        {paymentSuccess && purchasedItem && (
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            className="mb-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Check className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-emerald-300 font-semibold">Purchase successful</p>
                  <h3 className="text-white font-bold text-lg">{purchasedItem.name}</h3>
                  <p className="text-gray-300 text-sm">
                    This item has been added to your inventory.
                  </p>
                </div>
              </div>

              <button
                onClick={clearSuccessState}
                className="text-gray-400 hover:text-white text-sm"
                type="button"
              >
                Close
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {purchasedItem.download_url && (
                <a
                  href={purchasedItem.download_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/30"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              )}

              {purchasedItem.external_url && (
                <a
                  href={purchasedItem.external_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Item
                </a>
              )}

              <Button
                type="button"
                onClick={() => setShowInventory(true)}
                className="bg-gradient-to-r from-pink-500 to-purple-500"
              >
                <Package className="w-4 h-4 mr-2" />
                View Inventory
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Brand strip */}
      <div className="relative mb-4">
        <motion.img
          src={ZUPREME_LOGO}
          alt="Zupreme Imports"
          className="h-12 sm:h-14 mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            filter: "drop-shadow(0 0 15px rgba(236,72,153,0.35))",
          }}
        />
      </div>

      {/* Top utility row */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="glass-card px-3 py-2 rounded-xl flex items-center gap-3">
          <span className="text-cyan-400 font-semibold text-sm">
            {Number(user?.zwap_balance || 0).toFixed(2)} ZWAP
          </span>
          <span className="text-gray-600">|</span>
          <span className="text-purple-400 font-semibold text-sm">
            {user?.zpts_balance || 0} zPts
          </span>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => setShowInventory(true)}
          className="border-pink-500/30 text-pink-300 hover:bg-pink-500/10"
        >
          <Package className="w-4 h-4 mr-2" />
          My Inventory
        </Button>
      </div>

      {/* Categories */}
      <div className="mb-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                activeCategory === category
                  ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg"
                  : "bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-pink-500/50"
              }`}
              style={
                activeCategory === category
                  ? { boxShadow: "0 0 20px rgba(236,72,153,0.32)" }
                  : {}
              }
            >
              {String(category).replaceAll("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Main display */}
      <div className="flex-1 flex items-center justify-center relative">
        {isLoading ? (
          <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
        ) : filteredItems.length > 0 && currentItem ? (
          <div className="w-full max-w-sm relative">
            {filteredItems.length > 1 && (
              <>
                <button
                  onClick={prevItem}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-20 w-10 h-10 rounded-full bg-gray-800/80 border border-gray-700 flex items-center justify-center text-white hover:bg-pink-500/20 transition-colors"
                  type="button"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  onClick={nextItem}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-20 w-10 h-10 rounded-full bg-gray-800/80 border border-gray-700 flex items-center justify-center text-white hover:bg-pink-500/20 transition-colors"
                  type="button"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={currentItem.id}
                initial={{ opacity: 0, x: 28 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -28 }}
                transition={{ duration: 0.2 }}
                onClick={() => openItem(currentItem)}
                className="cursor-pointer"
              >
                <div
                  className="rounded-3xl overflow-hidden border border-pink-500/25 bg-gradient-to-br from-gray-800/50 to-gray-900/70 relative"
                  style={{ boxShadow: "0 0 25px rgba(236,72,153,0.18)" }}
                >
                  {currentItem.plus_only && (
                    <div className="absolute top-3 right-3 z-10 bg-yellow-500 rounded-full px-2 py-1 flex items-center gap-1">
                      <Crown className="w-3 h-3 text-white" />
                      <span className="text-xs text-white font-semibold">Plus</span>
                    </div>
                  )}

                  {ownedItemIds.has(currentItem.id) && (
                    <div className="absolute top-3 left-3 z-10 bg-emerald-500/90 rounded-full px-2 py-1 flex items-center gap-1">
                      <Check className="w-3 h-3 text-white" />
                      <span className="text-xs text-white font-semibold">Owned</span>
                    </div>
                  )}

                  <div className="aspect-square overflow-hidden">
                    {currentItem.image_url ? (
                      <img
                        src={currentItem.image_url}
                        alt={currentItem.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                        <ShoppingBag className="w-12 h-12 text-gray-600" />
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-gradient-to-t from-[#0a0b1e] to-transparent">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-bold text-lg">{currentItem.name}</h3>
                      {getPaymentMethod(currentItem) === "stripe" && (
                        <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/20">
                          CARD
                        </span>
                      )}
                    </div>

                    <p className="text-gray-400 text-xs mb-3 line-clamp-2">
                      {currentItem.description}
                    </p>

                    <div className="flex items-center gap-2">
                      <span
                        className="text-cyan-300 font-bold text-lg"
                        style={{ textShadow: "0 0 10px rgba(34,211,238,0.35)" }}
                      >
                        {getDisplayPrice(currentItem)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center gap-2 mt-4">
              {filteredItems.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCarouselIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === carouselIndex
                      ? "w-6 bg-pink-500"
                      : "w-2 bg-gray-600 hover:bg-gray-500"
                  }`}
                  type="button"
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-gray-600" />
            No items in this category
          </div>
        )}
      </div>

      <div className="py-3 text-center border-t border-gray-800/50 mt-4">
        <p className="text-xs text-gray-500">💎 1000 Z Points = 1 ZWAP</p>
      </div>

      {/* Purchase Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-md bg-[#0f1029] border-pink-500/30 rounded-3xl">
          {purchaseSuccess ? (
            <div className="text-center py-4">
              <motion.div
                className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
              >
                <Check className="w-8 h-8 text-green-400" />
              </motion.div>

              <DialogTitle className="text-xl text-white mb-2">
                Purchase Complete
              </DialogTitle>
              <DialogDescription className="text-gray-400 text-sm mb-4">
                You purchased {selectedItem?.name}
              </DialogDescription>

              <div className="flex justify-center gap-2">
                <Button
                  onClick={() => {
                    handleCloseDialog();
                    setShowInventory(true);
                  }}
                  className="bg-gradient-to-r from-pink-500 to-purple-500"
                >
                  View Inventory
                </Button>
                <Button
                  onClick={handleCloseDialog}
                  variant="outline"
                  className="border-gray-700"
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          ) : selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg text-white flex items-center gap-2">
                  {selectedItem.name}
                  {selectedItem.plus_only && (
                    <Crown className="w-4 h-4 text-yellow-400" />
                  )}
                  {selectedItemOwned && (
                    <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/20">
                      OWNED
                    </span>
                  )}
                </DialogTitle>

                <DialogDescription className="text-gray-400 text-sm">
                  {selectedItem.description}
                </DialogDescription>
              </DialogHeader>

              <div className="aspect-video rounded-2xl overflow-hidden my-3 bg-gray-900">
                {selectedItem.image_url ? (
                  <img
                    src={selectedItem.image_url}
                    alt={selectedItem.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-gray-600" />
                  </div>
                )}
              </div>

              {selectedPaymentMethod === "zwap" && (
                <div className="space-y-2 mb-3">
                  <p className="text-xs text-gray-400">Pay with:</p>
                  <button
                    type="button"
                    onClick={() => setPaymentType("zwap")}
                    className="w-full p-3 rounded-2xl border border-cyan-500 bg-cyan-500/20 flex items-center gap-3"
                  >
                    <Coins className="w-4 h-4 text-cyan-400" />
                    <div className="text-left">
                      <p className="text-cyan-300 font-bold text-sm">
                        {selectedItem.price_zwap} ZWAP
                      </p>
                      <p className={`text-[10px] ${canAffordZwap(selectedItem.price_zwap) ? "text-green-400" : "text-red-400"}`}>
                        {canAffordZwap(selectedItem.price_zwap) ? "✓ Available" : "✗ Insufficient"}
                      </p>
                    </div>
                  </button>
                </div>
              )}

              {selectedPaymentMethod === "zpts" && (
                <div className="space-y-2 mb-3">
                  <p className="text-xs text-gray-400">Pay with:</p>
                  <button
                    type="button"
                    onClick={() => setPaymentType("zpts")}
                    className="w-full p-3 rounded-2xl border border-purple-500 bg-purple-500/20 flex items-center gap-3"
                  >
                    <Zap className="w-4 h-4 text-purple-400" />
                    <div className="text-left">
                      <p className="text-purple-300 font-bold text-sm">
                        {selectedItem.price_zpts} zPts
                      </p>
                      <p className={`text-[10px] ${canAffordZpts(selectedItem.price_zpts) ? "text-green-400" : "text-red-400"}`}>
                        {canAffordZpts(selectedItem.price_zpts) ? "✓ Available" : "✗ Insufficient"}
                      </p>
                    </div>
                  </button>
                </div>
              )}

              {selectedPaymentMethod === "stripe" && (
                <div className="space-y-2 mb-3">
                  <p className="text-xs text-gray-400">Payment method:</p>
                  <div className="w-full p-3 rounded-2xl border border-emerald-500 bg-emerald-500/15 flex items-center gap-3">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    <div className="text-left">
                      <p className="text-emerald-300 font-bold text-sm">
                        ${Number(selectedItem.price_stripe || 0).toFixed(2)} USD
                      </p>
                      <p className="text-[10px] text-emerald-400">Secure Stripe checkout</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {selectedPaymentMethod !== "stripe" && (
                  <Button
                    data-testid="confirm-purchase"
                    onClick={handlePurchase}
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
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (selectedItem.plus_only && user?.tier !== "plus") ? (
                      "Plus Required"
                    ) : (
                      "Confirm Purchase"
                    )}
                  </Button>
                )}

                {selectedPaymentMethod === "stripe" && (
                  <Button
                    type="button"
                    onClick={handleStripeCheckout}
                    disabled={isPurchasing || (selectedItem.plus_only && user?.tier !== "plus")}
                    className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-black hover:opacity-90"
                  >
                    {isPurchasing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Redirecting...
                      </>
                    ) : (selectedItem.plus_only && user?.tier !== "plus") ? (
                      "Plus Required"
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay with Card
                      </>
                    )}
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Inventory Dialog */}
      <Dialog open={showInventory} onOpenChange={setShowInventory}>
        <DialogContent className="sm:max-w-lg bg-[#0f1029] border-cyan-500/30 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-cyan-400" />
              My Inventory
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Your purchased items, downloads, and unlocked rewards
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[55vh] overflow-y-auto space-y-3 pr-1">
            {inventoryLoading ? (
              <div className="py-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-cyan-400 mx-auto" />
              </div>
            ) : inventoryDisplayItems.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                No owned items yet
              </div>
            ) : (
              inventoryDisplayItems.map((item, idx) => (
                <div
                  key={`${item.item_id}-${idx}`}
                  className="rounded-2xl border border-gray-700 bg-gray-800/30 p-3 flex gap-3"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-900 flex-shrink-0">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-600" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold">{item.name}</p>
                    {item.description && (
                      <p className="text-gray-400 text-xs line-clamp-2 mt-1">
                        {item.description}
                      </p>
                    )}
                    <p className="text-[10px] text-gray-500 mt-2">
                      Added {item.granted_at ? new Date(item.granted_at).toLocaleString() : "recently"}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.download_url && (
                        <a
                          href={item.download_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/20 text-cyan-300 text-xs"
                        >
                          <Download className="w-3 h-3" />
                          Download
                        </a>
                      )}

                      {item.external_url && (
                        <a
                          href={item.external_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/20 text-purple-300 text-xs"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Open
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
