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

/**
 * ✅ UPDATED CATEGORY SYSTEM (MATCHES SHOP WINDOW)
 */
const DEFAULT_CATEGORIES = [
  {
    id: "bundle-combos",
    label: "Combos",
    sort_order: 0,
    active: true,
  },
  {
    id: "move-boosts",
    label: "Move Boosts",
    sort_order: 1,
    active: true,
  },
  {
    id: "play-games",
    label: "Play Games",
    sort_order: 2,
    active: true,
  },
  {
    id: "play-boosts",
    label: "Play Boosts",
    sort_order: 3,
    active: true,
  },
  {
    id: "learn-ebooks",
    label: "Learn eBooks",
    sort_order: 4,
    active: true,
  },
  {
    id: "profile-rings",
    label: "Profile Rings",
    sort_order: 5,
    active: true,
  },
  {
    id: "profile-themes",
    label: "Profile Themes",
    sort_order: 6,
    active: true,
  },
  {
    id: "garden-items",
    label: "Garden Items",
    sort_order: 7,
    active: true,
  },
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
    category: item.category || "move-boosts",
    item_type: item.item_type || "boost",
    rotation: item.rotation || "Month 1 / Cycle 1",
    in_stock: item.in_stock !== false,
    active: item.active === true,
    plus_only: item.plus_only === true,
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
    item_type: form.item_type,
    rotation: form.rotation,
    in_stock: form.in_stock,
    active: form.active,
    plus_only: form.plus_only,
  };
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
  category: "move-boosts", // ✅ FIXED DEFAULT
  item_type: "boost",
  rotation: "Month 1 / Cycle 1",
  in_stock: true,
  active: false,
  plus_only: false,
};

export default function AdminShopSectionV1() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingItemId, setEditingItemId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const stats = useMemo(() => {
    const active = items.filter((i) => i.active).length;
    return {
      total: items.length,
      active,
      locked: items.length - active,
    };
  }, [items]);

  const updateForm = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const loadShop = async () => {
    setLoading(true);

    try {
      const [categoryData, itemData] = await Promise.all([
        adminApi.get("/shop/categories"),
        adminApi.get("/shop/items"),
      ]);

      const rawCategories = categoryData?.categories || [];
      const rawItems = itemData?.items || [];

      setCategories(
        rawCategories.length
          ? rawCategories.map(normalizeCategory)
          : DEFAULT_CATEGORIES
      );

      setItems(rawItems.map(normalizeItem));
    } catch (err) {
      console.error("Admin shop load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShop();
  }, []);

  const handleSaveItem = async () => {
    if (!form.name.trim()) return;

    const payload = buildItemPayload(form);

    setSaving(true);

    try {
      let response;

      if (editingItemId) {
        response = await adminApi.put(
          `/shop/items/${editingItemId}`,
          payload
        );
      } else {
        response = await adminApi.post("/shop/items", payload);
      }

      const saved = normalizeItem(response?.item || payload);

      setItems((current) => {
        const exists = current.some((i) => i.id === saved.id);

        if (exists) {
          return current.map((i) => (i.id === saved.id ? saved : i));
        }

        return [...current, saved];
      });

      setForm(EMPTY_FORM);
      setEditingItemId(null);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <AdminSectionCardV1 title="Shop System">
        Manage inventory for the live Shop window.
      </AdminSectionCardV1>

      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 border border-white/10 rounded-xl">
          Total: {stats.total}
        </div>
        <div className="p-3 border border-green-400/20 rounded-xl">
          Active: {stats.active}
        </div>
        <div className="p-3 border border-white/10 rounded-xl">
          Locked: {stats.locked}
        </div>
      </div>

      {/* FORM */}
      <div className="p-4 border border-cyan-400/15 rounded-xl">
        <input
          value={form.name}
          onChange={(e) => updateForm("name", e.target.value)}
          placeholder="Item Name"
          className="w-full h-10 mb-2 px-3 bg-black/20 text-white"
        />

        <select
          value={form.category}
          onChange={(e) => updateForm("category", e.target.value)}
          className="w-full h-10 mb-2 bg-black/20 text-white"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>

        <button
          onClick={handleSaveItem}
          disabled={saving}
          className="w-full h-10 bg-cyan-500/20 text-cyan-200"
        >
          {saving ? "Saving..." : "Save Item"}
        </button>
      </div>
    </div>
  );
}