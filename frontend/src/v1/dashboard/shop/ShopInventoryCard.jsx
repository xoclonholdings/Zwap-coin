import React from "react";
import {
  Package,
  Download,
  ExternalLink,
  Check,
} from "lucide-react";

function normalizeInventoryItem(item = {}) {
  return {
    id: item.id || item._id || item.item_id || "",
    name:
      item.name ||
      item.title ||
      item.label ||
      item.item_name ||
      "Unlocked Item",
    description:
      item.description ||
      item.subtitle ||
      item.details ||
      item.fulfillment_notes ||
      "Stored in your ZWAP! inventory.",
    category: item.category || item.type || "Owned",
    imageUrl: item.image_url || item.imageUrl || "",
    downloadUrl: item.download_url || item.downloadUrl || "",
    externalUrl: item.external_url || item.externalUrl || "",
  };
}

function EmptyInventoryState() {
  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-cyan-300/15 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.14),transparent_44%),radial-gradient(circle_at_85%_20%,rgba(168,85,247,0.10),transparent_36%),linear-gradient(180deg,rgba(12,20,32,0.96),rgba(5,9,18,0.98))] px-4 py-7 text-center shadow-[0_16px_42px_rgba(0,0,0,0.36)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.065),transparent_34%,rgba(34,211,238,0.045))]" />

      <div className="relative flex flex-col items-center">
        <div className="flex h-[70px] w-[70px] items-center justify-center rounded-full border border-cyan-300/25 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.22),rgba(8,14,24,0.96))] text-cyan-100 shadow-[0_0_28px_rgba(34,211,238,0.18)]">
          <Package size={26} strokeWidth={2.2} />
        </div>

        <div className="mt-4 text-[20px] font-black tracking-[-0.06em] text-white">
          No Items Yet
        </div>

        <div className="mt-2 max-w-[240px] text-xs font-medium leading-5 text-white/52">
          Shop unlocks, profile cosmetics, boosts, and eBooks will land here.
        </div>

        <div className="mt-5 grid w-full grid-cols-3 gap-2">
          {["Boosts", "Rings", "Books"].map((label) => (
            <div
              key={label}
              className="rounded-[16px] border border-white/8 bg-white/[0.035] px-2 py-2"
            >
              <div className="text-[9px] font-black uppercase tracking-[0.12em] text-white/35">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ShopInventoryCard({
  inventoryItems = [],
  inventoryLoading = false,
}) {
  const safeItems = Array.isArray(inventoryItems) ? inventoryItems : [];

  return (
    <section className="w-full">
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="text-sm font-black uppercase tracking-[0.14em] text-white/85">
          Owned Items
        </h3>

        <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-cyan-100">
          {safeItems.length}
        </span>
      </div>

      {inventoryLoading ? (
        <div className="flex h-[120px] items-center justify-center rounded-[1.5rem] border border-white/10 bg-white/[0.03]">
          <p className="text-xs font-medium text-white/50">Loading…</p>
        </div>
      ) : safeItems.length === 0 ? (
        <EmptyInventoryState />
      ) : (
        <div className="space-y-2.5">
          {safeItems.map((item, index) => {
            const normalized = normalizeInventoryItem(item);
            const key = normalized.id || `${normalized.name}-${index}`;

            return (
              <div
                key={key}
                className="relative overflow-hidden rounded-[22px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.10),transparent_42%),linear-gradient(180deg,rgba(14,24,34,0.94),rgba(6,10,18,0.98))] p-3 shadow-[0_12px_28px_rgba(0,0,0,0.28)]"
              >
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),transparent_40%)]" />

                <div className="relative flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[16px] border border-cyan-300/18 bg-cyan-400/10 text-cyan-100 shadow-[0_0_16px_rgba(34,211,238,0.12)]">
                    {normalized.imageUrl ? (
                      <img
                        src={normalized.imageUrl}
                        alt={normalized.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Package size={18} strokeWidth={2.2} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black tracking-[-0.03em] text-white">
                      {normalized.name}
                    </p>

                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/50">
                      {normalized.description}
                    </p>

                    <div className="mt-2 inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-cyan-100">
                      {normalized.category}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {normalized.downloadUrl ? (
                      <button
                        type="button"
                        onClick={() => window.open(normalized.downloadUrl)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/60"
                        aria-label="Download item"
                      >
                        <Download size={14} strokeWidth={2.2} />
                      </button>
                    ) : null}

                    {normalized.externalUrl ? (
                      <button
                        type="button"
                        onClick={() => window.open(normalized.externalUrl)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/60"
                        aria-label="Open item"
                      >
                        <ExternalLink size={14} strokeWidth={2.2} />
                      </button>
                    ) : null}

                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-cyan-300/15 bg-cyan-300/15 text-cyan-200">
                      <Check size={14} strokeWidth={2.4} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
