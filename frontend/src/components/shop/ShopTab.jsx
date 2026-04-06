import React, { useEffect, useMemo, useState, useCallback } from "react";
import { toast } from "sonner";

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

  const loadItems = useCallback(async () => {
    setIsLoading(true);

    try {
      const data = await api.getShopItems();
      const loaded = Array.isArray(data) ? data : data?.items || [];
      setItems(loaded);
    } catch (error) {
      console.error("Failed to load shop items:", error);
      toast.error("Failed to load items");
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

  const inventoryDisplayItems = useMemo(() => {
    return inventoryItems.map((owned) => {
      const fullItem = items.find(
        (item) => item.id === owned.item_id || item._id === owned.item_id
      );

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
      className="min-h-[calc(100dvh-140px)] bg-[#081017] px-4 py-4 text-white"
      data-testid="shop-tab"
    >
      <div className="mx-auto w-full max-w-md space-y-4">
        <ShopHome
          balances={balances}
          items={items}
          onRefresh={loadItems}
        />

        <ShopMarketplaceCard
          items={items}
          isLoading={isLoading}
        />

        <ShopInventoryCard
          inventoryItems={inventoryDisplayItems}
          inventoryLoading={inventoryLoading}
        />
      </div>
    </div>
  );
}