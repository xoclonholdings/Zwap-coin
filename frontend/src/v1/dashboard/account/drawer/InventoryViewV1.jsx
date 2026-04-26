import React from "react";
import { ChevronLeft, Package } from "lucide-react";

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-[20px] border border-white/8 bg-white/[0.02] px-4 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/50">
        <Package size={22} />
      </div>

      <div className="mt-4 text-sm font-semibold text-white/80">
        No Items Yet
      </div>

      <div className="mt-1 text-xs text-white/50">
        Items you unlock or purchase will appear here
      </div>
    </div>
  );
}

function ItemCard({ item }) {
  return (
    <div className="rounded-[18px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,24,34,0.9),rgba(8,14,20,0.95))] p-3 shadow-[0_8px_24px_rgba(0,0,0,0.28)]">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.04] text-white/60">
          {/* placeholder icon */}
          <Package size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-white">
            {item?.name || "Item"}
          </div>

          {item?.description ? (
            <div className="mt-0.5 truncate text-xs text-white/50">
              {item.description}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function InventoryViewV1({
  onBack,
  items = [],
}) {
  const hasItems = Array.isArray(items) && items.length > 0;

  return (
    <div className="flex h-full min-h-0 flex-col bg-[linear-gradient(180deg,rgba(8,14,20,0.98),rgba(4,8,14,1))] text-white">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-white/72"
        >
          <ChevronLeft size={16} strokeWidth={2} />
          Back
        </button>

        <div className="text-sm font-semibold tracking-[-0.02em] text-white/88">
          Inventory
        </div>

        <div className="w-8" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {hasItems ? (
          <div className="space-y-3">
            {items.map((item, index) => (
              <ItemCard key={item?.id || index} item={item} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}