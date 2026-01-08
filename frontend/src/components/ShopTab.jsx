import React, { useState, useEffect } from "react";
import { useApp, api } from "@/App";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ShoppingBag, Tag, Check, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function ShopTab() {
  const { user, walletAddress, refreshUser } = useApp();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const data = await api.getShopItems();
      setItems(data);
    } catch (error) {
      toast.error("Failed to load shop items");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedItem) return;
    
    setIsPurchasing(true);
    try {
      await api.purchaseItem(walletAddress, selectedItem.id);
      setPurchaseSuccess(true);
      await refreshUser();
      toast.success(`Successfully purchased ${selectedItem.name}!`);
    } catch (error) {
      toast.error(error.message || "Purchase failed");
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleCloseDialog = () => {
    setSelectedItem(null);
    setPurchaseSuccess(false);
  };

  const categories = [...new Set(items.map(item => item.category))];

  return (
    <div className="min-h-screen bg-[#0a0b1e] p-4" data-testid="shop-tab">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-pink-500/20 flex items-center justify-center mx-auto mb-3">
          <ShoppingBag className="w-8 h-8 text-pink-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-1">SHOP</h1>
        <p className="text-gray-400">Zupreme Imports</p>
      </div>

      {/* Balance */}
      <div className="glass-card p-4 mb-6 flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">Your Balance</p>
          <p className="text-2xl font-bold text-cyan-400" data-testid="shop-balance">
            {user?.zwap_balance?.toFixed(2) || "0.00"} ZWAP
          </p>
        </div>
        <Tag className="w-8 h-8 text-pink-400" />
      </div>

      {/* Items Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map(category => (
            <div key={category}>
              <h2 className="text-lg font-semibold text-white mb-4 capitalize">
                {category}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {items
                  .filter(item => item.category === category)
                  .map(item => (
                    <div
                      key={item.id}
                      data-testid={`shop-item-${item.id}`}
                      onClick={() => setSelectedItem(item)}
                      className="shop-card rounded-xl overflow-hidden cursor-pointer"
                    >
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="text-white font-medium text-sm truncate">
                          {item.name}
                        </h3>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-cyan-400 font-bold">
                            {item.price} ZWAP
                          </span>
                          {!item.in_stock && (
                            <span className="text-red-400 text-xs">Sold Out</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Purchase Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-md bg-[#0f1029] border-pink-500/30">
          {purchaseSuccess ? (
            <div className="text-center py-6">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-green-400" />
              </div>
              <DialogTitle className="text-2xl text-white mb-2">
                Purchase Complete!
              </DialogTitle>
              <DialogDescription className="text-gray-400 mb-6">
                You've successfully purchased {selectedItem?.name}
              </DialogDescription>
              <Button
                onClick={handleCloseDialog}
                className="bg-pink-500 hover:bg-pink-600"
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl text-white">
                  {selectedItem?.name}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  {selectedItem?.description}
                </DialogDescription>
              </DialogHeader>

              {selectedItem && (
                <>
                  <div className="aspect-video rounded-lg overflow-hidden my-4">
                    <img
                      src={selectedItem.image_url}
                      alt={selectedItem.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Price</span>
                      <span className="text-2xl font-bold text-cyan-400">
                        {selectedItem.price} ZWAP
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Your Balance</span>
                      <span className={`font-medium ${
                        (user?.zwap_balance || 0) >= selectedItem.price 
                          ? "text-green-400" 
                          : "text-red-400"
                      }`}>
                        {user?.zwap_balance?.toFixed(2) || "0.00"} ZWAP
                      </span>
                    </div>

                    <Button
                      data-testid="confirm-purchase"
                      onClick={handlePurchase}
                      disabled={
                        isPurchasing || 
                        !selectedItem.in_stock ||
                        (user?.zwap_balance || 0) < selectedItem.price
                      }
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                    >
                      {isPurchasing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (user?.zwap_balance || 0) < selectedItem.price ? (
                        "Insufficient Balance"
                      ) : (
                        "Confirm Purchase"
                      )}
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
