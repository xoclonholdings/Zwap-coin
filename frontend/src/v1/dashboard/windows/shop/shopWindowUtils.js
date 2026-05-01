export const SHOP_UNLOCK_THRESHOLD = 1000;

export function clamp(value, min = 0, max = 100) {
  return Math.min(Math.max(value, min), max);
}

export function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

export function formatMoney(value) {
  return Number(value || 0).toFixed(2);
}

export function getCategoryId(category = {}) {
  return category.id || category.category_id || category.slug || "";
}

export function getCategoryLabel(category = {}) {
  return category.label || category.name || "Category";
}

export function getCategoryGroup(category = {}) {
  return category.group || category.section || category.parent || "Shop";
}

export function normalizeLegacyItemCategory(categoryId = "") {
  const safe = String(categoryId || "").toLowerCase();

  if (safe === "boosts") return "move-boosts";
  if (safe === "ebooks") return "learn-ebooks";
  if (safe === "cosmetics") return "profile-rings";
  if (safe === "featured") return "bundle-combos";

  return safe;
}

export function getItemCategoryId(item = {}) {
  return normalizeLegacyItemCategory(
    item.category || item.category_id || item.categoryId || "bundle-combos"
  );
}

export function getItemName(item = {}) {
  return item.name || item.title || "Shop Item";
}

export function getItemDescription(item = {}) {
  return item.description || item.subtitle || "Tap item name to browse.";
}

export function getItemPrice(item = {}) {
  if (item.payment_method === "stripe") return item.price_stripe ?? 0;
  if (item.payment_method === "zwap") return item.price_zwap ?? 0;
  return item.price_zpts ?? 0;
}

export function getItemCurrencyLabel(item = {}) {
  if (item.payment_method === "stripe") return "USD";
  if (item.payment_method === "zwap") return "ZWAP";
  return "zPts";
}

export function getFormattedItemPrice(item = {}) {
  const price = getItemPrice(item);
  const currency = getItemCurrencyLabel(item);

  if (currency === "USD") return `$${formatMoney(price)}`;

  return `${formatNumber(price)} ${currency}`;
}

export function groupCategories(categories = []) {
  const groups = categories.reduce((acc, category) => {
    const group = getCategoryGroup(category);

    if (!acc[group]) acc[group] = [];
    acc[group].push(category);

    return acc;
  }, {});

  return Object.entries(groups).map(([group, groupCategories]) => ({
    group,
    categories: groupCategories,
  }));
}