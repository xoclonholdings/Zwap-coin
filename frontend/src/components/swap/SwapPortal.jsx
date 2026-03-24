import React from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Info,
  Layers3,
  Orbit,
  ShieldCheck,
} from "lucide-react";

export default function SwapPortal({
  services,
  portalData,
  fromToken,
  toToken,
  prices,
  bestRouteLabel,
  onOpenRoute,
}) {
  const featuredService =
    services.find((service) => service.recommended) || services[0];

  const supportedAssets = portalData?.supportedAssets || [];
  const infoLines = portalData?.infoLines || [];

  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <div className="mb-3 flex items-center gap-2">
        <Layers3 className="h-4 w-4 text-cyan-300" />
        <h3 className="text-sm font-semibold text-white">Swap Portal</h3>
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/8 p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-white/45">
                Current Route
              </p>
              <p className="mt-1 text-sm font-medium text-white">
                {fromToken} → {toToken}
              </p>
              <p className="mt-1 text-xs text-cyan-300">{bestRouteLabel}</p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
              <Orbit className="h-4 w-4 text-cyan-300" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-white/45">
                Supported Assets
              </p>
              <p className="mt-1 text-sm font-medium text-white/85">
                {supportedAssets.length} available
              </p>
            </div>

            <div className="rounded-xl border border-white/8 bg-white/5 px-2.5 py-1 text-[11px] text-white/55">
              Live
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {supportedAssets.map((asset) => (
              <div
                key={asset}
                className={`rounded-xl border px-2.5 py-1 text-[11px] font-medium ${
                  asset === fromToken || asset === toToken
                    ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
                    : "border-white/8 bg-white/5 text-white/65"
                }`}
              >
                {asset}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
          <p className="text-[11px] uppercase tracking-wide text-white/45">
            How It Works
          </p>

          <div className="mt-3 space-y-2">
            {infoLines.map((line, index) => (
              <motion.div
                key={`${line}-${index}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-2"
              >
                <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-violet-300" />
                <p className="text-xs leading-5 text-white/58">{line}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-white/45">
                Route Provider
              </p>
              <p className="mt-1 text-sm font-medium text-white/85">
                {featuredService?.name || "Best available route"}
              </p>
              <p className="mt-1 text-xs text-white/45">
                {featuredService?.description || "Supported utility path"}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (featuredService) {
                onOpenRoute(featuredService);
              }
            }}
            className="mt-3 inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Open Route
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </button>
        </div>

        <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
          <p className="text-[11px] uppercase tracking-wide text-white/45">
            Route Context
          </p>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-white/8 bg-white/5 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-white/40">
                From
              </p>
              <p className="mt-1 text-xs font-medium text-white/82">
                {fromToken}
              </p>
            </div>

            <div className="rounded-xl border border-white/8 bg-white/5 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-white/40">
                To
              </p>
              <p className="mt-1 text-xs font-medium text-white/82">
                {toToken}
              </p>
            </div>
          </div>

          <p className="mt-3 text-[11px] leading-5 text-white/40">
            {prices?.[fromToken] && prices?.[toToken]
              ? "Route data is available for the selected conversion."
              : "Some routes may estimate output once pricing data is refreshed."}
          </p>
        </div>
      </div>
    </div>
  );
}