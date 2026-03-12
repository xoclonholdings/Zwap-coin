import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRightLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useApp } from "@/App";

const API = (process.env.REACT_APP_BACKEND_URL || "").replace(/\/$/, "") + "/api";

// 1000 zPts => 1 ZWAP
const RATE = 1000;

export default function ConvertZPtsModal({ open, onClose, onConverted }) {
  const { walletAddress } = useApp();

  const [zptsAmount, setZptsAmount] = useState("");
  const [step, setStep] = useState("edit"); // edit | confirm | processing | done
  const [processingPct, setProcessingPct] = useState(0);
  const [saving, setSaving] = useState(false);

  const parsed = useMemo(() => {
    const n = Number(zptsAmount);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.floor(n));
  }, [zptsAmount]);

  const zwapOut = useMemo(() => Math.floor(parsed / RATE), [parsed]);
  const zptsSpent = useMemo(() => zwapOut * RATE, [zwapOut]);

  const canProceed =
    !!walletAddress &&
    parsed >= RATE &&
    zwapOut > 0 &&
    zptsSpent > 0;

  const reset = () => {
    setZptsAmount("");
    setStep("edit");
    setProcessingPct(0);
    setSaving(false);
  };

  const close = () => {
    reset();
    onClose?.();
  };

  const requestConvert = async () => {
    if (!walletAddress) {
      toast.error("Connect your wallet first.");
      return;
    }

    if (parsed < RATE) {
      toast.error(`Minimum conversion is ${RATE} zPts.`);
      return;
    }

    if (zwapOut <= 0) {
      toast.error("Enter at least 1000 zPts to receive 1 ZWAP.");
      return;
    }

    setSaving(true);
    setStep("processing");
    setProcessingPct(0);

    const t = setInterval(() => {
      setProcessingPct((p) => (p >= 92 ? p : p + Math.floor(Math.random() * 7) + 2));
    }, 120);

    try {
      const res = await fetch(`${API}/wallet/convert-zpts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          zpts_amount: zptsSpent,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = data?.detail || "Conversion failed";
        throw new Error(msg);
      }

      setProcessingPct(100);
      setStep("done");
      toast.success(`Converted ${zptsSpent} zPts → ${zwapOut} ZWAP`);

      onConverted?.(data);
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Conversion failed");
      setStep("confirm");
    } finally {
      clearInterval(t);
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm overflow-y-auto p-4">
      <div className="min-h-full flex items-start sm:items-center justify-center py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 14, scale: 0.98 }}
          className="w-full max-w-md max-h-[calc(100vh-3rem)] overflow-hidden rounded-2xl border border-cyan-900/40 bg-[#0a0b1e] text-white shadow-[0_0_60px_rgba(0,245,255,0.12)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-cyan-400" />
              <div>
                <div className="font-bold leading-tight">Convert zPts → ZWAP</div>
                <div className="text-[11px] text-gray-400">
                  Rate: {RATE.toLocaleString()} zPts = 1 ZWAP
                </div>
              </div>
            </div>

            <button
              onClick={close}
              className="p-2 rounded hover:bg-white/5 text-gray-300 hover:text-white"
              aria-label="Close conversion modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-10rem)]">
            {!walletAddress && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                Connect a wallet to convert points.
              </div>
            )}

            <AnimatePresence mode="wait">
              {step === "edit" && (
                <motion.div
                  key="edit"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Enter zPts to convert</label>
                    <Input
                      type="number"
                      min="0"
                      value={zptsAmount}
                      onChange={(e) => setZptsAmount(e.target.value)}
                      placeholder={`Minimum ${RATE}`}
                    />
                    <div className="text-[11px] text-gray-500">
                      We convert in chunks of {RATE.toLocaleString()} zPts.
                    </div>
                  </div>

                  <div className="rounded-xl border border-cyan-900/40 bg-black/30 p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">You spend</span>
                      <span className="font-semibold text-purple-300">
                        {zptsSpent.toLocaleString()} zPts
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-gray-400">You receive</span>
                      <span className="font-semibold text-cyan-300">
                        {zwapOut.toLocaleString()} ZWAP
                      </span>
                    </div>

                    {parsed > 0 && parsed < RATE && (
                      <div className="text-[11px] text-amber-300 mt-2">
                        Add {RATE - parsed} more zPts to reach the minimum.
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" className="text-gray-300" onClick={close}>
                      Cancel
                    </Button>
                    <Button
                      className="bg-cyan-600 hover:bg-cyan-700"
                      disabled={!canProceed}
                      onClick={() => setStep("confirm")}
                    >
                      Continue
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === "confirm" && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <div className="rounded-xl border border-purple-900/40 bg-purple-500/10 p-3 text-sm">
                    <div className="flex items-center gap-2 text-purple-200">
                      <Sparkles className="w-4 h-4" />
                      <span className="font-semibold">Confirm conversion</span>
                    </div>

                    <div className="text-gray-300 mt-2">
                      Spend{" "}
                      <span className="text-purple-200 font-semibold">
                        {zptsSpent.toLocaleString()} zPts
                      </span>{" "}
                      to receive{" "}
                      <span className="text-cyan-200 font-semibold">
                        {zwapOut.toLocaleString()} ZWAP
                      </span>
                      .
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      className="text-gray-300"
                      onClick={() => setStep("edit")}
                      disabled={saving}
                    >
                      Back
                    </Button>
                    <Button
                      className="bg-cyan-600 hover:bg-cyan-700"
                      onClick={requestConvert}
                      disabled={!canProceed || saving}
                    >
                      Convert Now
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === "processing" && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <div className="text-sm text-gray-300">
                    Converting{" "}
                    <span className="text-purple-200 font-semibold">
                      {zptsSpent.toLocaleString()} zPts
                    </span>{" "}
                    →
                    <span className="text-cyan-200 font-semibold">
                      {" "}
                      {zwapOut.toLocaleString()} ZWAP
                    </span>
                  </div>

                  <div className="w-full h-3 rounded-full bg-gray-800 overflow-hidden border border-gray-700">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
                      initial={{ width: "0%" }}
                      animate={{ width: `${processingPct}%` }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>

                  <div className="text-[11px] text-gray-500">
                    Updating balances and writing to the ledger…
                  </div>
                </motion.div>
              )}

              {step === "done" && (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <div className="rounded-xl border border-emerald-900/40 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                    Conversion complete ✅
                  </div>

                  <div className="flex justify-end">
                    <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={close}>
                      Done
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
