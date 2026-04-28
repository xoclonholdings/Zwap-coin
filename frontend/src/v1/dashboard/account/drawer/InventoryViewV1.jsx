import React from "react";
import {
  ChevronLeft,
  Package,
  Sparkles,
  CircleDot,
  Download,
  Shield,
} from "lucide-react";

function normalizeItem(item = {}) {
  return {
    id: item.id || item._id || item.item_id || "",
    name: item.name || item.title || item.label || "Unlocked Item",
    description:
      item.description ||
      item.subtitle ||
      item.details ||
      "Stored in your ZWAP! inventory.",
    category: item.category || item.type || "Item",
    rarity: item.rarity || "Owned",
    equipped: Boolean(item.equipped),
    downloadUrl: item.downloadUrl || item.download_url || "",
  };
}

function HeaderButton({ onClick, children, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/75 shadow-[0_0_10px_rgba(255,255,255,0.06)] transition active:scale-[0.97]"
    >
      {children}
    </button>
  );
}

function CategoryPill({ children }) {
  return (
    <div className="inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-cyan-100">
      {children}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-cyan-300/15 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.14),transparent_44%),radial-gradient(circle_at_85%_20%,rgba(168,85,247,0.10),transparent_36%),linear-gradient(180deg,rgba(12,20,32,0.96),rgba(5,9,18,0.98))] px-4 py-7 text-center shadow-[0_16px_42px_rgba(0,0,0,0.36)]">
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
          <div className="rounded-[16px] border border-white/8 bg-white/[0.035] px-2 py-2">
            <div className="text-[9px] font-black uppercase tracking-[0.12em] text-white/35">
              Boosts
            </div>
          </div>

          <div className="rounded-[16px] border border-white/8 bg-white/[0.035] px-2 py-2">
            <div className="text-[9px] font-black uppercase tracking-[0.12em] text-white/35">
              Rings
            </div>
          </div>

          <div className="rounded-[16px] border border-white/8 bg-white/[0.035] px-2 py-2">
            <div className="text-[9px] font-black uppercase tracking-[0.12em] text-white/35">
              Books
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ItemCard({ item }) {
  const normalized = normalizeItem(item);

  return (
    <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.10),transparent_42%),linear-gradient(180deg,rgba(14,24,34,0.94),rgba(6,10,18,0.98))] p-3 shadow-[0_12px_28px_rgba(0,0,0,0.28)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),transparent_40%)]" />

      <div className="relative flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border border-cyan-300/18 bg-cyan-400/10 text-cyan-100 shadow-[0_0_16px_rgba(34,211,238,0.12)]">
          <Package size={18} strokeWidth={2.2} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="truncate text-sm font-black tracking-[-0.03em] text-white">
              {normalized.name}
            </div>

            {normalized.equipped ? (
              <Shield size={13} strokeWidth={2.2} className="text-cyan-200" />
            ) : null}
          </div>

          <div className="mt-1 line-clamp-2 text-xs leading-5 text-white/50">
            {normalized.description}
          </div>

          <div className="mt-2 flex items-center gap-2">
            <CategoryPill>{normalized.category}</CategoryPill>

            <div className="inline-flex items-center gap-1 rounded-full border border-white/8 bg-white/[0.035] px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-white/38">
              <CircleDot size={10} />
              {normalized.rarity}
            </div>
          </div>
        </div>

        {normalized.downloadUrl ? (
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/60"
            aria-label="Download item"
          >
            <Download size={15} strokeWidth={2.2} />
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default function InventoryViewV1({ onBack, items = [] }) {
  const hasItems = Array.isArray(items) && items.length > 0;

  return (
    <div className="flex h-full min-h-0 flex-col bg-[linear-gradient(180deg,rgba(6,12,18,0.98),rgba(4,8,14,1))] text-white">
      <div className="flex h-[56px] shrink-0 items-center justify-between border-b border-white/8 px-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-black tracking-[-0.03em] text-white/78"
        >
          <ChevronLeft size={16} strokeWidth={2.4} />
          Back
        </button>

        <div className="text-[15px] font-black tracking-[-0.04em] text-white/92">
          Inventory
        </div>

        <HeaderButton label="Inventory sparkle">
          <Sparkles size={15} strokeWidth={2.3} />
        </HeaderButton>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden px-3 py-3">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-28 w-52 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-24 w-24 rounded-full bg-violet-400/10 blur-2xl" />
        </div>

        <div className="relative z-10 h-full min-h-0">
          {hasItems ? (
            <div className="flex h-full min-h-0 flex-col gap-2.5 overflow-y-auto pr-1">
              {items.map((item, index) => (
                <ItemCard key={item?.id || item?._id || index} item={item} />
              ))}
            </div>
          ) : (
            <div className="flex h-full items-start pt-2">
              <EmptyState />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
