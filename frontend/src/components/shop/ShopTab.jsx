import React, { useEffect, useMemo, useState, useCallback } from "react";

import { useApp } from "@/App";
import api from "@/lib/api";

import ShopHome from "@/components/shop/ShopHome";
import ShopMarketplaceCard from "@/components/shop/ShopMarketplaceCard";
import ShopInventoryCard from "@/components/shop/ShopInventoryCard";

const API_BASE = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ShopTab() {
  const { user, walletAddress, refreshUser } = useApp();

  const [items, setItems] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inventoryLoading, setInventoryLoading] = useState(false);

  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  const loadItems = useCallback(async () => {
    setIsLoading(true);

    try {
      const data = await api.getShopItems();
      const loaded = Array.isArray(data) ? data : data?.items || [];
      setItems(loaded);
    } catch (error) {
      console.error("Failed to load shop items:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadInventory = useCallback(async () => {
    if (!walletAddress) {
      setInventoryItems([]);
      return;
    }

    setInventoryLoading(true);

    try {
      const res = await fetch(`${API_BASE}/users/${walletAddress}/inventory`);
      const data = await res.json();
      const loaded = Array.isArray(data) ? data : data?.items || [];
      setInventoryItems(loaded);
    } catch (error) {
      console.error("Inventory load failed:", error);
    } finally {
      setInventoryLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const balances = useMemo(() => {
    return {
      zwap: Number(user?.zwap_balance || 0),
      zpts: Number(user?.zpts_balance || 0),
      tier: user?.tier || "starter",
    };
  }, [user]);

  const ownedItemIds = useMemo(() => {
    return new Set(inventoryItems.map((item) => item.item_id));
  }, [inventoryItems]);

  const inventoryDisplayItems = useMemo(() => {
    return inventoryItems.map((owned) => {
      const fullItem = items.find(
        (item) => item.id === owned.item_id || item._id === owned.item_id
      );

      return {
        ...owned,
        id: owned.item_id,
        name: owned.item_name || fullItem?.name || "Owned Item",
        image_url: fullItem?.image_url || null,
        description: fullItem?.description || "",
        download_url: fullItem?.download_url || null,
        external_url: fullItem?.external_url || null,
      };
    });
  }, [inventoryItems, items]);

  const canAffordZwap = useCallback(
    (price) => (user?.zwap_balance || 0) >= Number(price || 0),
    [user]
  );

  const canAffordZpts = useCallback(
    (price) =>
      Number(price || 0) > 0 &&
      (user?.zpts_balance || 0) >= Number(price || 0),
    [user]
  );

  const handlePurchase = useCallback(
    async (item, paymentType) => {
      if (!item || !walletAddress) return;

      setIsPurchasing(true);

      try {
        await api.purchaseItem(walletAddress, item.id || item._id, paymentType);
        setPurchaseSuccess(true);

        await refreshUser();
        await loadInventory();
      } catch (error) {
        console.error("Purchase failed:", error);
      } finally {
        setIsPurchasing(false);
      }
    },
    [walletAddress, refreshUser, loadInventory]
  );

  const handleStripeCheckout = useCallback(
    async (item) => {
      if (!item || !walletAddress) return;

      setIsPurchasing(true);

      try {
        const itemId = item.id || item._id;
        const isPlusSubscription =
          itemId === "plus_subscription" ||
          item.name?.toLowerCase() === "plus";

        const endpoint = isPlusSubscription
          ? `${process.env.REACT_APP_BACKEND_URL}/stripe/create-subscription-checkout`
          : `${process.env.REACT_APP_BACKEND_URL}/stripe/create-checkout`;

        const body = isPlusSubscription
          ? {
              wallet_address: walletAddress,
              origin_url: window.location.origin,
            }
          : {
              item_id: itemId,
              wallet_address: walletAddress,
              purchase_type: "shop_item",
              origin_url: window.location.origin,
            };

        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        const data = await res.json();

        if (!res.ok || !data.url) {
          throw new Error("Stripe checkout failed");
        }

        window.location.href = data.url;
      } catch (error) {
        console.error("Stripe checkout failed:", error);
      } finally {
        setIsPurchasing(false);
      }
    },
    [walletAddress]
  );

  return (
    <div className="min-h-[calc(100dvh-140px)] bg-[#081017] px-4 py-4 text-white">
      <div className="mx-auto w-full max-w-md space-y-4">

        {/* CARD 1 */}
        <ShopHome
          balances={balances}
          onRefresh={loadItems}
        />

        {/* CARD 2 */}
        <ShopMarketplaceCard
          items={items}
          isLoading={isLoading}
          user={user}
          ownedItemIds={ownedItemIds}
          canAffordZwap={canAffordZwap}
          canAffordZpts={canAffordZpts}
          onPurchase={handlePurchase}
          onStripeCheckout={handleStripeCheckout}
          isPurchasing={isPurchasing}
          purchaseSuccess={purchaseSuccess}
        />

        {/* CARD 3 */}
        <ShopInventoryCard
          inventoryItems={inventoryDisplayItems}
          inventoryLoading={inventoryLoading}
        />

      </div>
    </div>
  );
}