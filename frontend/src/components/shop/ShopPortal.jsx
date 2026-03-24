import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Crown,
  Megaphone,
  Sparkles,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ShopPortal({
  isPlus,
  onOpenPlus,
  onOpenSponsored,
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 gap-3"
    >
      <div className="overflow-hidden rounded-[24px] border border-emerald-400/15 bg-[linear-gradient(155deg,rgba(16,185,129,0.14),rgba(8,16,23,0.94)_50%,rgba(34,211,238,0.08))] p-4 shadow-[0_14px_34px_rgba(0,0,0,0.26)]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-emerald-300" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
                Sponsored Items
              </span>
            </div>

            <h3 className="text-[15px] font-semibold text-white">
              Limited partner rewards
            </h3>

            <p className="mt-1 text-sm leading-relaxed text-white/68">
              Future-ready space for sponsored drops, special offers, and timed reward campaigns.
            </p>
          </div>

          <div className="shrink-0 rounded-full border border-emerald-300/15 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-200">
            Promo
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {["Drops", "Offers", "Campaigns"].map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/72"
            >
              {tag}
            </span>
          ))}
        </div>

        <Button
          type="button"
          onClick={onOpenSponsored}
          className="mt-4 h-10 rounded-[16px] border border-white/10 bg-white/10 text-white hover:bg-white/15"
        >
          Explore offers
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-violet-400/15 bg-[linear-gradient(155deg,rgba(168,85,247,0.16),rgba(8,16,23,0.95)_50%,rgba(34,211,238,0.06))] p-4 shadow-[0_14px_34px_rgba(0,0,0,0.26)]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <Crown className="h-4 w-4 text-violet-300" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-200">
                Plus Access
              </span>
            </div>

            <h3 className="text-[15px] font-semibold text-white">
              {isPlus ? "You’re in the Plus lane" : "Unlock premium rewards"}
            </h3>

            <p className="mt-1 text-sm leading-relaxed text-white/68">
              {isPlus
                ? "Exclusive items, premium drops, and future redemption perks are open to you."
                : "Upgrade for premium shop items, elevated redemption access, and a stronger rewards runway."}
            </p>
          </div>

          <div className="shrink-0 rounded-full border border-violet-300/15 bg-violet-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-200">
            {isPlus ? "Active" : "Upgrade"}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {["Exclusive items", "Premium drops", "Future boosts"].map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/78"
            >
              <Star className="h-3 w-3 text-violet-300" />
              {tag}
            </span>
          ))}
        </div>

        {!isPlus ? (
          <Button
            type="button"
            onClick={onOpenPlus}
            className="mt-4 h-10 rounded-[16px] border border-violet-300/20 bg-violet-500/18 text-white hover:bg-violet-500/24"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Upgrade to Plus
          </Button>
        ) : (
          <div className="mt-4 inline-flex items-center rounded-full border border-violet-300/15 bg-violet-400/10 px-3 py-2 text-xs font-medium text-violet-200">
            Premium access is active
          </div>
        )}
      </div>
    </motion.section>
  );
}