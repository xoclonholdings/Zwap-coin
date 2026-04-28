import React from "react";
import {
  Package,
  Download,
  ExternalLink,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ShopInventoryCard({
  inventoryItems = [],
  inventoryLoading = false,
}) {
  const previewItems = inventoryItems.slice(0, 3);

  return (
    <section className="rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(236,72,153,0.12),transparent_40%),linear-gradient(180deg,rgba(8,10,18,0.96),rgba(6,8,14,0.98))] p-4 backdrop-blur-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Inventory
          </h3>
          <p className="mt-1 text-sm text-white/55">
            Your owned items and unlocked rewards.
          </p>
        </div>

        <div className="rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1.5 text-xs font-semibold text-pink-200">
          {inventoryItems.length} Owned
        </div>
      </div>

      {inventoryLoading ? (
        <div className="rounded-[22px] bg-black/20 px-4 py-12 text-center">
          <p className="text-sm text-white/60">Loading inventory...</p>
        </div>
      ) : previewItems.length === 0 ? (
        <div className="rounded-[22px] bg-black/20 px-4 py-12 text-center">
          <Package className="mx-auto mb-4 h-10 w-10 text-white/20" />
          <p className="text-sm text-white/60">
            You don’t own any items yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {previewItems.map((item) => (
            <div
              key={item.id || item._id}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3"
            >
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-black/30">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Package className="h-6 w-6 text-white/25" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {item.name}
                </p>

                <p className="mt-1 text-xs text-white/50">
                  {item.type || "Owned Item"}
                </p>

                <div className="mt-2 flex items-center gap-2">
                  {item.download_url ? (
                    <Button
                      size="sm"
                      onClick={() => window.open(item.download_url)}
                      className="h-7 bg-pink-500/15 px-2 text-xs text-pink-200 hover:bg-pink-500/25"
                    >
                      <Download className="mr-1 h-3 w-3" />
                      Download
                    </Button>
                  ) : null}

                  {item.external_url ? (
                    <Button
                      size="sm"
                      onClick={() => window.open(item.external_url)}
                      className="h-7 bg-pink-500/15 px-2 text-xs text-pink-200 hover:bg-pink-500/25"
                    >
                      <ExternalLink className="mr-1 h-3 w-3" />
                      Open
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-500/15">
                <Check className="h-4 w-4 text-pink-300" />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
