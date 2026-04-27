import React, { useMemo, useState } from "react";
import {
  Image,
  Lock,
  Package,
  Plus,
  Save,
  Trash2,
  Unlock,
} from "lucide-react";

import AdminSectionCardV1 from "./AdminSectionCardV1";
import AdminStatusPillV1 from "./AdminStatusPillV1";

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
    guidance:
      "Use this for items not ready for V1 release but worth staging.",
  },
  "Always Available": {
    focus: "Permanent shelf",
    guidance:
      "Use this carefully for evergreen items that should not depend on rotation timing.",
  },
  Custom: {
    focus: "Manual schedule",
    guidance:
      "Use this when you want full control outside the standard V1 progression schedule.",
  },
};

function buildItemId(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
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
              onClick={() => onEdit(item)}
              className="flex h-10 flex-1 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-500/10 text-xs font-semibold text-cyan-200 transition active:scale-[0.98]"
            >
              Edit
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
  const [rotations, setRotations] = useState(DEFAULT_ROTATIONS);
  const [newCategory, setNewCategory] = useState("");
  const [newRotation, setNewRotation] = useState("");
  const [editingItemId, setEditingItemId] = useState(null);

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

  const rotationGuide = PROGRESSION_GUIDE[form.rotation] || PROGRESSION_GUIDE.Custom;

  const updateForm = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setEditingItemId(null);
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

  const handleAddCategory = () => {
    const safeCategory = newCategory.trim();
    if (!safeCategory) return;

    setCategories((current) => {
      if (current.includes(safeCategory)) return current;
      return [...current, safeCategory];
    });

    updateForm("category", safeCategory);
    setNewCategory("");
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

  const handleSaveItem = () => {
    const safeName = form.name.trim();
    const fallbackId = buildItemId(safeName);

    if (!safeName || !fallbackId) return;

    const nextItem = {
      ...form,
      id: editingItemId || fallbackId,
      name: safeName,
      price: Number(form.price || 0),
      quantity:
        form.inventoryType === "limited" ? Number(form.quantity || 0) : "",
      imageUrl: form.imageUrl.trim(),
      description: form.description.trim(),
    };

    setItems((current) => {
      if (editingItemId) {
        return current.map((item) =>
          item.id === editingItemId ? nextItem : item
        );
      }

      const exists = current.some((item) => item.id === fallbackId);
      if (exists) return current;

      return [...current, nextItem];
    });

    resetForm();
  };

  const handleEditItem = (item) => {
    setEditingItemId(item.id);
    setForm({
      name: item.name || "",
      category: item.category || "Custom",
      type: item.type || "custom",
      status: item.status || "locked",
      phase: item.phase || "Phase A",
      rotation: item.rotation || "Custom",
      price: String(item.price ?? ""),
      currency: item.currency || "zPts",
      inventoryType: item.inventoryType || "unlimited",
      quantity: String(item.quantity ?? ""),
      imageUrl: item.imageUrl || "",
      description: item.description || "",
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

  const handleRemoveItem = (itemId) => {
    setItems((current) => current.filter((item) => item.id !== itemId));

    if (editingItemId === itemId) {
      resetForm();
    }
  };

  return (
    <div className="space-y-4">
      <AdminSectionCardV1 title="Shop System">
        Manage Shop inventory manually while staying guided by the V1
        progression schedule. Nothing here is hardcoded. Items can be added,
        edited, locked, unlocked, rotated, limited, or removed.
      </AdminSectionCardV1>

      <div className="grid grid-cols-3 gap-3">
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
                value={form.imageUrl}
                onChange={(event) => updateForm("imageUrl", event.target.value)}
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
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </ShopInput>

            <ShopInput label="Type">
              <select
                value={form.type}
                onChange={(event) => updateForm("type", event.target.value)}
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
            <ShopInput label="Price">
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(event) => updateForm("price", event.target.value)}
                placeholder="0"
                className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-cyan-400/35"
              />
            </ShopInput>

            <ShopInput label="Currency">
              <select
                value={form.currency}
                onChange={(event) => updateForm("currency", event.target.value)}
                className="h-11 w-full rounded-xl border border-white/10 bg-[#07101b] px-3 text-sm text-white outline-none focus:border-cyan-400/35"
              >
                <option value="zPts">zPts</option>
                <option value="ZWAP">ZWAP</option>
                <option value="USD">USD</option>
              </select>
            </ShopInput>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ShopInput label="Inventory">
              <select
                value={form.inventoryType}
                onChange={(event) =>
                  updateForm("inventoryType", event.target.value)
                }
                className="h-11 w-full rounded-xl border border-white/10 bg-[#07101b] px-3 text-sm text-white outline-none focus:border-cyan-400/35"
              >
                <option value="unlimited">Unlimited</option>
                <option value="limited">Limited</option>
              </select>
            </ShopInput>

            <ShopInput label="Quantity">
              <input
                type="number"
                min="0"
                value={form.quantity}
                disabled={form.inventoryType !== "limited"}
                onChange={(event) => updateForm("quantity", event.target.value)}
                placeholder="Only for limited"
                className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-cyan-400/35 disabled:opacity-40"
              />
            </ShopInput>
          </div>

          <ShopInput label="Status">
            <select
              value={form.status}
              onChange={(event) => updateForm("status", event.target.value)}
              className="h-11 w-full rounded-xl border border-white/10 bg-[#07101b] px-3 text-sm text-white outline-none focus:border-cyan-400/35"
            >
              <option value="locked">Locked</option>
              <option value="active">Active</option>
            </select>
          </ShopInput>

          <ShopInput label="Description">
            <textarea
              value={form.description}
              onChange={(event) => updateForm("description", event.target.value)}
              placeholder="What this item does, where it belongs, and why it matters."
              className="min-h-[86px] w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-cyan-400/35"
            />
          </ShopInput>

          <div className="grid grid-cols-1 gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
              Add Admin Options
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
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-cyan-400/25 bg-cyan-500/15 text-sm font-semibold text-cyan-100 transition active:scale-[0.98]"
            >
              <Save className="h-4 w-4" />
              {editingItemId ? "Save Changes" : "Add Item"}
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
        {items.length ? (
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