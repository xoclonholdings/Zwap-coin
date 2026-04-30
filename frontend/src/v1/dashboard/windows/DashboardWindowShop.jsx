import React, { useMemo, useState } from "react";
import {
  BookOpen,
  ChevronRight,
  Gem,
  Lock,
  ShoppingBag,
  Sparkles,
  Zap,
} from "lucide-react";

const SHOP_UNLOCK_THRESHOLD = 1000;

const DEFAULT_SHOP_CATEGORIES = [
  { id: "boosts", label: "Boosts", icon: Zap },
  { id: "ebooks", label: "eBooks", icon: BookOpen },
  { id: "cosmetics", label: "Cosmetics", icon: Gem },
  { id: "featured", label: "Featured", icon: Sparkles },
];

function clamp(value, min = 0, max = 100) {
  return Math.min(Math.max(value, min), max);
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function formatMoney(value) {
  return Number(value || 0).toFixed(2);
}

function getCategoryIcon(category = {}) {
  if (category.icon) return category.icon;

  const key = String(category.id || category.label || "").toLowerCase();

  if (key.includes("boost")) return Zap;
  if (key.includes("book") || key.includes("ebook")) return BookOpen;
  if (key.includes("cosmetic") || key.includes("identity")) return Gem;
  if (key.includes("featured") || key.includes("bundle")) return Sparkles;

  return ShoppingBag;
}

function getCategoryId(category = {}) {
  return category.id || category.category_id || category.slug || "";
}

function getCategoryLabel(category = {}) {
  return category.label || category.name || "Category";
}

function getItemCategoryId(item = {}) {
  return item.category || item.category_id || item.categoryId || "featured";
}

function getItemName(item = {}) {
  return item.name || item.title || "Shop Item";
}

function getItemDescription(item = {}) {
  return item.description || item.subtitle || "Tap to view item.";
}

function getItemPrice(item = {}) {
  if (item.payment_method === "stripe") {
    return item.price_stripe ?? 0;
  }

  if (item.payment_method === "zwap") {
    return item.price_zwap ?? 0;
  }

  return item.price_zpts ?? 0;
}

function getItemCurrencyLabel(item = {}) {
  if (item.payment_method === "stripe") return "USD";
  if (item.payment_method === "zwap") return "ZWAP";
  return "zPts";
}

function getFormattedItemPrice(item = {}) {
  const price = getItemPrice(item);
  const currency = getItemCurrencyLabel(item);

  if (currency === "USD") {
    return `$${formatMoney(price)}`;
  }

  return `${formatNumber(price)} ${currency}`;
}

export default function DashboardWindowShop({
  lifetimeZpts = 0,
  zptsBalance = 0,
  shopUnlocked,
  categories = DEFAULT_SHOP_CATEGORIES,
  items = [],
  selectedCategoryId,
  onCategoryChange,
  onPurchaseItem,
}) {
  const [isAltView, setIsAltView] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);

  const safeCategories =
    Array.isArray(categories) && categories.length > 0
      ? categories
      : DEFAULT_SHOP_CATEGORIES;

  const firstCategoryId = getCategoryId(safeCategories[0]) || "featured";

  const [localCategoryId, setLocalCategoryId] = useState(
    selectedCategoryId || firstCategoryId
  );

  const [selectedItem, setSelectedItem] = useState(null);

  const activeCategoryId = selectedCategoryId || localCategoryId;

  const unlockProgressSource = Math.max(
    Number(lifetimeZpts || 0),
    Number(zptsBalance || 0)
  );

  const progress = clamp((unlockProgressSource / SHOP_UNLOCK_THRESHOLD) * 100);

  const isUnlocked =
    typeof shopUnlocked === "boolean"
      ? shopUnlocked
      : unlockProgressSource >= SHOP_UNLOCK_THRESHOLD;

  const visibleItems = useMemo(() => {
    if (!Array.isArray(items)) return [];
    return items.filter(
      (item) => getItemCategoryId(item) === activeCategoryId
    );
  }, [items, activeCategoryId]);

  const activeCategory = safeCategories.find(
    (category) => getCategoryId(category) === activeCategoryId
  );

  const activeCategoryLabel = getCategoryLabel(activeCategory);

  const handleCardClick = () => {
    setIsAltView((v) => !v);
  };

  const handleTouchStart = (e) => {
    const t = e.touches?.[0];
    if (!t) return;
    setTouchStartX(t.clientX);
  };

  const handleTouchEnd = (e) => {
    const t = e.changedTouches?.[0];
    if (!t || touchStartX === null) return;

    const diff = t.clientX - touchStartX;

    if (Math.abs(diff) >= 36) {
      setIsAltView(diff < 0);
    }

    setTouchStartX(null);
  };

  const handleCategorySelect = (category) => {
    const id = getCategoryId(category);
    if (!id) return;

    setLocalCategoryId(id);

    if (onCategoryChange) {
      onCategoryChange(id, category);
    }

    setIsAltView(false);
  };

  const handleItemSelect = (item, e) => {
    e.stopPropagation();
    if (!isUnlocked) return;
    setSelectedItem(item);
  };

  const handleConfirmPurchase = () => {
    if (!selectedItem) return;

    if (onPurchaseItem) {
      onPurchaseItem(selectedItem);
    }

    setSelectedItem(null);
  };

  return (
    <section
      onClick={handleCardClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative flex h-full w-full flex-col overflow-hidden rounded-[1.5rem] border border-cyan-200/15 bg-[#0b1220] p-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-cyan-200" />
          <span className="text-sm font-semibold text-white">Shop</span>
        </div>

        <ChevronRight className="text-white/60" />
      </div>

      {!isUnlocked ? (
        <div className="mt-6 text-center text-white">
          <Lock className="mx-auto mb-2" />
          Unlock Shop
          <div className="mt-2 text-sm">
            {formatNumber(unlockProgressSource)} /{" "}
            {formatNumber(SHOP_UNLOCK_THRESHOLD)} zPts
          </div>
        </div>
      ) : isAltView ? (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {safeCategories.map((cat) => {
            const Icon = getCategoryIcon(cat);
            return (
              <button
                key={getCategoryId(cat)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCategorySelect(cat);
                }}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-2 text-white"
              >
                <Icon className="h-4 w-4" />
                {getCategoryLabel(cat)}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 flex gap-3 overflow-x-auto">
          {visibleItems.map((item) => (
            <div
              key={getItemName(item)}
              onClick={(e) => handleItemSelect(item, e)}
              className="min-w-[75%] rounded-xl border border-white/10 bg-white/[0.05] p-3 text-white"
            >
              <div>{getItemName(item)}</div>
              <div className="text-xs text-white/60">
                {getItemDescription(item)}
              </div>
              <div className="mt-2 text-cyan-200">
                {getFormattedItemPrice(item)}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedItem && (
        <div className="absolute inset-0 bg-black/60 p-4">
          <div className="bg-[#101827] p-4 rounded-xl">
            <div>{getItemName(selectedItem)}</div>
            <button onClick={handleConfirmPurchase}>Purchase</button>
          </div>
        </div>
      )}
    </section>
  );
}