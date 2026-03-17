import { motion } from "framer-motion";

export default function RewardPopup({ reward, onClose }) {
  if (!reward) return null;

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-[#0a0b1e] border border-cyan-500/30 rounded-xl p-6 text-center shadow-xl"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120 }}
      >
        <motion.h2
          className="text-xl font-bold text-cyan-400 mb-2"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.6 }}
        >
          +{reward.zwap || reward.rewards_earned} ZWAP
        </motion.h2>

        {reward.zpts_earned && (
          <p className="text-purple-400 text-sm">
            +{reward.zpts_earned} zPts
          </p>
        )}

        <p className="text-gray-400 text-xs mt-2">
          {reward.message}
        </p>
      </motion.div>
    </motion.div>
  );
}