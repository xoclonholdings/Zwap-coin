import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Plus,
  Trash2,
  Edit,
  X,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import adminApi from "@/lib/adminApi";

export default function MarketplaceSection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [imagePreviewError, setImagePreviewError] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const CATEGORY_MAP = {
    audio_video: ["music", "video"],
    merch: ["apparel", "accessories", "bundle"],
    digital: ["ebook", "course", "gift_card", "ticket", "nft", "bundle"],
    game_items: ["skins", "avatars", "boosts", "upgrades"],
    electronics: ["equipment", "accessories"],
    subscriptions: ["tier", "boost", "promo_code", "bundle"],
    community: ["membership", "private_access", "event_pass"],
    education: ["tutorial", "workshop", "guide"],
  };

  const FULFILLMENT_OPTIONS = [
    { value: "none", label: "None" },
    { value: "digital", label: "Digital Download" },
    { value: "external", label: "External Link" },
    { value: "manual", label: "Manual Fulfillment" },
  ];

  const PAYMENT_METHOD_OPTIONS = [
    { value: "zwap", label: "ZWAP" },
    { value: "zpts", label: "zPts" },
    { value: "stripe", label: "Stripe / Fiat" },
  ];

  useEffect(() => {
    loadItems();
    loadOrders();
  }, []);

  const formatLabel = (value) => {
    if (!value) return "";
    return value
      .toString()
      .replaceAll("_", " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await adminApi.get("/marketplace/items");
      const loaded = Array.isArray(data) ? data : data.items || [];
      setItems(loaded);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const data = await adminApi.get("/marketplace/orders");
      const loaded = Array.isArray(data) ? data : data.orders || [];
      setOrders(loaded);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load marketplace orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  const startNewItem = () => {
    setImagePreviewError(false);
    setEditingItem({
      id: null,
      name: "",
      description: "",
      image_url: "",
      payment_method: "zwap",
      price_zwap: 0,
      price_zpts: 0,
      price_stripe: 0,
      max_quantity: "",
      is_active: true,
      category: "",
      subcategory: "",
      fulfillment_type: "none",
      download_url: "",
      external_url: "",
      fulfillment_notes: "",
    });
  };

  const startEditItem = (item) => {
    setImagePreviewError(false);
    setEditingItem({
      id: item.id ?? item._id ?? null,
      name: item.name ?? "",
      description: item.description ?? "",
      image_url: item.image_url ?? "",
      payment_method: item.payment_method ?? "zwap",
      price_zwap: item.price_zwap ?? 0,
      price_zpts: item.price_zpts ?? item.price_zpoints ?? 0,
      price_stripe: item.price_stripe ?? item.price_usd ?? 0,
      max_quantity: item.max_quantity ?? "",
      is_active: item.is_active ?? item.isActive ?? item.active ?? true,
      category: item.category ?? "",
      subcategory: item.subcategory ?? "",
      fulfillment_type: item.fulfillment_type ?? "none",
      download_url: item.download_url ?? "",
      external_url: item.external_url ?? "",
      fulfillment_notes: item.fulfillment_notes ?? "",
    });
  };

  const handleFieldChange = (field, value) => {
    if (field === "image_url") {
      setImagePreviewError(false);
    }

    setEditingItem((prev) => {
      const next = {
        ...prev,
        [field]: value,
      };

      if (field === "fulfillment_type") {
        if (value !== "digital") next.download_url = "";
        if (value !== "external") next.external_url = "";
      }

      if (field === "payment_method") {
        if (value !== "zwap") next.price_zwap = 0;
        if (value !== "zpts") next.price_zpts = 0;
        if (value !== "stripe") next.price_stripe = 0;
      }

      return next;
    });
  };

  const handleSave = async () => {
    if (!editingItem) return;

    const paymentMethod = editingItem.payment_method || "zwap";

    const payload = {
      name: editingItem.name.trim(),
      description: editingItem.description.trim(),
      image_url: editingItem.image_url?.trim() || null,
      payment_method: paymentMethod,
      price_zwap: paymentMethod === "zwap" ? Number(editingItem.price_zwap) || 0 : 0,
      price_zpoints: paymentMethod === "zpts" ? Number(editingItem.price_zpts) || 0 : 0,
      price_stripe: paymentMethod === "stripe" ? Number(editingItem.price_stripe) || 0 : 0,
      max_quantity:
        editingItem.max_quantity === "" || editingItem.max_quantity == null
          ? null
          : Number(editingItem.max_quantity),
      is_active: !!editingItem.is_active,
      category: editingItem.category?.trim() || null,
      subcategory: editingItem.subcategory?.trim() || null,
      fulfillment_type: editingItem.fulfillment_type || "none",
      download_url: editingItem.download_url?.trim() || null,
      external_url: editingItem.external_url?.trim() || null,
      fulfillment_notes: editingItem.fulfillment_notes?.trim() || null,
    };

    if (!payload.name) {
      toast.error("Item name is required");
      return;
    }

    if (paymentMethod === "zwap" && payload.price_zwap <= 0) {
      toast.error("ZWAP price must be greater than 0");
      return;
    }

    if (paymentMethod === "zpts" && payload.price_zpoints <= 0) {
      toast.error("zPts price must be greater than 0");
      return;
    }

    if (paymentMethod === "stripe" && payload.price_stripe <= 0) {
      toast.error("Stripe price must be greater than 0");
      return;
    }

    setSaving(true);
    try {
      if (editingItem.id) {
        await adminApi.put(`/marketplace/items/${editingItem.id}`, payload);
        toast.success("Item updated");
      } else {
        await adminApi.post("/marketplace/items", payload);
        toast.success("Item created");
      }

      setEditingItem(null);
      setImagePreviewError(false);
      await loadItems();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save item");
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (itemId) => {
    if (!window.confirm("Delete this item?")) return;

    try {
      await adminApi.delete(`/marketplace/items/${itemId}`);
      toast.success("Item deleted");
      await loadItems();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete item");
    }
  };

  if (loading) {
    return <div className="text-gray-400 text-center py-8">Loading marketplace...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Marketplace Management</h2>
        <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={startNewItem}>
          <Plus className="w-4 h-4 mr-2" /> Add Item
        </Button>
      </div>

      {editingItem && (
        <div className="rounded-xl border border-cyan-900/40 bg-black/40 p-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-semibold text-sm">
              {editingItem.id ? "Edit Item" : "New Item"}
            </h3>
            <button
              onClick={() => {
                setEditingItem(null);
                setImagePreviewError(false);
              }}
              className="text-gray-400 hover:text-white"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Name</label>
              <Input
                value={editingItem.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                placeholder="Item name"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400">Category</label>
              <select
                value={editingItem.category}
                onChange={(e) => {
                  handleFieldChange("category", e.target.value);
                  handleFieldChange("subcategory", "");
                }}
                className="w-full rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-gray-100"
              >
                <option value="">Select Category</option>
                {Object.keys(CATEGORY_MAP).map((cat) => (
                  <option key={cat} value={cat}>
                    {formatLabel(cat)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400">Subcategory</label>
              <select
                value={editingItem.subcategory || ""}
                onChange={(e) => handleFieldChange("subcategory", e.target.value)}
                className="w-full rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-gray-100"
                disabled={!editingItem.category}
              >
                <option value="">Select Subcategory</option>
                {(CATEGORY_MAP[editingItem.category] || []).map((sub) => (
                  <option key={sub} value={sub}>
                    {formatLabel(sub)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400">Payment Method</label>
              <select
                value={editingItem.payment_method || "zwap"}
                onChange={(e) => handleFieldChange("payment_method", e.target.value)}
                className="w-full rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-gray-100"
              >
                {PAYMENT_METHOD_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {editingItem.payment_method === "zwap" && (
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Price (ZWAP)</label>
                <Input
                  type="number"
                  min="0"
                  value={editingItem.price_zwap}
                  onChange={(e) => handleFieldChange("price_zwap", e.target.value)}
                />
              </div>
            )}

            {editingItem.payment_method === "zpts" && (
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Price (zPts)</label>
                <Input
                  type="number"
                  min="0"
                  value={editingItem.price_zpts}
                  onChange={(e) => handleFieldChange("price_zpts", e.target.value)}
                />
              </div>
            )}

            {editingItem.payment_method === "stripe" && (
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Price (USD)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editingItem.price_stripe}
                  onChange={(e) => handleFieldChange("price_stripe", e.target.value)}
                  placeholder="9.99"
                />
              </div>
            )}

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs text-gray-400">Description</label>
              <textarea
                className="w-full rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                rows={3}
                value={editingItem.description}
                onChange={(e) => handleFieldChange("description", e.target.value)}
                placeholder="Short description shown in the app marketplace"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs text-gray-400">Image URL</label>
              <Input
                value={editingItem.image_url}
                onChange={(e) => handleFieldChange("image_url", e.target.value)}
                placeholder="https://..."
              />
            </div>

            {editingItem.image_url && (
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-400 block mb-2">Image Preview</label>
                {!imagePreviewError ? (
                  <div className="w-28 h-28 rounded-lg overflow-hidden border border-gray-700 bg-gray-900">
                    <img
                      src={editingItem.image_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={() => setImagePreviewError(true)}
                    />
                  </div>
                ) : (
                  <div className="text-xs text-red-400">
                    Could not load image preview from this URL.
                  </div>
                )}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs text-gray-400">Max Quantity (optional)</label>
              <Input
                type="number"
                min="0"
                value={editingItem.max_quantity}
                onChange={(e) => handleFieldChange("max_quantity", e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400">Fulfillment Type</label>
              <select
                value={editingItem.fulfillment_type || "none"}
                onChange={(e) => handleFieldChange("fulfillment_type", e.target.value)}
                className="w-full rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-gray-100"
              >
                {FULFILLMENT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {editingItem.fulfillment_type === "digital" && (
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs text-gray-400">Download URL</label>
                <Input
                  value={editingItem.download_url || ""}
                  onChange={(e) => handleFieldChange("download_url", e.target.value)}
                  placeholder="https://download-link..."
                />
              </div>
            )}

            {editingItem.fulfillment_type === "external" && (
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs text-gray-400">External URL</label>
                <Input
                  value={editingItem.external_url || ""}
                  onChange={(e) => handleFieldChange("external_url", e.target.value)}
                  placeholder="https://partner-link..."
                />
              </div>
            )}

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs text-gray-400">Fulfillment Notes</label>
              <textarea
                className="w-full rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                rows={2}
                value={editingItem.fulfillment_notes || ""}
                onChange={(e) => handleFieldChange("fulfillment_notes", e.target.value)}
                placeholder="Internal notes for how this item is delivered"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400">Status</label>
              <button
                type="button"
                onClick={() => handleFieldChange("is_active", !editingItem.is_active)}
                className={`px-3 py-2 rounded-md text-xs font-medium border ${
                  editingItem.is_active
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                    : "bg-gray-800 text-gray-400 border-gray-700"
                }`}
              >
                {editingItem.is_active ? "Active" : "Inactive"}
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-3">
            <Button
              variant="ghost"
              className="text-gray-400 hover:text-white"
              onClick={() => {
                setEditingItem(null);
                setImagePreviewError(false);
              }}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              className="bg-cyan-600 hover:bg-cyan-700"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Item"}
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {items.length === 0 ? (
          <div className="text-gray-400 text-center py-8">No marketplace items</div>
        ) : (
          items.map((item) => {
            const itemId = item.id || item._id || item.name;
            const itemPriceZpts = item.price_zpts ?? item.price_zpoints ?? 0;
            const itemPriceStripe = item.price_stripe ?? item.price_usd ?? 0;
            const itemIsActive = item.is_active ?? item.isActive ?? item.active ?? false;
            const itemFulfillmentType = item.fulfillment_type ?? "none";
            const itemPaymentMethod = item.payment_method ?? "zwap";

            return (
              <div
                key={itemId}
                className="p-4 rounded-xl border border-gray-700 bg-gray-800/30 flex items-center gap-4"
              >
                <div className="w-16 h-16 rounded-xl bg-gray-700 overflow-hidden flex-shrink-0">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-gray-500" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold truncate">{item.name}</h3>
                  <p className="text-gray-400 text-sm truncate">{item.description}</p>

                  <div className="flex flex-wrap gap-3 mt-1 text-xs">
                    {itemPaymentMethod === "zwap" && (
                      <span className="text-cyan-400">{item.price_zwap} ZWAP</span>
                    )}

                    {itemPaymentMethod === "zpts" && (
                      <span className="text-purple-400">{itemPriceZpts} zPts</span>
                    )}

                    {itemPaymentMethod === "stripe" && (
                      <span className="text-emerald-400">
                        ${Number(itemPriceStripe || 0).toFixed(2)} USD
                      </span>
                    )}

                    <span className="text-yellow-400">• {formatLabel(itemPaymentMethod)}</span>

                    {item.category && (
                      <span className="text-gray-400">• {formatLabel(item.category)}</span>
                    )}

                    {item.subcategory && (
                      <span className="text-gray-500">• {formatLabel(item.subcategory)}</span>
                    )}

                    <span className="text-blue-400">• {formatLabel(itemFulfillmentType)}</span>

                    {item.max_quantity != null && (
                      <span className="text-gray-500">• max {item.max_quantity}</span>
                    )}

                    <span className={itemIsActive ? "text-emerald-400" : "text-red-400"}>
                      • {itemIsActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEditItem(item)}
                    className="p-2 rounded hover:bg-gray-700 text-gray-400 hover:text-cyan-400"
                    type="button"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => deleteItem(item.id || item._id)}
                    className="p-2 rounded hover:bg-red-900/50 text-gray-400 hover:text-red-400"
                    type="button"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-8 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={loadOrders}
            className="border-gray-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Orders
          </Button>
        </div>

        {ordersLoading ? (
          <div className="text-gray-400 text-center py-6">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-gray-400 text-center py-6 rounded-xl border border-gray-700 bg-gray-800/20">
            No purchase history yet
          </div>
        ) : (
          <div className="grid gap-3">
            {orders.map((order) => (
              <button
                type="button"
                key={order.id || `${order.user_id}-${order.item_id}-${order.timestamp}`}
                onClick={() => setSelectedOrder(order)}
                className="w-full text-left p-4 rounded-xl border border-gray-700 bg-gray-800/30 flex items-center gap-4 hover:bg-gray-800/50 transition-colors"
              >
                <div className="w-14 h-14 rounded-xl bg-gray-700 overflow-hidden flex-shrink-0">
                  {order.item_image_url ? (
                    <img
                      src={order.item_image_url}
                      alt={order.item_name || "Order item"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-gray-500" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium truncate">
                    {order.item_name || order.item_id || "Unknown Item"}
                  </h4>

                  <div className="flex flex-wrap gap-3 mt-1 text-xs">
                    <span className="text-cyan-400">
                      {order.amount ?? 0} {order.payment_type || "—"}
                    </span>

                    {order.wallet_address && (
                      <span className="text-gray-400 font-mono">
                        • {order.wallet_address.slice(0, 8)}...{order.wallet_address.slice(-4)}
                      </span>
                    )}

                    {order.username && (
                      <span className="text-gray-400">• {order.username}</span>
                    )}

                    {order.timestamp && (
                      <span className="text-gray-500">
                        • {new Date(order.timestamp).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <motion.div
            className="bg-[#0f1029] border border-gray-700 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg">Order Details</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-white"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-gray-800/50 rounded-lg">
                <p className="text-xs text-gray-500">Item</p>
                <p className="text-white">{selectedOrder.item_name || "Unknown item"}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-500">Amount</p>
                  <p className="text-cyan-400 font-bold">
                    {selectedOrder.amount || 0} {selectedOrder.payment_type || "—"}
                  </p>
                </div>

                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-500">Username</p>
                  <p className="text-white">{selectedOrder.username || "—"}</p>
                </div>
              </div>

              <div className="p-3 bg-gray-800/50 rounded-lg">
                <p className="text-xs text-gray-500">Wallet Address</p>
                <p className="text-white font-mono text-sm break-all">
                  {selectedOrder.wallet_address || "—"}
                </p>
              </div>

              <div className="p-3 bg-gray-800/50 rounded-lg">
                <p className="text-xs text-gray-500">Order ID</p>
                <p className="text-white font-mono text-sm break-all">
                  {selectedOrder.id || "—"}
                </p>
              </div>

              <div className="p-3 bg-gray-800/50 rounded-lg">
                <p className="text-xs text-gray-500">Item ID</p>
                <p className="text-white font-mono text-sm break-all">
                  {selectedOrder.item_id || "—"}
                </p>
              </div>

              <div className="p-3 bg-gray-800/50 rounded-lg">
                <p className="text-xs text-gray-500">Timestamp</p>
                <p className="text-white">
                  {selectedOrder.timestamp
                    ? new Date(selectedOrder.timestamp).toLocaleString()
                    : "—"}
                </p>
              </div>
            </div>

            <Button
              onClick={() => setSelectedOrder(null)}
              className="w-full mt-4 bg-gray-700 hover:bg-gray-600"
              type="button"
            >
              Close
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}