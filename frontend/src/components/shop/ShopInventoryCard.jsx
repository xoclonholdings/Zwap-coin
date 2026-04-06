import React from "react";
import {
  Package,
  Download,
  ExternalLink,
  Check,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ShopInventoryDialog({
  open,
  onClose,
  inventoryItems = [],
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg rounded-3xl border-pink-500/30 bg-[linear-gradient(180deg,rgba(14,10,24,0.98),rgba(9,8,18,0.99))]">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">
            Your Inventory
          </DialogTitle>
        </DialogHeader>

        {inventoryItems.length === 0 ? (
          <div className="py-12 text-center">
            <Package className="mx-auto mb-4 h-10 w-10 text-white/20" />
            <p className="text-sm text-white/60">
              You don’t own any items yet.
            </p>
          </div>
        ) : (
          <div className="max-h-[400px] space-y-3 overflow-y-auto pr-1">
            {inventoryItems.map((item) => (
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

        <div className="mt-4">
          <Button
            onClick={onClose}
            className="w-full bg-[linear-gradient(135deg,#ec4899,#a855f7)] text-white"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}