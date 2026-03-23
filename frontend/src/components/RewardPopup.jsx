import React from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function RewardPopup({
  open,
  amount = 0,
  currency = "zPts", // "zPts" | "ZWAP"
  title = "Reward Earned",
  message = "",
  onClose,
  autoClose = true,
  autoCloseMs = 2200,
}) {
  React.useEffect(() => {
    if (!open || !autoClose || !onClose) return;

    const timer = setTimeout(() => {
      onClose();
    }, autoCloseMs);

    return () => clearTimeout(timer);
  }, [open, autoClose, autoCloseMs, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ duration: 0.22 }}
          style={styles.overlay}
        >
          <motion.div
            initial={{ rotateX: 12 }}
            animate={{ rotateX: 0 }}
            transition={{ duration: 0.25 }}
            style={styles.card}
          >
            <div style={styles.headerRow}>
              <div>
                <div style={styles.title}>{title}</div>
                {message ? <div style={styles.message}>{message}</div> : null}
              </div>

              <button onClick={onClose} style={styles.closeBtn} aria-label="Close reward popup">
                ×
              </button>
            </div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.05, type: "spring", stiffness: 320, damping: 18 }}
              style={styles.rewardValue}
            >
              +{amount} {currency}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    right: 16,
    top: 16,
    zIndex: 9999,
    display: "flex",
    justifyContent: "flex-end",
    pointerEvents: "none",
  },
  card: {
    minWidth: 280,
    maxWidth: 360,
    background: "rgba(20,20,26,0.96)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 18,
    padding: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
    pointerEvents: "auto",
    backdropFilter: "blur(10px)",
  },
  headerRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: 700,
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    opacity: 0.8,
    lineHeight: 1.4,
  },
  rewardValue: {
    marginTop: 16,
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: "-0.02em",
  },
  closeBtn: {
    background: "transparent",
    color: "#fff",
    border: "none",
    fontSize: 22,
    cursor: "pointer",
    lineHeight: 1,
    opacity: 0.8,
  },
};