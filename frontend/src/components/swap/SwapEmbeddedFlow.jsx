import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRightLeft,
  Maximize2,
  Minimize2,
  ShieldCheck,
  X,
} from "lucide-react";

function ServiceLogo({ service, size = "md" }) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const [useFallback, setUseFallback] = React.useState(false);

  if (useFallback) {
    return (
      <div
        className={`${sizeClasses[size]} flex items-center justify-center rounded-xl border border-white/10 bg-white/6 text-lg`}
      >
        <span>{service?.fallbackLogo || "↗"}</span>
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} overflow-hidden rounded-xl border border-white/10 bg-white`}
    >
      <img
        src={service?.logo}
        alt={service?.name || "Route"}
        className="h-full w-full object-contain p-1.5"
        onError={() => setUseFallback(true)}
      />
    </div>
  );
}

export default function SwapEmbeddedFlow({
  activeService,
  isFullscreen,
  isRouteLoading,
  fromAmount,
  fromToken,
  toToken,
  onToggleFullscreen,
  onClose,
}) {
  return (
    <div
      className={`fixed inset-0 z-50 bg-[#081017] ${
        isFullscreen ? "" : "p-4"
      }`}
    >
      <div
        className={`flex h-full flex-col ${
          isFullscreen
            ? ""
            : "overflow-hidden rounded-[28px] border border-white/10 bg-[#0b1220] shadow-[0_24px_60px_rgba(0,0,0,0.4)]"
        }`}
      >
        <div
          className={`flex items-center justify-between border-b border-white/10 bg-[linear-gradient(180deg,rgba(11,20,32,0.98),rgba(8,14,24,0.98))] ${
            isFullscreen ? "px-4 py-3" : "px-4 py-3"
          }`}
        >
          <div className="flex items-center gap-3">
            <ServiceLogo service={activeService} size="sm" />

            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-white">
                  {activeService?.name || "Route"}
                </p>
                <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-medium text-cyan-300">
                  Secure Flow
                </div>
              </div>

              <p className="mt-1 text-[11px] text-white/45">
                {fromAmount || "0"} {fromToken} → {toToken}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleFullscreen}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white"
              aria-label={
                isFullscreen ? "Exit fullscreen mode" : "Enter fullscreen mode"
              }
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/60 transition hover:bg-rose-500/10 hover:text-rose-300"
              aria-label="Close route"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="relative flex-1 bg-white">
          <AnimatePresence>
            {isRouteLoading && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 flex items-center justify-center bg-[#081017]"
              >
                <div className="px-6 text-center">
                  <motion.div
                    className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1.1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <ArrowRightLeft className="h-7 w-7 text-cyan-300" />
                  </motion.div>

                  <p className="text-base font-semibold text-white">
                    Preparing route...
                  </p>
                  <p className="mt-1 text-sm text-white/55">
                    Opening {fromAmount || "0"} {fromToken} → {toToken}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <iframe
            src={activeService?.url}
            title={activeService?.name || "Swap route"}
            className="h-full w-full border-0"
            allow="clipboard-write; clipboard-read"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
          />
        </div>

        {!isFullscreen && (
          <div className="border-t border-white/10 bg-[linear-gradient(180deg,rgba(10,18,28,0.98),rgba(8,14,22,0.98))] px-4 py-3">
            <div className="flex items-start gap-2">
              <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
              </div>

              <div>
                <p className="text-xs font-medium text-white">
                  Complete confirmation in the secure route
                </p>
                <p className="mt-1 text-[11px] leading-5 text-white/45">
                  Wallet connection and signing happen in the supported route
                  flow. Return to ZWAP after completion to refresh balances.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}