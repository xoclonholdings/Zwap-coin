import { ALWAYS_ON_CATEGORIES, TICKER_CATEGORY } from "./constants";

export function shuffleArray(items = []) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function formatPct(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0.0%";
  return `${num >= 0 ? "+" : ""}${num.toFixed(1)}%`;
}

export function formatMoney(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "—";
  if (num >= 1000) {
    return `$${num.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }
  if (num >= 1) {
    return `$${num.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  }
  return `$${num.toLocaleString(undefined, { maximumFractionDigits: 4 })}`;
}

export function dedupeById(items = []) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item?.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export function buildEnabledCategories(preferences = {}) {
  const active = new Set(ALWAYS_ON_CATEGORIES);

  Object.entries(preferences).forEach(([category, isEnabled]) => {
    if (isEnabled) active.add(category);
  });

  return Array.from(active);
}

export function filterTickerItems(items = [], enabledCategories = []) {
  const enabled = new Set(enabledCategories);
  return items.filter((item) => enabled.has(item.category));
}

export function weightedShuffle(items = []) {
  const expanded = [];

  items.forEach((item) => {
    let weight = 1;

    if (item.category === TICKER_CATEGORY.YOU) weight = 4;
    else if (item.category === TICKER_CATEGORY.DID_YOU_KNOW) weight = 2;

    for (let i = 0; i < weight; i += 1) {
      expanded.push({ ...item, __weightKey: `${item.id}-${i}` });
    }
  });

  return shuffleArray(expanded).map(({ __weightKey, ...rest }) => rest);
}

export function pickNextTickerIndex(items, currentIndex, history = []) {
  if (!items.length) return 0;
  if (items.length === 1) return 0;

  const current = items[currentIndex];
  const recentIds = new Set(history.slice(-6).map((entry) => entry.id));
  const recentCategories = history.slice(-2).map((entry) => entry.category);

  const candidates = items
    .map((item, index) => ({ item, index }))
    .filter(({ item, index }) => {
      if (index === currentIndex) return false;
      if (recentIds.has(item.id)) return false;

      const sameCategoryBackToBack =
        recentCategories.length >= 2 &&
        recentCategories.every((category) => category === item.category);

      if (sameCategoryBackToBack && current?.category === item.category) {
        return false;
      }

      return true;
    });

  if (!candidates.length) {
    return (currentIndex + 1) % items.length;
  }

  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex].index;
}

export function normalizeTickerItem(item) {
  return {
    id: item.id,
    category: item.category,
    subtype: item.subtype || "info",
    text: item.text || "",
    clickable: Boolean(item.clickable && item.url),
    url: item.url || null,
    sourceLabel: item.sourceLabel || "ZWAP",
    cta: item.cta || null,
    priority: item.priority ?? 0,
  };
}