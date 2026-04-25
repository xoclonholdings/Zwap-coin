import { motion } from "framer-motion";

export function PlayShell({ children }) {
  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.18),_rgba(8,10,22,0.96)_58%,_rgba(0,0,0,1)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(180,134,255,0.08),_transparent_35%,_rgba(34,211,238,0.08))]" />

      <div className="absolute left-1/2 top-1/2 h-[560px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-[42px] border border-cyan-300/10 bg-white/[0.025] shadow-[0_0_90px_rgba(34,211,238,0.22)]" />

      <div className="relative z-10 flex min-h-[560px] w-full max-w-[460px] flex-col items-center justify-center px-10 text-center">
        {children}
      </div>
    </div>
  );
}

export function PlayVoiceView({ text }) {
  return (
    <motion.div
      key={text}
      initial={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 1.03, filter: "blur(8px)" }}
      transition={{ duration: 0.65 }}
      className="whitespace-nowrap text-center text-4xl font-black tracking-[-0.05em] text-white"
    >
      {text}
    </motion.div>
  );
}

export function PlayRewardView({ amount = 50 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: 8, filter: "blur(8px)" }}
      transition={{ duration: 0.55 }}
      className="rounded-[28px] border border-cyan-300/15 bg-white/[0.06] px-8 py-6 text-center shadow-[0_0_42px_rgba(34,211,238,0.16)] backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.96 }}
        animate={{ scale: [0.96, 1.06, 1] }}
        transition={{ duration: 0.42 }}
        className="text-4xl font-black tracking-[-0.05em] text-cyan-300"
      >
        +{amount} zPts
      </motion.div>
    </motion.div>
  );
}

export function PlayMoveOfferView({ onTryMove, onLearnMore }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: 8, filter: "blur(8px)" }}
      transition={{ duration: 0.65 }}
      className="flex w-full flex-col items-center gap-5"
    >
      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={onTryMove}
        className="w-full rounded-2xl border border-cyan-300/45 bg-cyan-300/15 px-6 py-4 text-lg font-black text-cyan-100 shadow-[0_0_28px_rgba(34,211,238,0.16)]"
      >
        Move
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 0.75, y: 0 }}
        transition={{ duration: 0.4, delay: 0.18 }}
        className="text-sm font-bold text-white/55"
      >
        Or
      </motion.div>

      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.75 }}
        transition={{ duration: 0.4, delay: 0.32 }}
        className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-bold tracking-[0.08em] text-white/70"
        onClick={onLearnMore}
      >
        Learn More
      </motion.button>
    </motion.div>
  );
}

export function PlayGameStage({ children }) {
  return (
    <motion.div
      className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-black text-white"
      initial={{ opacity: 0, filter: "blur(8px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(8px)" }}
      transition={{ duration: 0.35 }}
    >
      <div className="relative h-full w-full max-w-[460px] overflow-hidden bg-black">
        {children}
      </div>
    </motion.div>
  );
}