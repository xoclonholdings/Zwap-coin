import React from "react";
import { ChevronLeft, ShoppingBag } from "lucide-react";

import ShopInventoryCard from "@/v1/dashboard/windows/shop/ShopInventoryCard";

function HeaderButton({ children, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="
        flex h-9 w-9 items-center justify-center
        rounded-full
        border border-cyan-200/15
        bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),rgba(255,255,255,0.04))]
        text-cyan-100/78
        shadow-[0_0_14px_rgba(34,211,238,0.08)]
        transition active:scale-[0.97]
      "
    >
      {children}
    </button>
  );
}

export default function InventoryViewV1({
  onBack,
  onOpenInventorySettings,
  items = [],
  inventoryLoading = false,
}) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-[linear-gradient(180deg,rgba(6,12,18,0.98),rgba(4,8,14,1))] text-white">
      <div className="flex h-[56px] shrink-0 items-center justify-between border-b border-cyan-200/10 px-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold tracking-[-0.02em] text-white/78"
        >
          <ChevronLeft size={16} strokeWidth={2.4} />
          Back
        </button>

        <div className="text-[15px] font-semibold tracking-[-0.02em] text-white/92">
          Inventory
        </div>

        <HeaderButton
          label="Open inventory settings"
          onClick={onOpenInventorySettings}
        >
          <ShoppingBag size={15} strokeWidth={2.3} />
        </HeaderButton>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden px-3 py-3">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-28 w-52 -translate-x-1/2 rounded-full bg-violet-400/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-24 w-24 rounded-full bg-cyan-400/10 blur-2xl" />
        </div>

        <div className="relative z-10 h-full min-h-0 overflow-y-auto pr-1">
          <ShopInventoryCard
            inventoryItems={items}
            inventoryLoading={inventoryLoading}
          />
        </div>
      </div>
    </div>
  );
}