import React, { useState, useEffect } from "react";
import { useApp, api } from "@/App";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ShoppingBag, Check, Loader2, Crown, Coins, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function ShopTab() {
  const { user, walletAddress, refreshUser } = useApp();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [paymentType, setPaymentType] = useState("zwap");

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    try { const data = await api.getShopItems(); setItems(data); }
    catch (error) { toast.error("Failed to load"); }
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

  return (
    <div className="h-[100dvh] bg-[#0a0b1e] flex flex-col px-4 pt-4 pb-[72px] overflow-hidden" data-testid="shop-tab">
      {/* Header */}
      <div className="text-center mb-3 flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center mx-auto mb-1">
          <ShoppingBag className="w-6 h-6 text-pink-400" />
        </div>
        <h1 className="text-xl font-bold text-white">SHOP</h1>
        <p className="text-gray-400 text-xs">Zupreme Imports</p>
      </div>

      {/* Balances */}
      <div className="grid grid-cols-2 gap-2 mb-3 flex-shrink-0">
        <div className="glass-card p-2 rounded-xl flex items-center gap-2">
          <Coins className="w-4 h-4 text-cyan-400" />
          <div>
            <p className="text-[10px] text-gray-400">ZWAP</p>
            <p className="text-sm font-bold text-cyan-400">{user?.zwap_balance?.toFixed(0) || "0"}</p>
          </div>
        </div>
        <div className="glass-card p-2 rounded-xl flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-400" />
          <div>
            <p className="text-[10px] text-gray-400">Z Points</p>
            <p className="text-sm font-bold text-purple-400">{user?.zpts_balance || 0}</p>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="flex-1 overflow-y-auto min-h-0 -mx-1 px-1">
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-cyan-400 animate-spin" /></div>
        ) : (
          <div className="space-y-4">
            {categories.map(category => (
              <div key={category}>
                <h2 className="text-sm font-semibold text-gray-400 mb-2 capitalize">{category}</h2>
                <div className="grid grid-cols-3 gap-2">
                  {items.filter(item => item.category === category).map(item => (
                    <div
                      key={item.id}
                      data-testid={`shop-item-${item.id}`}
                      onClick={() => setSelectedItem(item)}
                      className="shop-card rounded-xl overflow-hidden cursor-pointer relative"
                    >
                      {item.plus_only && (
                        <div className="absolute top-1 right-1 bg-yellow-500/80 rounded px-1">
                          <Crown className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div className="aspect-square overflow-hidden">
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-1.5">
                        <h3 className="text-white font-medium text-[10px] truncate">{item.name}</h3>
                        <div className="flex gap-1 mt-0.5">
                          <span className="text-cyan-400 font-bold text-[10px]">{item.price_zwap}</span>
                          {item.price_zpts && <span className="text-purple-400 text-[10px]">/ {item.price_zpts}zP</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Z Points Conversion Tip */}
      <div className="mt-2 text-center text-[10px] text-gray-500 flex-shrink-0">
        💡 1000 Z Points = 1 ZWAP
      </div>

      {/* Purchase Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-sm bg-[#0f1029] border-pink-500/30">
          {purchaseSuccess ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                <Check className="w-7 h-7 text-green-400" />
              </div>
              <DialogTitle className="text-lg text-white mb-2">Purchase Complete!</DialogTitle>
              <DialogDescription className="text-gray-400 text-sm mb-4">You've purchased {selectedItem?.name}</DialogDescription>
              <Button onClick={handleCloseDialog} className="bg-pink-500 hover:bg-pink-600">Continue</Button>
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
                    className={`p-2 rounded-lg border transition-all ${
                      paymentType === "zwap" 
                        ? "border-cyan-500 bg-cyan-500/20" 
                        : "border-gray-700 bg-gray-800/50"
                    }`}
                  >
                    <p className="text-cyan-400 font-bold">{selectedItem.price_zwap} ZWAP</p>
                    <p className={`text-[10px] ${canAffordZwap(selectedItem.price_zwap) ? "text-green-400" : "text-red-400"}`}>
                      {canAffordZwap(selectedItem.price_zwap) ? "✓ Available" : "✗ Insufficient"}
                    </p>
                  </button>
                  
                  {selectedItem.price_zpts && (
                    <button
                      onClick={() => setPaymentType("zpts")}
                      className={`p-2 rounded-lg border transition-all ${
                        paymentType === "zpts" 
                          ? "border-purple-500 bg-purple-500/20" 
                          : "border-gray-700 bg-gray-800/50"
                      }`}
                    >
                      <p className="text-purple-400 font-bold">{selectedItem.price_zpts} zPts</p>
                      <p className={`text-[10px] ${canAffordZpts(selectedItem.price_zpts) ? "text-green-400" : "text-red-400"}`}>
                        {canAffordZpts(selectedItem.price_zpts) ? "✓ Available" : "✗ Insufficient"}
                      </p>
                    </button>
                  )}
                </div>
              </div>

              <Button
                data-testid="confirm-purchase"
                onClick={handlePurchase}
                disabled={
                  isPurchasing || 
                  selectedItem.plus_only && user?.tier !== "plus" ||
                  (paymentType === "zwap" && !canAffordZwap(selectedItem.price_zwap)) ||
                  (paymentType === "zpts" && !canAffordZpts(selectedItem.price_zpts))
                }
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500"
              >
                {isPurchasing ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
                ) : selectedItem.plus_only && user?.tier !== "plus" ? (
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
