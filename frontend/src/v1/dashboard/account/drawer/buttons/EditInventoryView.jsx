import React, { useState } from "react";
import { ChevronLeft, Check, ShoppingBag, Eye, Lock, Layers } from "lucide-react";

function ToggleRow({
  icon,
  title,
  description,
  enabled = false,
  onToggle,
}) {
  return (
    <div className="relative overflow-hidden rounded-[22px] border border-cyan-300/14 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.10),transparent_44%),linear-gradient(180deg,rgba(14,24,34,0.94),rgba(6,10,18,0.98))] p-3.5 shadow-[0_12px_28px_rgba(0,0,0,0.28)]">
      <div className="relative flex items-center gap-3">
        <div
          className={[
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border",
            enabled
              ? "border-cyan-300/24 bg-cyan-400/12 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.12)]"
              : "border-white/10 bg-white/[0.04] text-white/48",
          ].join(" ")}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold tracking-[-0.02em] text-white/92">
            {title}
          </div>

          <div className="mt-1 text-[11px] font-medium leading-4 text-white/48">
            {description}
          </div>
        </div>

        <button
          type="button"
          onClick={onToggle}
          className={[
            "relative h-7 w-12 shrink-0 rounded-full border transition active:scale-[0.98]",
            enabled
              ? "border-cyan-300/30 bg-cyan-400/35 shadow-[0_0_16px_rgba(34,211,238,0.16)]"
              : "border-white/12 bg-white/[0.05]",
          ].join(" ")}
          aria-label={`Toggle ${title}`}
        >
          <span
            className={[
              "absolute top-1 h-5 w-5 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.25)] transition",
              enabled ? "left-6" : "left-1",
            ].join(" ")}
          />
        </button>
      </div>
    </div>
  );
}

export default function EditInventoryView({
  onBack,
  onSave,
  showOwnedOnly = true,
  showLockedItems = false,
  groupByCategory = true,
}) {
  const [localShowOwnedOnly, setLocalShowOwnedOnly] = useState(showOwnedOnly);
  const [localShowLockedItems, setLocalShowLockedItems] =
    useState(showLockedItems);
  const [localGroupByCategory, setLocalGroupByCategory] =
    useState(groupByCategory);

  const handleSave = () => {
    onSave?.({
      showOwnedOnly: localShowOwnedOnly,
      showLockedItems: localShowLockedItems,
      groupByCategory: localGroupByCategory,
    });

    onBack?.();
  };

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

        <div className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.02em] text-white/92">
          <ShoppingBag size={16} strokeWidth={2.3} className="text-cyan-100/75" />
          Inventory
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-400/10 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.14)] transition active:scale-[0.97]"
          aria-label="Save inventory settings"
        >
          <Check size={16} strokeWidth={2.4} />
        </button>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden px-3 py-3">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-28 w-52 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-24 w-24 rounded-full bg-violet-400/10 blur-2xl" />
        </div>

        <div className="relative z-10 flex h-full min-h-0 flex-col gap-2.5">
          <ToggleRow
            icon={<Eye size={18} strokeWidth={2.2} />}
            title="Owned Only"
            description="Show items already attached to this account."
            enabled={localShowOwnedOnly}
            onToggle={() => setLocalShowOwnedOnly((current) => !current)}
          />

          <ToggleRow
            icon={<Lock size={18} strokeWidth={2.2} />}
            title="Locked Items"
            description="Show locked inventory slots and future unlocks."
            enabled={localShowLockedItems}
            onToggle={() => setLocalShowLockedItems((current) => !current)}
          />

          <ToggleRow
            icon={<Layers size={18} strokeWidth={2.2} />}
            title="Group by Category"
            description="Organize inventory by boosts, rings, eBooks, and cosmetics."
            enabled={localGroupByCategory}
            onToggle={() => setLocalGroupByCategory((current) => !current)}
          />
        </div>
      </div>
    </div>
  );
}