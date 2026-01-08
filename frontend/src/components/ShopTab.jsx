import React, { useState, useEffect } from "react";
import { useApp, api } from "@/App";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ShoppingBag, Check, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function ShopTab() {
  const { user, walletAddress, refreshUser } = useApp();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

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
      await api.purchaseItem(walletAddress, selectedItem.id);
      setPurchaseSuccess(true);
      await refreshUser();
      toast.success(`Purchased ${selectedItem.name}!`);
    } catch (error) { toast.error(error.message || "Purchase failed"); }
    finally { setIsPurchasing(false); }
  };

  const handleCloseDialog = () => { setSelectedItem(null); setPurchaseSuccess(false); };

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

      {/* Balance */}
      <div className="glass-card p-3 mb-3 flex items-center justify-between flex-shrink-0">
        <div>
          <p className="text-gray-400 text-xs">Your Balance</p>
          <p className="text-xl font-bold text-cyan-400" data-testid="shop-balance">{user?.zwap_balance?.toFixed(0) || "0"} ZWAP</p>
        </div>
      </div>

      {/* Items Grid - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0 -mx-1 px-1">
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-cyan-400 animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {items.map(item => (
              <div
                key={item.id}
                data-testid={`shop-item-${item.id}`}
                onClick={() => setSelectedItem(item)}
                className="shop-card rounded-xl overflow-hidden cursor-pointer"
              >
                <div className="aspect-square overflow-hidden">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-2">
                  <h3 className="text-white font-medium text-xs truncate">{item.name}</h3>
                  <span className="text-cyan-400 font-bold text-xs">{item.price}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Purchase Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-sm bg-[#0f1029] border-pink-500/30">
          {purchaseSuccess ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <DialogTitle className="text-xl text-white mb-2">Purchase Complete!</DialogTitle>
              <DialogDescription className="text-gray-400 mb-4">You've purchased {selectedItem?.name}</DialogDescription>
              <Button onClick={handleCloseDialog} className="bg-pink-500 hover:bg-pink-600">Continue</Button>
            </div>
          ) : selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg text-white">{selectedItem.name}</DialogTitle>
                <DialogDescription className="text-gray-400 text-sm">{selectedItem.description}</DialogDescription>
              </DialogHeader>
              <div className="aspect-video rounded-lg overflow-hidden my-3">
                <img src={selectedItem.image_url} alt={selectedItem.name} className="w-full h-full object-cover" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Price</span>
                  <span className="text-xl font-bold text-cyan-400">{selectedItem.price} ZWAP</span>
                </div>
                <Button
                  data-testid="confirm-purchase"
                  onClick={handlePurchase}
                  disabled={isPurchasing || (user?.zwap_balance || 0) < selectedItem.price}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500"
                >
                  {isPurchasing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</> : (user?.zwap_balance || 0) < selectedItem.price ? "Insufficient Balance" : "Confirm Purchase"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
