import React from "react";
import { ChevronLeft, Package, ExternalLink } from "lucide-react";

function EmptyState() {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(14,24,34,0.96),rgba(8,14,20,0.98))] px-5 py-8 text-center shadow-[0_14px_36px_rgba(0,0,0,0.28)]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
        <Package size={22} strokeWidth={2} className="text-white/48" />
      </div>

      <div className="mt-4 text-[16px] font-semibold tracking-[-0.03em] text-white">
        No items yet
      </div>

      <div className="mt-2 text-sm leading-relaxed text-white/52">
        Purchased items, unlocked downloads, and future premium rewards will
        appear here.
      </div>
    </div>
  );
}

function InventoryItemCard({
  title,
  subtitle,
  meta,
  onOpen,
  actionLabel = "Open",
}) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_12px_28px_rgba(0,0,0,0.22)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-semibold tracking-[-0.03em] text-white">
            {title}
          </div>

          {subtitle ? (
            <div className="mt-1 text-sm text-white/56">
              {subtitle}
            </div>
          ) : null}

          {meta ? (
            <div className="mt-3 text-[11px] uppercase tracking-[0.16em] text-white/38">
              {meta}
            </div>
          ) : null}
        </div>

        {onOpen ? (
          <button
            type="button"
            onClick={onOpen}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/66"
            aria-label={actionLabel}
          >
            <ExternalLink size={15} strokeWidth={2} />
          </button>
        ) : null}
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

        <div className="w-9" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {hasItems ? (
          <div className="space-y-3">
            {items.map((item, index) => (
              <InventoryItemCard
                key={item.id || `${item.title || "item"}-${index}`}
                title={item.title || "Unlocked Item"}
                subtitle={item.subtitle || item.description || ""}
                meta={item.meta || item.type || ""}
                onOpen={item.onOpen}
                actionLabel={item.actionLabel || "Open item"}
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}