import React, { useState, useEffect } from "react";
import { useApp, ZUPREME_LOGO } from "@/App";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Crown, Coins, Zap, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function ShopTab() {
  const { user, walletAddress, refreshUser } = useApp();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [paymentType, setPaymentType] = useState("zwap");
  const [activeCategory, setActiveCategory] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    try { 
      const data = await api.getShopItems(); 
      setItems(data);
      const categories = [...new Set(data.map(item => item.category))];
      if (categories.length > 0) setActiveCategory(categories[0]);
    }
    catch (error) { toast.error("Failed to load items"); }
    finally { setIsLoading(false); }
  };

  const handlePurchase = async () => {
    if (!selectedItem) return;
    setIsPurchasing(true);
    try {
      await api.purchaseItem(walletAddress, selectedItem.id, paymentType);
      setPurchaseSuccess(true);
      await refreshUser();
      toast.success(`Purchased ${selectedItem.name}!`);
    } catch (error) { toast.error(error.message || "Purchase failed"); }
    finally { setIsPurchasing(false); }
  };

  const handleCloseDialog = () => { 
    setSelectedItem(null); 
    setPurchaseSuccess(false); 
    setPaymentType("zwap");
  };

  const canAffordZwap = (price) => (user?.zwap_balance || 0) >= price;
  const canAffordZpts = (price) => price && (user?.zpts_balance || 0) >= price;

  const categories = [...new Set(items.map(item => item.category))];
  const filteredItems = items.filter(item => item.category === activeCategory);

  const nextItem = () => {
    setCarouselIndex((prev) => (prev + 1) % filteredItems.length);
  };

  const prevItem = () => {
    setCarouselIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
  };

  useEffect(() => {
    setCarouselIndex(0);
  }, [activeCategory]);

  const currentItem = filteredItems[carouselIndex];

  return (
    <div className="min-h-[calc(100dvh-160px)] bg-[#0a0b1e] flex flex-col" data-testid="shop-tab">
      {/* Header with glowing icon */}
      <div className="text-center py-4 px-4">
        <div className="w-14 h-14 rounded-full bg-pink-500/20 flex items-center justify-center mx-auto mb-2 pulse-glow-pink">
          <ShoppingBag className="w-7 h-7 text-pink-400" />
        </div>
        <h1 className="text-xl font-bold text-white">SHOP</h1>
        <p className="text-gray-400 text-xs">Shop with ZWAP!</p>
      </div>

      {/* Zupreme Imports Logo */}
      <div className="relative px-4 pb-2">
        <motion.img 
          src={ZUPREME_LOGO} 
          alt="Zupreme Imports" 
          className="h-12 sm:h-14 mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            filter: "drop-shadow(0 0 15px rgba(236,72,153,0.4))"
          }}
        />
      </div>

      {/* Category Toolbar */}
      <div className="px-4 pb-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                activeCategory === category
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                  : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-pink-500/50'
              }`}
              style={activeCategory === category ? { boxShadow: "0 0 20px rgba(236,72,153,0.4)" } : {}}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Carousel Product Display */}
      <div className="flex-1 flex items-center justify-center px-4 relative">
        {isLoading ? (
          <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
        ) : filteredItems.length > 0 && currentItem ? (
          <div className="w-full max-w-sm relative">
            {/* Navigation Arrows */}
            {filteredItems.length > 1 && (
              <>
                <button
                  onClick={prevItem}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-10 h-10 rounded-full bg-gray-800/80 border border-gray-700 flex items-center justify-center text-white hover:bg-pink-500/30 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextItem}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-10 h-10 rounded-full bg-gray-800/80 border border-gray-700 flex items-center justify-center text-white hover:bg-pink-500/30 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Product Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentItem.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedItem(currentItem)}
                className="cursor-pointer"
              >
                <div
                  className="rounded-2xl overflow-hidden border border-pink-500/30 bg-gradient-to-br from-gray-800/50 to-gray-900/50"
                  style={{ boxShadow: "0 0 25px rgba(236,72,153,0.25)" }}
                >
                  {currentItem.plus_only && (
                    <div className="absolute top-3 right-3 z-10 bg-yellow-500 rounded-full px-2 py-1 flex items-center gap-1">
                      <Crown className="w-3 h-3 text-white" />
                      <span className="text-xs text-white font-semibold">Plus</span>
                    </div>
                  )}
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src={currentItem.image_url} 
                      alt={currentItem.name} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 bg-gradient-to-t from-[#0a0b1e] to-transparent">
                    <h3 className="text-white font-bold text-lg mb-1">{currentItem.name}</h3>
                    <p className="text-gray-400 text-xs mb-3 line-clamp-2">{currentItem.description}</p>
                    <div className="flex items-center gap-3">
                      <span 
                        className="text-cyan-400 font-bold text-xl"
                        style={{ textShadow: "0 0 10px rgba(0,245,255,0.5)" }}
                      >
                        {currentItem.price_zwap} ZWAP
                      </span>
                      {currentItem.price_zpts && (
                        <>
                          <span className="text-gray-600">/</span>
                          <span 
                            className="text-purple-400 font-semibold"
                            style={{ textShadow: "0 0 10px rgba(153,69,255,0.5)" }}
                          >
                            {currentItem.price_zpts} zPts
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Carousel Dots */}
            <div className="flex justify-center gap-2 mt-4">
              {filteredItems.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCarouselIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === carouselIndex ? 'w-6 bg-pink-500' : 'w-2 bg-gray-600 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No items in this category</p>
        )}
      </div>

      {/* Conversion tip */}
      <div className="py-3 text-center border-t border-gray-800/50">
        <p className="text-xs text-gray-500">💎 1000 Z Points = 1 ZWAP</p>
      </div>

      {/* Purchase Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-sm bg-[#0f1029] border-pink-500/30">
          {purchaseSuccess ? (
            <div className="text-center py-4">
              <motion.div 
                className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
              >
                <Check className="w-7 h-7 text-green-400" />
              </motion.div>
              <DialogTitle className="text-lg text-white mb-2">Purchase Complete!</DialogTitle>
              <DialogDescription className="text-gray-400 text-sm mb-4">You've purchased {selectedItem?.name}</DialogDescription>
              <Button onClick={handleCloseDialog} className="bg-pink-500 hover:bg-pink-600">Continue Shopping</Button>
            </div>
          ) : selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base text-white flex items-center gap-2">
                  {selectedItem.name}
                  {selectedItem.plus_only && <Crown className="w-4 h-4 text-yellow-400" />}
                </DialogTitle>
                <DialogDescription className="text-gray-400 text-xs">{selectedItem.description}</DialogDescription>
              </DialogHeader>
              
              <div className="aspect-video rounded-lg overflow-hidden my-3">
                <img src={selectedItem.image_url} alt={selectedItem.name} className="w-full h-full object-cover" />
              </div>

              {/* Payment options */}
              <div className="space-y-2 mb-3">
                <p className="text-xs text-gray-400">Pay with:</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentType("zwap")}
                    className={`p-3 rounded-xl border transition-all flex items-center gap-2 ${
                      paymentType === "zwap" 
                        ? "border-cyan-500 bg-cyan-500/20" 
                        : "border-gray-700 bg-gray-800/50"
                    }`}
                  >
                    <Coins className="w-4 h-4 text-cyan-400" />
                    <div className="text-left">
                      <p className="text-cyan-400 font-bold text-sm">{selectedItem.price_zwap}</p>
                      <p className={`text-[10px] ${canAffordZwap(selectedItem.price_zwap) ? "text-green-400" : "text-red-400"}`}>
                        {canAffordZwap(selectedItem.price_zwap) ? "✓ Available" : "✗ Insufficient"}
                      </p>
                    </div>
                  </button>
                  
                  {selectedItem.price_zpts && (
                    <button
                      onClick={() => setPaymentType("zpts")}
                      className={`p-3 rounded-xl border transition-all flex items-center gap-2 ${
                        paymentType === "zpts" 
                          ? "border-purple-500 bg-purple-500/20" 
                          : "border-gray-700 bg-gray-800/50"
                      }`}
                    >
                      <Zap className="w-4 h-4 text-purple-400" />
                      <div className="text-left">
                        <p className="text-purple-400 font-bold text-sm">{selectedItem.price_zpts} zPts</p>
                        <p className={`text-[10px] ${canAffordZpts(selectedItem.price_zpts) ? "text-green-400" : "text-red-400"}`}>
                          {canAffordZpts(selectedItem.price_zpts) ? "✓ Available" : "✗ Insufficient"}
                        </p>
                      </div>
                    </button>
                  )}
                </div>
              </div>

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
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
                ) : (selectedItem.plus_only && user?.tier !== "plus") ? (
                  "Plus Required"
                ) : (
                  "Confirm Purchase"
                )}
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
