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

const SHOP_UNLOCK_THRESHOLD = 1000;

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

function getCategoryId(category = {}) {
  return category.id || category.category_id || category.slug || "";
}

function getCategoryLabel(category = {}) {
  return category.label || category.name || "Category";
}

function getCategoryGroup(category = {}) {
  return category.group || category.section || category.parent || "Shop";
}

function normalizeLegacyItemCategory(categoryId = "") {
  const safe = String(categoryId || "").toLowerCase();

  if (safe === "boosts") return "move-boosts";
  if (safe === "ebooks") return "learn-ebooks";
  if (safe === "cosmetics") return "profile-rings";
  if (safe === "featured") return "bundle-combos";

  return safe;
}

function getItemCategoryId(item = {}) {
  return normalizeLegacyItemCategory(
    item.category || item.category_id || item.categoryId || "bundle-combos"
  );
}

function getItemName(item = {}) {
  return item.name || item.title || "Shop Item";
}

function getItemDescription(item = {}) {
  return item.description || item.subtitle || "Tap to view item.";
}

function getItemPrice(item = {}) {
  if (item.payment_method === "stripe") return item.price_stripe ?? 0;
  if (item.payment_method === "zwap") return item.price_zwap ?? 0;
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

  if (currency === "USD") return `$${formatMoney(price)}`;

  return `${formatNumber(price)} ${currency}`;
}

function groupCategories(categories = []) {
  return categories.reduce((groups, category) => {
    const group = getCategoryGroup(category);

    if (!groups[group]) {
      groups[group] = [];
    }

    groups[group].push(category);

    return groups;
  }, {});
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
  const [touchStartX, setTouchStartX] = useState(null);

  const safeCategories =
    Array.isArray(categories) && categories.length > 0
      ? categories
      : DEFAULT_SHOP_CATEGORIES;

  const firstCategoryId = getCategoryId(safeCategories[0]) || "bundle-combos";

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

    return items.filter((item) => getItemCategoryId(item) === activeCategoryId);
  }, [items, activeCategoryId]);

  const groupedCategories = useMemo(() => {
    return groupCategories(safeCategories);
  }, [safeCategories]);

  const activeCategory = safeCategories.find(
    (category) => getCategoryId(category) === activeCategoryId
  );

  const activeCategoryLabel = getCategoryLabel(activeCategory);

  const handleWindowToggle = () => {
    if (!isUnlocked || selectedItem) return;
    setLocalIsAltView((current) => !current);
  };

  const handleTouchStart = (event) => {
    const touch = event.touches?.[0];
    if (!touch) return;

    setTouchStartX(touch.clientX);
  };

  const handleTouchEnd = (event) => {
    const touch = event.changedTouches?.[0];
    if (!touch || touchStartX === null || selectedItem || !isUnlocked) return;

    const diff = touch.clientX - touchStartX;

    if (Math.abs(diff) >= 36) {
      setLocalIsAltView(diff < 0);
    }

    setTouchStartX(null);
  };

  const handleCategorySelect = (category) => {
    const nextCategoryId = getCategoryId(category);
    if (!nextCategoryId) return;

    setLocalCategoryId(nextCategoryId);
    setLocalIsAltView(false);

    if (typeof onCategoryChange === "function") {
      onCategoryChange(nextCategoryId, category);
    }
  };

  const handleItemSelect = (item) => {
    if (!isUnlocked) return;
    setSelectedItem(item);
  };

  const handleConfirmPurchase = () => {
    if (!selectedItem) return;

    if (typeof onPurchaseItem === "function") {
      onPurchaseItem(selectedItem);
    }

    setSelectedItem(null);
  };

  return (
    <section
      aria-label="Shop"
      onClick={handleWindowToggle}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={[
        "relative flex h-full min-h-[220px] w-full flex-col overflow-hidden rounded-[1.5rem] p-4 text-left",
        "border border-cyan-200/15 bg-[#0b1220]",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_26px_rgba(34,211,238,0.08)]",
        isUnlocked ? "opacity-100" : "opacity-70",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[1.5rem] bg-gradient-to-br from-cyan-400/[0.10] via-white/[0.03] to-violet-500/[0.10]" />
      <div className="pointer-events-none absolute inset-[1px] rounded-[1.45rem] border border-white/[0.06]" />

      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300/10 text-cyan-200">
            <ShoppingBag className="h-4 w-4" />
          </div>

          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/90">
            Shop
          </h2>
        </div>

        {isUnlocked ? (
          <ChevronRight
            className="h-[18px] w-[18px] shrink-0 text-white/70"
            strokeWidth={2.4}
          />
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
        <div className="relative z-10 mt-4 min-h-0 flex-1 overflow-hidden">
          <div className="grid max-h-full gap-2 overflow-y-auto pr-1">
            {Object.entries(groupedCategories).map(([group, groupCategories]) => (
              <div key={group}>
                <p className="mb-1 text-[9px] font-black uppercase tracking-[0.16em] text-cyan-200/45">
                  {group}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {groupCategories.map((category) => {
                    const categoryId = getCategoryId(category);
                    const CategoryIcon = getCategoryIcon(category);
                    const active = categoryId === activeCategoryId;

                    return (
                      <button
                        key={categoryId}
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleCategorySelect(category);
                        }}
                        className={[
                          "flex min-h-[42px] items-center gap-2 rounded-2xl border px-3 text-left",
                          active
                            ? "border-cyan-300/40 bg-cyan-300/15 text-white"
                            : "border-white/10 bg-white/[0.04] text-white/60",
                        ].join(" ")}
                      >
                        <CategoryIcon className="h-4 w-4 shrink-0" />

                        <span className="truncate text-[10px] font-semibold uppercase tracking-[0.13em]">
                          {getCategoryLabel(category)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="relative z-10 mt-5 flex flex-1 flex-col">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200/70">
            {activeCategoryLabel}
          </p>

          {visibleItems.length > 0 ? (
            <div className="mt-3 flex snap-x gap-3 overflow-x-auto pb-2">
              {visibleItems.map((item) => (
                <button
                  key={item.id || getItemName(item)}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleItemSelect(item);
                  }}
                  className="min-w-[78%] snap-start rounded-[1.15rem] border border-white/10 bg-white/[0.05] p-3 text-left"
                >
                  <div className="flex min-h-[92px] flex-col justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {getItemName(item)}
                      </p>

                      <p className="mt-1 line-clamp-2 text-xs text-white/50">
                        {getItemDescription(item)}
                      </p>
                    </div>

                    <p className="mt-4 text-sm font-black text-cyan-200">
                      {getFormattedItemPrice(item)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-3 flex flex-1 items-center justify-center rounded-[1.15rem] border border-white/10 bg-white/[0.04] px-3 text-center">
              <p className="text-xs font-medium text-white/45">
                No items in this category yet.
              </p>
            </div>
          )}
        </div>
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
                Purchase
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}