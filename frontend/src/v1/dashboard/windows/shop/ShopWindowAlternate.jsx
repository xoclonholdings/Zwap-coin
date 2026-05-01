import React from "react";
import {
  getCategoryId,
  getCategoryLabel,
} from "./shopWindowUtils";

export default function ShopWindowAlternate({
  groupedCategories = [],
  groupIndex = 0,
  activeCategoryId,
  getCategoryIcon,
  onCategorySelect,
}) {
  const activeGroup =
    groupedCategories[groupIndex] || groupedCategories[0] || {
      group: "Shop",
      categories: [],
    };

  return (
    <div className="relative z-10 mt-5 flex min-h-0 flex-1 flex-col">
      {/* Group Header */}
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[10px] font-black uppercase tracking-[0.18em] text-cyan-200/60">
          {activeGroup.group}
        </p>

        <p className="shrink-0 text-[9px] font-black uppercase tracking-[0.12em] text-white/28">
          {groupIndex + 1}/{Math.max(1, groupedCategories.length)}
        </p>
      </div>

      {/* Category Slots (NO SCROLL) */}
      <div className="mt-3 grid flex-1 grid-rows-2 gap-2">
        {activeGroup.categories.slice(0, 2).map((category) => {
          const categoryId = getCategoryId(category);
          const CategoryIcon = getCategoryIcon(category);
          const active = categoryId === activeCategoryId;

          return (
            <button
              key={categoryId}
              type="button"
              onClick={() => onCategorySelect(category)}
              className={[
                "flex min-h-0 items-center gap-2 rounded-2xl border px-3 text-left",
                active
                  ? "border-cyan-300/40 bg-cyan-300/15 text-white"
                  : "border-white/10 bg-white/[0.04] text-white/60",
              ].join(" ")}
            >
              <CategoryIcon className="h-4 w-4 shrink-0" />

              <span className="truncate text-[10px] font-semibold uppercase tracking-[0.13em]">
                {getCategoryLabel(category)}
              </span>
            </button>
          );
        })}

        {/* Fill slot if only one category */}
        {activeGroup.categories.length === 1 ? (
          <div className="min-h-0 rounded-2xl border border-white/8 bg-white/[0.025]" />
        ) : null}
      </div>

      {/* Pagination Dots */}
      <div className="mt-3 flex shrink-0 items-center justify-center gap-1.5">
        {groupedCategories.map((group, index) => (
          <span
            key={group.group}
            className={[
              "h-1.5 rounded-full transition-all",
              index === groupIndex
                ? "w-5 bg-cyan-200"
                : "w-1.5 bg-white/24",
            ].join(" ")}
          />
        ))}
      </div>
    </div>
  );
}