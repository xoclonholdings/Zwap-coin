import React, { useMemo, useState } from "react";
import {
  BookOpen,
  ChevronRight,
  CircleDot,
  Flower2,
  Gamepad2,
  Gem,
  Lock,
  Package,
  Palette,
  PersonStanding,
  ShoppingBag,
  Sparkles,
  Zap,
} from "lucide-react";

import ShopWindowAlternate from "./shop/ShopWindowAlternate";
import ShopWindowItemView from "./shop/ShopWindowItemView";

import {
  SHOP_UNLOCK_THRESHOLD,
  clamp,
  formatNumber,
  getCategoryId,
  getCategoryLabel,
  getItemCategoryId,
  getItemDescription,
  getItemName,
  getFormattedItemPrice,
  groupCategories,
} from "./shop/shopWindowUtils";

const DEFAULT_SHOP_CATEGORIES = [
  { id: "bundle-combos", label: "Combos", group: "Bundles", icon: Package },
  { id: "move-boosts", label: "Boosts", group: "Move", icon: PersonStanding },
  { id: "play-games", label: "Games", group: "Play", icon: Gamepad2 },
  { id: "play-boosts", label: "Boosts", group: "Play", icon: Zap },
  { id: "learn-ebooks", label: "eBooks", group: "Learn", icon: BookOpen },
  { id: "profile-rings", label: "Rings", group: "Profile", icon: CircleDot },
  { id: "profile-themes", label: "Themes", group: "Profile", icon: Palette },
  { id: "garden-items", label: "Garden", group: "Garden", icon: Flower2 },
];

function getCategoryIcon(category = {}) {
  if (category.icon) return category.icon;

  const key = String(category.id || category.label || "").toLowerCase();

  if (key.includes("combo") || key.includes("bundle")) return Package;
  if (key.includes("move")) return PersonStanding;
  if (key.includes("game")) return Gamepad2;
  if (key.includes("boost")) return Zap;
  if (key.includes("book") || key.includes("ebook")) return BookOpen;
  if (key.includes("ring")) return CircleDot;
  if (key.includes("theme")) return Palette;
  if (key.includes("garden")) return Flower2;
  if (key.includes("cosmetic") || key.includes("identity")) return Gem;
  if (key.includes("featured")) return Sparkles;

  return ShoppingBag;
}

