import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, Info } from "lucide-react";

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

export default function StatusPopup({ open, message, type = "info", onClose }) {
  const Icon = iconMap[type] || Info;

  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      onClose?.();
    }, 2200);

    return () => clearTimeout(timer);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="fixed top-20 left-1/2 z-[999] -translate-x-1/2"
        >
          <div
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-md ${
              type === "success"
                ? "border-green-400/30 bg-green-500/10 text-green-200"
                : type === "error"
                ? "border-red-400/30 bg-red-500/10 text-red-200"
                : "border-cyan-400/30 bg-cyan-500/10 text-cyan-200"
            }`}
          >
            <Icon className="h-5 w-5" />
            <p className="text-sm font-medium">{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}