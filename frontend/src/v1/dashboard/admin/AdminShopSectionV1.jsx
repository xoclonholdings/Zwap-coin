import React, { useMemo, useState } from "react";
import {
  Image,
  Lock,
  Package,
  Plus,
  Save,
  ShoppingBag,
  Trash2,
  Unlock,
} from "lucide-react";

import AdminSectionCardV1 from "../components/AdminSectionCardV1";
import AdminStatusPillV1 from "../components/AdminStatusPillV1";

const DEFAULT_CATEGORIES = [
  "Boosts",
  "Illustrated eBooks",
  "Cosmetic / Identity",
  "Utility",
  "Featured Bundle",
  "Garden",
  "Sponsor Rewards",
  "Custom",
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

function buildItemId(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function ShopItemRow({ item, onToggle, onRemove }) {
  const isActive = item.status === "active";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-cyan-400/15 bg-cyan-500/10">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
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
                {item.category || "Uncategorized"}
              </div>
            </div>

            <AdminStatusPillV1 tone={isActive ? "active" : "locked"}>
              {isActive ? "Active" : "Locked"}
            </AdminStatusPillV1>
          </div>

          <div className="mt-2 text-xs leading-5 text-white/50">
            {Number(item.price || 0).toLocaleString()} {item.currency} •{" "}
            {item.rotation || "No rotation"} • {item.inventoryType}
            {item.inventoryType === "limited" ? ` (${item.quantity || 0})` : ""}
          </div>

          {item.description ? (
            <div className="mt-2 text-xs leading-5 text-white/45">
              {item.description}
            </div>
          ) : null}

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => onToggle(item.id)}
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
              onClick={() => onRemove(item.id)}
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

export default function AdminShopSectionV1() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [newCategory, setNewCategory] = useState("");

  const [form, setForm] = useState({
    name: "",
    category: "Boosts",
    type: "boost",
    status: "locked",
    phase: "Phase A",
    rotation: "Month 1 / Cycle 1",
    price: "",
    currency: "zPts",
    inventoryType: "unlimited",
    quantity: "",
    imageUrl: "",
    description: "",
  });

  const stats = useMemo(() => {
    const active = items.filter((item) => item.status === "active").length;

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

  const handleAddCategory = () => {
    const safeCategory = newCategory.trim();
    if (!safeCategory) return;

    setCategories((current) => {
      if (current.includes(safeCategory)) return current;
      return [...current, safeCategory];
    });

    setForm((current) => ({
      ...current,
      category: safeCategory,
    }));

    setNewCategory("");
  };

  const handleAddItem = () => {
    const safeName = form.name.trim();
    const id = buildItemId(safeName);

    if (!safeName || !id) return;

    setItems((current) => {
      const exists = current.some((item) => item.id === id);
      if (exists) return current;

      return [
        ...current,
        {
          ...form,
          id,
          name: safeName,
          price: Number(form.price || 0),
          quantity:
            form.inventoryType === "limited" ? Number(form.quantity || 0) : "",
          imageUrl: form.imageUrl.trim(),
          description: form.description.trim(),
        },
      ];
    });

    setForm({
      name: "",
      category: form.category,
      type: form.type,
      status: "locked",
      phase: form.phase,
      rotation: form.rotation,
      price: "",
      currency: "zPts",
      inventoryType: "unlimited",
      quantity: "",
      imageUrl: "",
      description: "",
    });
  };

  const handleToggleItem = (itemId) => {
    setItems((current) =>
      current.map((item) => {
        if (item.id !== itemId) return item;

        return {
          ...item,
          status: item.status === "active" ? "locked" : "active",
        };
      })
    );
  };

  const handleRemoveItem = (item