export default function DashboardWindowShop({
  lifetimeZpts = 0,
  zptsBalance = 0,
  shopUnlocked,
  isAltView = false,
  categories = DEFAULT_SHOP_CATEGORIES,
  items = [],
  selectedCategoryId,
  onCategoryChange,
  onPurchaseItem,
}) {
  const [localIsAltView, setLocalIsAltView] = useState(isAltView);
  const [groupIndex, setGroupIndex] = useState(0);
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);

  const safeCategories =
    Array.isArray(categories) && categories.length > 0
      ? categories
      : DEFAULT_SHOP_CATEGORIES;

  const firstCategoryId = getCategoryId(safeCategories[0]) || "bundle-combos";

  const [localCategoryId, setLocalCategoryId] = useState(
    selectedCategoryId || firstCategoryId
  );

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

    return items.filter((item) => getItemCategoryId(item) === activeCategoryId);
  }, [items, activeCategoryId]);

  const groupedCategories = useMemo(() => {
    return groupCategories(safeCategories);
  }, [safeCategories]);

  const activeCategory = safeCategories.find(
    (category) => getCategoryId(category) === activeCategoryId
  );

  const activeCategoryLabel = getCategoryLabel(activeCategory);
  const activeItem = visibleItems[activeItemIndex] || visibleItems[0] || null;

  function handleChevronClick(event) {
    event.stopPropagation();

    if (!isUnlocked || selectedItem) return;

    if (localIsAltView) {
      setGroupIndex((current) =>
        groupedCategories.length
          ? (current + 1) % groupedCategories.length
          : 0
      );
      return;
    }

    setLocalIsAltView(true);
  }

  function handleCategorySelect(category) {
    const nextCategoryId = getCategoryId(category);
    if (!nextCategoryId) return;

    setLocalCategoryId(nextCategoryId);
    setActiveItemIndex(0);
    setLocalIsAltView(false);

    if (typeof onCategoryChange === "function") {
      onCategoryChange(nextCategoryId, category);
    }
  }

  function handleNextItem() {
    if (!visibleItems.length) return;

    setActiveItemIndex((current) => (current + 1) % visibleItems.length);
  }

  function handleOpenPurchase(event) {
    event.stopPropagation();

    if (!isUnlocked || !activeItem) return;

    setSelectedItem(activeItem);
  }

  function handleConfirmPurchase() {
    if (!selectedItem) return;

    if (typeof onPurchaseItem === "function") {
      onPurchaseItem(selectedItem);
    }

    setSelectedItem(null);
  }

  return (
    <section
      aria-label="Shop"
      className={[
        "relative flex h-full min-h-[220px] w-full flex-col overflow-hidden rounded-[1.5rem] p-4 text-left",
        "border border-cyan-200/15 bg-[#0b1220]",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_26px_rgba(34,211,238,0.08)]",
        isUnlocked ? "opacity-100" : "opacity-70",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[1.5rem] bg-gradient-to-br from-cyan-400/[0.10] via-white/[0.03] to-violet-500/[0.10]" />
      <div className="pointer-events-none absolute inset-[1px] rounded-[1.45rem] border border-white/[0.06]" />

      <div className="relative z-10 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cyan-300/18 bg-cyan-300/8 text-cyan-200/80">
            <ShoppingBag className="h-[17px] w-[17px]" strokeWidth={2.1} />
          </div>

          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/84">
            Shop
          </div>
        </div>

        {isUnlocked ? (
          <button
            type="button"
            onClick={handleChevronClick}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/70 transition active:scale-[0.96]"
            aria-label={
              localIsAltView ? "Show next Shop group" : "Show Shop categories"
            }
          >
            <ChevronRight className="h-[18px] w-[18px]" strokeWidth={2.4} />
          </button>
        ) : null}
      </div>

      {!isUnlocked ? (
        <div className="relative z-10 mt-8 flex flex-1 flex-col">
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/75">
              <Lock className="h-5 w-5" />
            </div>

            <p className="mt-4 text-base font-semibold text-white">
              Unlock Shop
            </p>
          </div>

          <div className="pb-1">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-400"
                style={{ width: `${progress}%` }}
                aria-hidden="true"
              />
            </div>

            <p className="mt-3 text-left text-sm font-semibold text-white/80">
              {formatNumber(unlockProgressSource)} /{" "}
              {formatNumber(SHOP_UNLOCK_THRESHOLD)}{" "}
              <sub className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/45">
                zPts
              </sub>
            </p>
          </div>
        </div>
      ) : localIsAltView ? (
        <ShopWindowAlternate
          groupedCategories={groupedCategories}
          groupIndex={groupIndex}
          activeCategoryId={activeCategoryId}
          getCategoryIcon={getCategoryIcon}
          onCategorySelect={handleCategorySelect}
        />
      ) : (
        <ShopWindowItemView
          activeCategoryLabel={activeCategoryLabel}
          visibleItems={visibleItems}
          activeItemIndex={activeItemIndex}
          onNextItem={handleNextItem}
          onOpenPurchase={handleOpenPurchase}
        />
      )}

      {selectedItem && (
        <div
          className="absolute inset-0 z-20 flex items-end rounded-[1.5rem] bg-black/55 p-3 backdrop-blur-sm"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="w-full rounded-[1.25rem] border border-white/10 bg-[#101827] p-4 shadow-[0_0_30px_rgba(34,211,238,0.14)]">
            <p className="text-base font-semibold text-white">
              {getItemName(selectedItem)}
            </p>

            <p className="mt-2 text-sm text-white/60">
              {getItemDescription(selectedItem)}
            </p>

            <p className="mt-4 text-sm font-black text-cyan-200">
              {getFormattedItemPrice(selectedItem)}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmPurchase}
                className="rounded-xl border border-cyan-300/25 bg-cyan-300/15 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}