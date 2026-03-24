import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useApp } from "@/App";
import api from "@/lib/api";

import ShopHome from "@/components/shop/ShopHome";
import ShopInventoryDialog from "@/components/shop/ShopInventoryDialog";
import ShopPurchaseDialog from "@/components/shop/ShopPurchaseDialog";
import ShopRewardsFeedback from "@/components/shop/ShopRewardsFeedback";

const API_BASE = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ShopTab() {
  const { user, walletAddress, refreshUser } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const query = new URLSearchParams(location.search);
  const paymentSuccess = query.get("payment") === "success";
  const purchasedItemId = query.get("item");

  const [feedback, setFeedback] = useState(null);

  const [items, setItems] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inventoryLoading, setInventoryLoading] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  const [paymentType, setPaymentType] = useState("zwap");
  const [activeCategory, setActiveCategory] = useState(null);

  const [purchasedItem, setPurchasedItem] = useState(null);
  const [showInventory, setShowInventory] = useState(false);

  const loadItems = useCallback(async () => {
    setIsLoading(true);

    try {
      const data = await api.getShopItems();
      const loaded = Array.isArray(data) ? data : data?.items || [];

      setItems(loaded);

      const categoryList = [
        ...new Set(loaded.map((item) => item.category).filter(Boolean)),
      ];

      if (categoryList.length > 0) {
        setActiveCategory((prev) => prev || categoryList[0]);
      }
    } catch (error) {
      console.error("Failed to load shop items:", error);
      toast.error("Failed to load items");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadInventory = useCallback(async () => {
    if (!walletAddress) return;

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

  const getPaymentMethod = useCallback((item) => {
    if (!item) return "zwap";
    if (item.payment_method) return item.payment_method;
    if (item.price_stripe && Number(item.price_stripe) > 0) return "stripe";

    if (
      item.price_zpts &&
      Number(item.price_zpts) > 0 &&
      (!item.price_zwap || Number(item.price_zwap) === 0)
    ) {
      return "zpts";
    }

    return "zwap";
  }, []);

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

  const openItem = useCallback(
    (item) => {
      setSelectedItem(item);
      setPurchaseSuccess(false);
      setPaymentType(getPaymentMethod(item));
    },
    [getPaymentMethod]
  );

  const handleCloseDialog = useCallback(() => {
    setSelectedItem(null);
    setPurchaseSuccess(false);
    setPaymentType("zwap");
  }, []);

  const clearSuccessState = useCallback(() => {
    const nextQuery = new URLSearchParams(location.search);
    nextQuery.delete("payment");
    nextQuery.delete("item");

    navigate(
      {
        pathname: location.pathname,
        search: nextQuery.toString() ? `?${nextQuery.toString()}` : "",
      },
      { replace: true }
    );
  }, [location.pathname, location.search, navigate]);

  const handlePurchase = useCallback(async () => {
    if (!selectedItem || !walletAddress) return;

    setIsPurchasing(true);

    try {
      await api.purchaseItem(walletAddress, selectedItem.id, paymentType);
      setPurchaseSuccess(true);

      setFeedback({
        id: Date.now(),
        title: "Purchase Complete",
        subtitle: selectedItem.name,
        priceLabel:
          paymentType === "zpts"
            ? `${Number(selectedItem.price_zpts || 0)} zPts`
            : `${Number(selectedItem.price_zwap || 0)} ZWAP`,
      });

      await refreshUser();
      await loadInventory();

      toast.success(`Purchased ${selectedItem.name}!`);
    } catch (error) {
      console.error("Purchase failed:", error);
      toast.error(error?.message || "Purchase failed");
    } finally {
      setIsPurchasing(false);
    }
  }, [selectedItem, walletAddress, paymentType, refreshUser, loadInventory]);

  const handleStripeCheckout = useCallback(async () => {
    if (!selectedItem || !walletAddress) return;

    setIsPurchasing(true);

    try {
      const isPlusSubscription =
        selectedItem.id === "plus_subscription" ||
        selectedItem.name?.toLowerCase() === "plus";

      const endpoint = isPlusSubscription
        ? `${process.env.REACT_APP_BACKEND_URL}/stripe/create-subscription-checkout`
        : `${process.env.REACT_APP_BACKEND_URL}/stripe/create-checkout`;

      const body = isPlusSubscription
        ? {
            wallet_address: walletAddress,
            origin_url: window.location.origin,
          }
        : {
            item_id: selectedItem.id,
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
        throw new Error(data?.detail || "Failed to create Stripe checkout session");
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("Stripe checkout failed:", error);
      toast.error(error?.message || "Stripe checkout failed");
    } finally {
      setIsPurchasing(false);
    }
  }, [selectedItem, walletAddress]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    if (walletAddress) {
      loadInventory();
    } else {
      setInventoryItems([]);
    }
  }, [walletAddress, loadInventory]);

  useEffect(() => {
    if (!purchasedItemId || items.length === 0) return;

    const found = items.find(
      (item) => item.id === purchasedItemId || item._id === purchasedItemId
    );

    if (found) {
      setPurchasedItem(found);
    }
  }, [purchasedItemId, items]);

  const ownedItemIds = useMemo(() => {
    return new Set(inventoryItems.map((item) => item.item_id));
  }, [inventoryItems]);

  const balances = useMemo(() => {
    return {
      zwap: Number(user?.zwap_balance || 0),
      zpts: Number(user?.zpts_balance || 0),
      tier: user?.tier || "starter",
    };
  }, [user]);

  const categories = useMemo(() => {
    return [...new Set(items.map((item) => item.category).filter(Boolean))];
  }, [items]);

  const groupedItems = useMemo(() => {
    const groups = {};

    categories.forEach((category) => {
      groups[category] = items.filter((item) => item.category === category);
    });

    groups.Featured = items.filter(
      (item) =>
        item.is_featured ||
        item.featured ||
        item.category === "featured" ||
        item.category === "Featured"
    );

    if (!groups.Featured.length) {
      groups.Featured = items.slice(0, 6);
    }

    groups.All = items;

    return groups;
  }, [items, categories]);

  const selectedPaymentMethod = getPaymentMethod(selectedItem);
  const selectedItemOwned = selectedItem
    ? ownedItemIds.has(selectedItem.id)
    : false;

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
    <>
      <ShopHome
        user={user}
        isLoading={isLoading}
        balances={balances}
        items={items}
        groupedItems={groupedItems}
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        ownedItemIds={ownedItemIds}
        paymentSuccess={paymentSuccess}
        purchasedItem={purchasedItem}
        onClearSuccess={clearSuccessState}
        onOpenInventory={() => setShowInventory(true)}
        onRefresh={loadItems}
        onOpenItem={openItem}
      />

      <ShopRewardsFeedback
        feedback={feedback}
        onDismiss={() => setFeedback(null)}
      />

      <ShopPurchaseDialog
        selectedItem={selectedItem}
        selectedPaymentMethod={selectedPaymentMethod}
        selectedItemOwned={selectedItemOwned}
        purchaseSuccess={purchaseSuccess}
        isPurchasing={isPurchasing}
        paymentType={paymentType}
        setPaymentType={setPaymentType}
        canAffordZwap={canAffordZwap}
        canAffordZpts={canAffordZpts}
        user={user}
        onClose={handleCloseDialog}
        onPurchase={handlePurchase}
        onStripeCheckout={handleStripeCheckout}
        onViewInventory={() => {
          handleCloseDialog();
          setShowInventory(true);
        }}
      />

      <ShopInventoryDialog
        open={showInventory}
        onOpenChange={setShowInventory}
        inventoryLoading={inventoryLoading}
        inventoryItems={inventoryDisplayItems}
      />
    </>
  );
}