import React from "react";
import { ArrowUpRight, Info, Layers3, ShieldCheck } from "lucide-react";

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

  const hasPricing = prices?.[fromToken] && prices?.[toToken];

  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <div className="mb-3 flex items-center gap-2">
        <Layers3 className="h-4 w-4 text-cyan-300" />
        <h3 className="text-sm font-semibold text-white">Swap Basics</h3>
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/8 p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-white/45">
                Active Path
              </p>
              <p className="mt-1 text-sm font-medium text-white">
                {fromToken} → {toToken}
              </p>
              <p className="mt-1 text-xs text-cyan-300">{bestRouteLabel}</p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
              <ShieldCheck className="h-4 w-4 text-cyan-300" />
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
                Familiar routes, simple flow
              </p>
            </div>

            <div className="rounded-xl border border-white/8 bg-white/5 px-2.5 py-1 text-[11px] text-white/55">
              Live
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {supportedAssets.map((asset) => {
              const isActive = asset === fromToken || asset === toToken;

              return (
                <div
                  key={asset}
                  className={`rounded-xl border px-2.5 py-1 text-[11px] font-medium ${
                    isActive
                      ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
                      : "border-white/8 bg-white/5 text-white/65"
                  }`}
                >
                  {asset}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-violet-300" />
            <div>
              <p className="text-[11px] uppercase tracking-wide text-white/45">
                How Swap Works
              </p>
              <p className="mt-2 text-xs leading-5 text-white/58">
                Choose a conversion path, enter an amount, and let ZWAP prepare
                the route for you. Some swaps may require wallet confirmation in
                a secure external flow.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
          <p className="text-[11px] uppercase tracking-wide text-white/45">
            Route Status
          </p>
          <p className="mt-2 text-xs leading-5 text-white/58">
            {hasPricing
              ? "Pricing data is available for this conversion path."
              : "Route estimates may improve after pricing refresh."}
          </p>

          <button
            type="button"
            onClick={() => {
              if (featuredService) {
                onOpenRoute(featuredService);
              }
            }}
            className="mt-3 inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Continue in Secure Route
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
