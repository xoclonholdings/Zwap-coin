import { useEffect, useState } from "react";

export default function useDashboardShop({
  apiBase,
  resolvedEmail,
  refreshActivitySnapshot,
  onBalanceUpdate,
}) {
  const [shopCategories, setShopCategories] = useState([]);
  const [shopItems, setShopItems] = useState([]);
  const [shopLoading, setShopLoading] = useState(false);
  const [shopError, setShopError] = useState("");

  async function handlePurchaseShopItem(item) {
    const itemId = item?.id || item?._id;
    const paymentType = item?.payment_method || "zpts";

    if (!resolvedEmail || !itemId) return null;

    const res = await fetch(`${apiBase}/shop/purchase`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: resolvedEmail,
        item_id: itemId,
        payment_type: paymentType,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Purchase failed");
    }

    const data = await res.json();

    if (data?.zpts_balance !== undefined && typeof onBalanceUpdate === "function") {
      onBalanceUpdate(Number(data.zpts_balance || 0));
    }

    await refreshActivitySnapshot?.();

    return data;
  }

  useEffect(() => {
    let mounted = true;

    async function loadShop() {
      setShopLoading(true);
      setShopError("");

      try {
        const [categoriesResponse, itemsResponse] = await Promise.all([
          fetch(`${apiBase}/shop/categories`),
          fetch(`${apiBase}/shop/items`),
        ]);

        if (!categoriesResponse.ok) {
          throw new Error("Shop categories failed to load");
        }

        if (!itemsResponse.ok) {
          throw new Error("Shop items failed to load");
        }

        const categories = await categoriesResponse.json();
        const items = await itemsResponse.json();

        if (!mounted) return;

        setShopCategories(Array.isArray(categories) ? categories : []);
        setShopItems(Array.isArray(items) ? items : []);
      } catch (error) {
        if (!mounted) return;

        console.error("Shop load failed:", error);
        setShopError(error?.message || "Shop failed to load");
        setShopCategories([]);
        setShopItems([]);
      } finally {
        if (mounted) {
          setShopLoading(false);
        }
      }
    }

    loadShop();

    return () => {
      mounted = false;
    };
  }, [apiBase]);

  return {
    shopCategories,
    shopItems,
    shopLoading,
    shopError,
    handlePurchaseShopItem,
  };
}