import React from "react";
import {
  Package,
  Download,
  ExternalLink,
  Check,
} from "lucide-react";

export default function ShopInventoryCard({
  inventoryItems = [],
  inventoryLoading = false,
}) {
  const safeItems = Array.isArray(inventoryItems) ? inventoryItems : [];
  const previewItems = safeItems.slice(0, 3);

  return (
    <section className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-3">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/85">
          Inventory
        </h3>

        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-200/70">
          {safeItems.length}
        </span>
      </div>

      {/* States */}
      {inventoryLoading ? (
        <div className="flex h-[80px] items-center justify-center rounded-xl bg-white/[0.02]">
          <p className="text-xs text-white/50">Loading…</p>
        </div>
      ) : previewItems.length === 0 ? (
        <div className="flex h-[80px] flex-col items-center justify-center gap-2 rounded-xl bg-white/[0.02] text-center">
          <Package className="h-5 w-5 text-white/25" />
          <p className="text-[11px] text-white/45">
            No items yet
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {previewItems.map((item) => {
            const id = item.id || item._id;

            return (
              <div
                key={id}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-2"
              >
                {/* Thumbnail */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-black/25">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Package className="h-4 w-4 text-white/25" />
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-white">
                    {item.name}
                  </p>

                  <p className="mt-0.5 text-[10px] text-white/45">
                    {item.type || "Owned"}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {item.download_url && (
                    <button
                      onClick={() => window.open(item.download_url)}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-white/60"
                    >
                      <Download className="h-3 w-3" />
                    </button>
                  )}

                  {item.external_url && (
                    <button
                      onClick={() => window.open(item.external_url)}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-white/60"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  )}

                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-cyan-300/15 text-cyan-200">
                    <Check className="h-3 w-3" />
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