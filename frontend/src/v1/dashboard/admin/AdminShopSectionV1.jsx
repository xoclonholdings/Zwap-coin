import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Lock,
  Package,
  Plus,
  Save,
  Trash2,
  Unlock,
} from "lucide-react";

import adminApi from "@/lib/adminApi";
import AdminSectionCardV1 from "./AdminSectionCardV1";
import AdminStatusPillV1 from "./AdminStatusPillV1";

const DEFAULT_CATEGORIES = [
  { id: "boosts", label: "Boosts", sort_order: 0, active: true },
  { id: "ebooks", label: "Illustrated eBooks", sort_order: 1, active: true },
  { id: "cosmetics", label: "Cosmetic / Identity", sort_order: 2, active: true },
  { id: "utility", label: "Utility", sort_order: 3, active: true },
  { id: "featured", label: "Featured Bundle", sort_order: 4, active: true },
];

const DEFAULT_ROTATIONS = [
  "Month 1 / Cycle 1",
  "Month 1 / Cycle 2",
  "Month 2 / Cycle 1",
  "Month 2 / Cycle 2",
  "Future Rotation",
  "Always Available",
  "Custom",
];

const DEFAULT_ITEM_TYPES = [
  "boost",
  "ebook",
  "cosmetic",
  "utility",
  "bundle",
  "garden",
  "sponsor",
  "custom",
];

const PROGRESSION_GUIDE = {
  "Month 1 / Cycle 1": {
    focus: "Early Shop introduction",
    guidance:
      "Use this for first simple boosts, first cosmetics, first eBooks, and one featured bundle.",
  },
  "Month 1 / Cycle 2": {
    focus: "Prestige escalation",
    guidance:
      "Use this for stronger cosmetics, larger boosts, higher-value eBooks, and a stronger featured bundle.",
  },
  "Month 2 / Cycle 1": {
    focus: "Utility introduction",
    guidance:
      "Use this for longer boosts, premium items, and the first emergency-style utility items.",
  },
  "Month 2 / Cycle 2": {
    focus: "Protection + premium rotation",
    guidance:
      "Use this for higher utility, premium bundles, and deeper progression support.",
  },
  "Future Rotation": {
    focus: "Future inventory",
    guidance: "Use this for staged items that are not ready for V1 release.",
  },
  "Always Available": {
    focus: "Permanent shelf",
    guidance:
      "Use carefully for evergreen items that should not depend on rotation timing.",
  },
  Custom: {
    focus: "Manual schedule",
    guidance: "Use this when you want full control outside the standard V1 schedule.",
  },
};

function buildSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizeCategory(category = {}, index = 0) {
  const label = category.label || category.name || category.id || "Category";
  const id = category.id || buildSlug(label);

  return {
    id,
    label,
    description: category.description || "",
    sort_order: Number(category.sort_order ?? index),
    active: category.active !== false,
  };
}

function normalizeItem(item = {}) {
  return {
    id: item.id || item._id || buildSlug(item.name),
    name: item.name || "",
    description: item.description || "",
    payment_method: item.payment_method || "zpts",
    price_zpts: item.price_zpts ?? "",
    price_zwap: item.price_zwap ?? "",
    price_stripe: item.price_stripe ?? "",
    image_url: item.image_url || "",
    category: item.category || "boosts",
    subcategory: item.subcategory || "",
    item_type: item.item_type || item.type || "boost",
    rotation: item.rotation || "Month 1 / Cycle 1",
    phase: item.phase || "Phase A",
    in_stock: item.in_stock !== false,
    active: item.active === true,
    plus_only: item.plus_only === true,
    max_quantity: item.max_quantity ?? "",
    fulfillment_type: item.fulfillment_type || "none",
    download_url: item.download_url || "",
    external_url: item.external_url || "",
    fulfillment_notes: item.fulfillment_notes || "",
  };
}

function buildItemPayload(form) {
  const id = form.id || buildSlug(form.name);

  return {
    id,
    name: form.name.trim(),
    description: form.description.trim(),
    payment_method: form.payment_method,
    price_zpts:
      form.payment_method === "zpts" ? Number(form.price_zpts || 0) : null,
    price_zwap:
      form.payment_method === "zwap" ? Number(form.price_zwap || 0) : null,
    price_stripe:
      form.payment_method === "stripe" ? Number(form.price_stripe || 0) : null,
    image_url: form.image_url.trim(),
    category: form.category,
    subcategory: form.subcategory.trim() || null,
    item_type: form.item_type,
    rotation: form.rotation,
    phase: form.phase,
    in_stock: form.in_stock,
    active: form.active,
    plus_only: form.plus_only,
    max_quantity:
      form.max_quantity === "" ? null : Number(form.max_quantity || 0),
    fulfillment_type: form.fulfillment_type,
    download_url: form.download_url.trim() || null,
    external_url: form.external_url.trim() || null,
    fulfillment_notes: form.fulfillment_notes.trim() || null,
  };
}

