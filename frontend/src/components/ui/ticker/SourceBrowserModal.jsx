import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Globe, X } from "lucide-react";

export default function SourceBrowserModal({ item, onClose }) {
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    if (item?.url) {
      setIframeLoaded(false);
    }
  }, [item]);

  if (!item?.url) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="flex h-full w-full flex-col">
          <div className="flex items-center justify-between border-b border-white/10 bg-[#0b1222]/95 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {item.sourceLabel || "Source"}
              </p>
              <p className="truncate text-xs text-gray-400">{item.text}</p>
            </div>

            <div className="ml-3 flex items-center gap-2">
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-gray-300 transition hover:bg-white/[0.08] hover:text-white"
                title="Open in new tab"
              >
                <ExternalLink className="h-4 w-4" />
              </a>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-gray-300 transition hover:bg-white/[0.08] hover:text-white"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="relative flex-1 bg-[#060b16]">
            {!iframeLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                  <Globe className="h-5 w-5 text-cyan-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Loading source...</p>
                  <p className="mt-1 text-xs text-gray-400">
                    Some sites block in-app embedding. Use the open button above if needed.
                  </p>
                </div>
              </div>
            )}

            <iframe
              src={item.url}
              title={item.text || item.sourceLabel || "Source"}
              className="h-full w-full border-0"
              onLoad={() => setIframeLoaded(true)}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
