import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/App";
import SourceBrowserModal from "@/components/ui/ticker/SourceBrowserModal";
import TickerPreferences from "@/components/ui/ticker/TickerPreferences";
import useTickerPreferences from "@/hooks/useTickerPreferences";
import useTickerFeed from "@/hooks/useTickerFeed";
import {
  CTA_META,
  FADE_MS,
  ROTATION_MS,
  TICKER_META,
} from "@/lib/ticker/constants";
import { pickNextTickerIndex } from "@/lib/ticker/utils";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function NewsTicker() {
  const { walletAddress } = useApp();
  const {
    preferences,
    enabledCategories,
    toggleCategory,
  } = useTickerPreferences();
  const { items } = useTickerFeed(enabledCategories);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [sourceItem, setSourceItem] = useState(null);
  const [assistLoading, setAssistLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);
  const historyRef = useRef([]);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  useEffect(() => {
    setCurrentIndex(0);
    setHistory([]);
    setIsVisible(true);
  }, [items.length]);

  useEffect(() => {
    if (!items.length) return undefined;

    intervalRef.current = setInterval(() => {
      setIsVisible(false);

      timeoutRef.current = setTimeout(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = pickNextTickerIndex(
            items,
            prevIndex,
            historyRef.current
          );
          const nextItem = items[nextIndex];

          if (nextItem) {
            setHistory((prevHistory) => [
              ...prevHistory.slice(-9),
              { id: nextItem.id, category: nextItem.category },
            ]);
          }

          return nextIndex;
        });

        setIsVisible(true);
      }, FADE_MS);
    }, ROTATION_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [items]);

  const current = useMemo(() => items[currentIndex] || null, [items, currentIndex]);

  const meta = TICKER_META[current?.category] || TICKER_META.SYSTEM;
  const isClickable = Boolean(current?.clickable && current?.url);
  const hasAssist = current?.cta?.type === "assist";

  const handleOpenSource = () => {
    if (!isClickable) return;
    setSourceItem(current);
  };

  const handleAdvanceTicker = () => {
    if (!current) return;

    setHistory((prevHistory) => [
      ...prevHistory.slice(-9),
      { id: current.id, category: current.category },
    ]);

    setIsVisible(false);

    timeoutRef.current = setTimeout(() => {
      const nextIndex = pickNextTickerIndex(
        items,
        currentIndex,
        historyRef.current
      );
      setCurrentIndex(nextIndex);
      setIsVisible(true);
    }, FADE_MS);
  };

  const handleAssist = async () => {
    const payload = current?.cta?.payload;
    if (!walletAddress || !payload || assistLoading) return;

    const recipientWallet = payload.recipient_wallet;
    const amount = Number(payload.amount_zpts || 10);
    const message =
      payload.message || "Someone just gave you a boost. Keep going.";

    if (!recipientWallet) {
      console.error("Assist payload missing recipient_wallet");
      return;
    }

    setAssistLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/users/assist/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender_wallet: walletAddress,
          recipient_wallet: recipientWallet,
          amount,
          message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Assist request failed");
      }

      handleAdvanceTicker();
    } catch (error) {
      console.error("Failed to send assist:", error);
    } finally {
      setAssistLoading(false);
    }
  };

  if (!current) return null;

  return (
    <>
      <div className="relative z-30">
        <div className="mx-auto w-full max-w-[1680px] px-3 py-2 xl:px-6 2xl:px-8">
          <div className="mx-auto max-w-lg xl:max-w-[900px] 2xl:max-w-[980px]">
            <div className="relative overflow-hidden rounded-2xl border border-cyan-500/15 bg-[#0b1222]/95 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <div className="flex items-center gap-3 px-3 py-2.5">
                <span
                  className={`hidden shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold tracking-[0.18em] sm:inline-flex ${meta.chipClass}`}
                >
                  {meta.chip}
                </span>

                <div className="min-w-0 flex-1 overflow-hidden">
                  <AnimatePresence mode="wait">
                    {isVisible && (
                      <motion.div
                        key={`${currentIndex}-${current.id}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <motion.p
                          className="whitespace-nowrap text-[13px] text-gray-100"
                          title={current.text || ""}
                          initial={{ x: "100%" }}
                          animate={{ x: "-100%" }}
                          transition={{ duration: 12, ease: "linear" }}
                        >
                          {current.text || ""}
                        </motion.p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {hasAssist ? (
                  <button
                    type="button"
                    onClick={handleAssist}
                    disabled={assistLoading}
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition ${
                      assistLoading
                        ? "border-white/10 bg-white/[0.03] text-gray-500"
                        : "border-fuchsia-400/20 bg-fuchsia-500/15 text-fuchsia-200 hover:bg-fuchsia-500/20 hover:text-white"
                    }`}
                  >
                    {assistLoading ? "Sending..." : CTA_META.assist.label}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleOpenSource}
                    disabled={!isClickable}
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition ${
                      isClickable
                        ? "border-white/10 bg-white/[0.05] text-gray-200 hover:bg-white/[0.10] hover:text-white"
                        : "border-white/5 bg-white/[0.03] text-gray-500"
                    }`}
                  >
                    {isClickable
                      ? CTA_META.source.label
                      : current.sourceLabel || "ZWAP"}
                  </button>
                )}

                <TickerPreferences
                  preferences={preferences}
                  toggleCategory={toggleCategory}
                />
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
                <motion.div
                  key={`${currentIndex}-${current.id}-progress`}
                  className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-500"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: ROTATION_MS / 1000, ease: "linear" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <SourceBrowserModal
        item={sourceItem}
        onClose={() => setSourceItem(null)}
      />
    </>
  );
}