function getPriceLabel(item) {
  if (item.payment_method === "stripe") {
    return `$${Number(item.price_stripe || 0).toFixed(2)}`;
  }

  if (item.payment_method === "zwap") {
    return `${Number(item.price_zwap || 0).toLocaleString()} ZWAP`;
  }

  return `${Number(item.price_zpts || 0).toLocaleString()} zPts`;
}

function ShopInput({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
        {label}
      </span>
      {children}
    </label>
  );
}

function ShopItemRow({ item, onToggle, onRemove, onEdit }) {
  const isActive = item.active === true;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-cyan-400/15 bg-cyan-500/10">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <Package className="h-5 w-5 text-cyan-300" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">
                {item.name}
              </div>

              <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-cyan-300/55">
                {item.category || "uncategorized"}
              </div>
            </div>

            <AdminStatusPillV1 tone={isActive ? "active" : "locked"}>
              {isActive ? "Active" : "Locked"}
            </AdminStatusPillV1>
          </div>

          <div className="mt-2 text-xs leading-5 text-white/50">
            {getPriceLabel(item)} • {item.rotation || "No rotation"} •{" "}
            {item.in_stock ? "In stock" : "Out of stock"}
            {item.max_quantity ? ` • ${item.max_quantity} max` : ""}
          </div>

          {item.description ? (
            <div className="mt-2 text-xs leading-5 text-white/45">
              {item.description}
            </div>
          ) : null}

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => onToggle(item)}
              className={[
                "flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border text-xs font-semibold transition active:scale-[0.98]",
                isActive
                  ? "border-white/10 bg-white/[0.04] text-white/55"
                  : "border-cyan-400/25 bg-cyan-500/10 text-cyan-200",
              ].join(" ")}
            >
              {isActive ? (
                <>
                  <Lock className="h-4 w-4" />
                  Lock
                </>
              ) : (
                <>
                  <Unlock className="h-4 w-4" />
                  Unlock
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onEdit(item)}
              className="flex h-10 flex-1 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-500/10 text-xs font-semibold text-cyan-200 transition active:scale-[0.98]"
            >
              Edit
            </button>

            <button
              type="button"
              onClick={() => onRemove(item)}
              className="flex h-10 w-11 items-center justify-center rounded-xl border border-red-400/20 bg-red-500/10 text-red-300 transition active:scale-[0.98]"
              aria-label={`Remove ${item.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const EMPTY_FORM = {
  id: "",
  name: "",
  description: "",
  payment_method: "zpts",
  price_zpts: "",
  price_zwap: "",
  price_stripe: "",
  image_url: "",
  category: "boosts",
  subcategory: "",
  item_type: "boost",
  rotation: "Month 1 / Cycle 1",
  phase: "Phase A",
  in_stock: true,
  active: false,
  plus_only: false,
  max_quantity: "",
  fulfillment_type: "none",
  download_url: "",
  external_url: "",
  fulfillment_notes: "",
};

export default function AdminShopSectionV1() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [rotations, setRotations] = useState(DEFAULT_ROTATIONS);
  const [newCategory, setNewCategory] = useState("");
  const [newRotation, setNewRotation] = useState("");
  const [editingItemId, setEditingItemId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const stats = useMemo(() => {
    const active = items.filter((item) => item.active).length;
    const inStock = items.filter((item) => item.in_stock).length;

    return {
      total: items.length,
      active,
      locked: items.length - active,
      inStock,
    };
  }, [items]);

  const rotationGuide =
    PROGRESSION_GUIDE[form.rotation] || PROGRESSION_GUIDE.Custom;

  const updateForm = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setEditingItemId(null);
    setForm((current) => ({
      ...EMPTY_FORM,
      category: current.category,
      item_type: current.item_type,
      rotation: current.rotation,
      phase: current.phase,
    }));
  };

  const loadShop = async () => {
    setLoading(true);
  
    try {
      const [categoryData, itemData] = await Promise.all([
        adminApi.get("/shop/categories"),
        adminApi.get("/shop/items"),
      ]);
  
      const rawCategories = Array.isArray(categoryData)
        ? categoryData
        : categoryData?.categories || [];
  
      const rawItems = Array.isArray(itemData)
        ? itemData
        : itemData?.items || [];
  
      const nextCategories = rawCategories.length
        ? rawCategories.map(normalizeCategory)
        : DEFAULT_CATEGORIES;
  
      setCategories(nextCategories);
      setItems(rawItems.map(normalizeItem));
    } catch (error) {
      console.error("Admin shop load failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShop();
  }, []);

  const handleAddCategory = async () => {
    const label = newCategory.trim();
    const id = buildSlug(label);

    if (!label || !id) return;

    const nextCategory = {
      id,
      label,
      description: "",
      sort_order: categories.length,
      active: true,
    };

    setCategories((current) => {
      if (current.some((category) => category.id === id)) return current;
      return [...current, nextCategory];
    });

    updateForm("category", id);
    setNewCategory("");

    try {
      await adminApi.post("/shop/categories", nextCategory);
    } catch (error) {
      console.error("Category save failed:", error);
    }
  };

  const handleAddRotation = () => {
    const safeRotation = newRotation.trim();
    if (!safeRotation) return;

    setRotations((current) => {
      if (current.includes(safeRotation)) return current;
      return [...current, safeRotation];
    });

    updateForm("rotation", safeRotation);
    setNewRotation("");
  };

  const handleSaveItem = async () => {
    const safeName = form.name.trim();
    const fallbackId = form.id || buildSlug(safeName);

    if (!safeName || !fallbackId) return;

    const payload = buildItemPayload({
      ...form,
      id: editingItemId || fallbackId,
    });

    setSaving(true);

    try {
      let response;
      
      if (editingItemId) {
        response = await adminApi.put(`/shop/items/${editingItemId}`, payload);
      } else {
        response = await adminApi.post("/shop/items", payload);
      }
      
      const savedItem = normalizeItem(response?.item || payload);
      
      setItems((current) => {
        if (editingItemId) {
          return current.map((item) =>
            item.id === editingItemId ? savedItem : item
          );
        }
      
        const exists = current.some((item) => item.id === savedItem.id);
        if (exists) {
          return current.map((item) =>
            item.id === savedItem.id ? savedItem : item
          );
        }
      
        return [...current, savedItem];
      });

      resetForm();
    } catch (error) {
      console.error("Shop item save failed:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleEditItem = (item) => {
    const normalized = normalizeItem(item);

    setEditingItemId(normalized.id);
    setForm(normalized);
  };

  const handleToggleItem = async (item) => {
    const nextItem = {
      ...item,
      active: !item.active,
    };
  
    setItems((current) =>
      current.map((currentItem) =>
        currentItem.id === item.id ? nextItem : currentItem
      )
    );
  
    try {
      const response = await adminApi.put(
        `/shop/items/${item.id}`,
        buildItemPayload(nextItem)
      );
  
      const savedItem = normalizeItem(response?.item || nextItem);
  
      setItems((current) =>
        current.map((currentItem) =>
          currentItem.id === item.id ? savedItem : currentItem
        )
      );
    } catch (error) {
      console.error("Shop item toggle failed:", error);
  
      setItems((current) =>
        current.map((currentItem) =>
          currentItem.id === item.id ? item : currentItem
        )
      );
    }
  };

  const handleRemoveItem = async (item) => {
    setItems((current) =>
      current.filter((currentItem) => currentItem.id !== item.id)
    );
  
    if (editingItemId === item.id) {
      resetForm();
    }
  
    try {
      await adminApi.delete(`/shop/items/${item.id}`);
    } catch (error) {
      console.error("Shop item delete failed:", error);
  
      setItems((current) => {
        const exists = current.some((currentItem) => currentItem.id === item.id);
        if (exists) return current;
  
        return [...current, item];
      });
    }
  };

  return (
    <div className="space-y-4">
      <AdminSectionCardV1 title="Shop System">
        Manage the V1 Shop inventory, categories, rotations, pricing, visibility,
        and fulfillment. The dashboard Shop pulls from this data. Shop remains
        locked for users until 1,000 lifetime zPts, except admin preview.
      </AdminSectionCardV1>

      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <div className="text-[10px] uppercase tracking-[0.14em] text-white/35">
            Total
          </div>
          <div className="mt-1 text-lg font-bold text-white">{stats.total}</div>
        </div>

        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3">
          <div className="text-[10px] uppercase tracking-[0.14em] text-emerald-300/70">
            Active
          </div>
          <div className="mt-1 text-lg font-bold text-emerald-200">
            {stats.active}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <div className="text-[10px] uppercase tracking-[0.14em] text-white/35">
            Locked
          </div>
          <div className="mt-1 text-lg font-bold text-white">{stats.locked}</div>
        </div>

        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-3">
          <div className="text-[10px] uppercase tracking-[0.14em] text-cyan-300/70">
            In Stock
          </div>
          <div className="mt-1 text-lg font-bold text-cyan-200">
            {stats.inStock}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-cyan-400/15 bg-cyan-500/[0.06] p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Plus className="h-4 w-4 text-cyan-300" />
          {editingItemId ? "Edit Shop Item" : "Add Shop Item"}
        </div>

        <div className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300/70">
            Progression Guide
          </div>
          <div className="mt-1 text-sm font-semibold text-white">
            {rotationGuide.focus}
          </div>
          <div className="mt-1 text-xs leading-5 text-white/50">
            {rotationGuide.guidance}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <ShopInput label="Item Name">
            <input
              value={form.name}
              onChange={(event) => updateForm("name", event.target.value)}
              placeholder="Example: 3H Move Boost"
              className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-cyan-400/35"
            />
          </ShopInput>

          <ShopInput label="Image URL">
            <div className="flex items-center gap-2">
              <Image className="h-4 w-4 shrink-0 text-cyan-300/70" />
              <input
                value={form.image_url}
                onChange={(event) => updateForm("image_url", event.target.value)}
                placeholder="Paste image URL"
                className="h-11 min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-cyan-400/35"
              />
            </div>
          </ShopInput>

          <div className="grid grid-cols-2 gap-3">
            <ShopInput label="Category">
              <select
                value={form.category}
                onChange={(event) => updateForm("category", event.target.value)}
                className="h-11 w-full rounded-xl border border-white/10 bg-[#07101b] px-3 text-sm text-white outline-none focus:border-cyan-400/35"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </ShopInput>

            <ShopInput label="Type">
              <select
                value={form.item_type}
                onChange={(event) => updateForm("item_type", event.target.value)}
                className="h-11 w-full rounded-xl border border-white/10 bg-[#07101b] px-3 text-sm text-white outline-none focus:border-cyan-400/35"
              >
                {DEFAULT_ITEM_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </ShopInput>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ShopInput label="Phase">
              <select
                value={form.phase}
                onChange={(event) => updateForm("phase", event.target.value)}
                className="h-11 w-full rounded-xl border border-white/10 bg-[#07101b] px-3 text-sm text-white outline-none focus:border-cyan-400/35"
              >
                <option value="Phase A">Phase A</option>
                <option value="Phase B">Phase B</option>
                <option value="Phase C">Phase C</option>
                <option value="Phase D">Phase D</option>
              </select>
            </ShopInput>

            <ShopInput label="Rotation">
              <select
                value={form.rotation}
                onChange={(event) => updateForm("rotation", event.target.value)}
                className="h-11 w-full rounded-xl border border-white/10 bg-[#07101b] px-3 text-sm text-white outline-none focus:border-cyan-400/35"
              >
                {rotations.map((rotation) => (
                  <option key={rotation} value={rotation}>
                    {rotation}
                  </option>
                ))}
              </select>
            </ShopInput>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ShopInput label="Payment">
              <select
                value={form.payment_method}
                onChange={(event) =>
                  updateForm("payment_method", event.target.value)
                }
                className="h-11 w-full rounded-xl border border-white/10 bg-[#07101b] px-3 text-sm text-white outline-none focus:border-cyan-400/35"
              >
                <option value="zpts">zPts</option>
                <option value="zwap">ZWAP</option>
                <option value="stripe">USD / Stripe</option>
              </select>
            </ShopInput>

            <ShopInput label="Price">
              <input
                type="number"
                min="0"
                value={
                  form.payment_method === "stripe"
                    ? form.price_stripe
                    : form.payment_method === "zwap"
                      ? form.price_zwap
                      : form.price_zpts
                }
                onChange={(event) => {
                  const field =
                    form.payment_method === "stripe"
                      ? "price_stripe"
                      : form.payment_method === "zwap"
                        ? "price_zwap"
                        : "price_zpts";

                  updateForm(field, event.target.value);
                }}
                placeholder="0"
                className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-cyan-400/35"
              />
            </ShopInput>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ShopInput label="Max Quantity">
              <input
                type="number"
                min="0"
                value={form.max_quantity}
                onChange={(event) =>
                  updateForm("max_quantity", event.target.value)
                }
                placeholder="Blank = unlimited"
                className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-cyan-400/35"
              />
            </ShopInput>

            <ShopInput label="Fulfillment">
              <select
                value={form.fulfillment_type}
                onChange={(event) =>
                  updateForm("fulfillment_type", event.target.value)
                }
                className="h-11 w-full rounded-xl border border-white/10 bg-[#07101b] px-3 text-sm text-white outline-none focus:border-cyan-400/35"
              >
                <option value="none">None</option>
                <option value="digital">Digital</option>
                <option value="external">External</option>
                <option value="manual">Manual</option>
              </select>
            </ShopInput>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ShopInput label="Download URL">
              <input
                value={form.download_url}
                onChange={(event) =>
                  updateForm("download_url", event.target.value)
                }
                placeholder="Optional"
                className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-cyan-400/35"
              />
            </ShopInput>

            <ShopInput label="External URL">
              <input
                value={form.external_url}
                onChange={(event) =>
                  updateForm("external_url", event.target.value)
                }
                placeholder="Optional"
                className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-cyan-400/35"
              />
            </ShopInput>
          </div>

          <ShopInput label="Flags">
            <div className="grid grid-cols-3 gap-2">
              {[
                ["active", "Active"],
                ["in_stock", "In Stock"],
                ["plus_only", "Zitizen Only"],
              ].map(([field, label]) => (
                <button
                  key={field}
                  type="button"
                  onClick={() => updateForm(field, !form[field])}
                  className={[
                    "h-10 rounded-xl border text-xs font-semibold transition active:scale-[0.98]",
                    form[field]
                      ? "border-cyan-400/25 bg-cyan-500/10 text-cyan-200"
                      : "border-white/10 bg-white/[0.04] text-white/45",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>
          </ShopInput>

          <ShopInput label="Description">
            <textarea
              value={form.description}
              onChange={(event) => updateForm("description", event.target.value)}
              placeholder="What this item does, where it belongs, and why it matters."
              className="min-h-[86px] w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-cyan-400/35"
            />
          </ShopInput>

          <ShopInput label="Fulfillment Notes">
            <textarea
              value={form.fulfillment_notes}
              onChange={(event) =>
                updateForm("fulfillment_notes", event.target.value)
              }
              placeholder="Internal notes, delivery context, or usage rules."
              className="min-h-[72px] w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-cyan-400/35"
            />
          </ShopInput>

          <div className="grid grid-cols-1 gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
              Admin Options
            </div>

            <div className="flex gap-2">
              <input
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
                placeholder="New category"
                className="h-10 min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-xs text-white outline-none placeholder:text-white/25 focus:border-cyan-400/35"
              />

              <button
                type="button"
                onClick={handleAddCategory}
                className="h-10 rounded-xl border border-cyan-400/25 bg-cyan-500/10 px-3 text-xs font-semibold text-cyan-200 transition active:scale-[0.98]"
              >
                Add
              </button>
            </div>

            <div className="flex gap-2">
              <input
                value={newRotation}
                onChange={(event) => setNewRotation(event.target.value)}
                placeholder="New rotation"
                className="h-10 min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-xs text-white outline-none placeholder:text-white/25 focus:border-cyan-400/35"
              />

              <button
                type="button"
                onClick={handleAddRotation}
                className="h-10 rounded-xl border border-cyan-400/25 bg-cyan-500/10 px-3 text-xs font-semibold text-cyan-200 transition active:scale-[0.98]"
              >
                Add
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSaveItem}
              disabled={saving}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-cyan-400/25 bg-cyan-500/15 text-sm font-semibold text-cyan-100 transition active:scale-[0.98] disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : editingItemId ? "Save Changes" : "Add Item"}
            </button>

            {editingItemId ? (
              <button
                type="button"
                onClick={resetForm}
                className="h-11 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-white/55 transition active:scale-[0.98]"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <AdminSectionCardV1 title="Loading Shop">
            Fetching Shop inventory and categories.
          </AdminSectionCardV1>
        ) : items.length ? (
          items.map((item) => (
            <ShopItemRow
              key={item.id}
              item={item}
              onToggle={handleToggleItem}
              onRemove={handleRemoveItem}
              onEdit={handleEditItem}
            />
          ))
        ) : (
          <AdminSectionCardV1 title="No Shop Items Yet">
            Add your first Shop item above. The schedule will guide placement,
            but you control the actual inventory.
          </AdminSectionCardV1>
        )}
      </div>
    </div>
  );
}
