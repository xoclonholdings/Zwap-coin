import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Music2, X } from "lucide-react";

export default function StreamMediaModal({
  open,
  items = [],
  selectedItem,
  onSelectItem,
  onClose,
}) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="stream-library-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[240] flex items-end justify-center bg-black/70 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="relative max-h-[86vh] w-full max-w-[430px] overflow-hidden rounded-t-[28px] border border-purple-400/20 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.12),_rgba(10,11,30,0.98)_38%,_rgba(10,11,30,1)_100%)] text-white shadow-[0_20px_80px_rgba(0,0,0,0.55)]"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-400/40 to-transparent" />

          <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 pb-4 pt-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-400/25 bg-gradient-to-br from-purple-500/20 to-cyan-500/20">
                <Music2 className="h-5 w-5 text-purple-200" />
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-purple-200/75">
                  Stream Library
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">
                  Saved Playlists
                </h3>
                <p className="mt-1 text-sm text-gray-400">
                  Your saved Stream lanes will live here.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300 transition active:scale-[0.96]"
              aria-label="Close Stream Library"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[calc(86vh-96px)] overflow-y-auto px-5 py-5">
            {items.length > 0 ? (
              <div className="space-y-2">
                {items.map((item) => {
                  const active = selectedItem?.id === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelectItem?.(item);
                        onClose?.();
                      }}
                      className={[
                        "w-full rounded-2xl border px-3 py-3 text-left transition active:scale-[0.98]",
                        active
                          ? "border-cyan-300/30 bg-cyan-400/10"
                          : "border-white/10 bg-white/[0.035]",
                      ].join(" ")}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={[
                            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br",
                            item?.accent ||
                              "from-purple-500/20 via-cyan-500/10 to-blue-500/20",
                          ].join(" ")}
                        >
                          <Music2 className="h-5 w-5 text-white/80" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="line-clamp-1 text-sm font-black text-white">
                            {item.title}
                          </div>
                          <div className="mt-1 line-clamp-2 text-xs leading-4 text-white/50">
                            {item.description || item.subtitle}
                          </div>
                          <div className="mt-2 text-[10px] font-black uppercase tracking-[0.12em] text-cyan-300">
                            Open
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[22px] border border-white/10 bg-white/[0.035] px-4 py-6 text-center">
                <Music2 className="mx-auto h-7 w-7 text-purple-200/70" />
                <div className="mt-3 text-sm font-black text-white">
                  No saved Streams yet.
                </div>
                <p className="mx-auto mt-2 max-w-[26ch] text-xs leading-5 text-white/45">
                  Saved playlists, stations, and Stream sessions will appear here.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}