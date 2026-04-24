import { motion } from "framer-motion";

function buildRingStyle(progressPercent = 0) {
  const safePercent = Math.min(Math.max(Number(progressPercent || 0), 0), 100);
  const degrees = safePercent * 3.6;

  return {
    background: `conic-gradient(
      from 180deg,
      rgba(34,211,238,1) 0deg,
      rgba(45,212,191,1) ${degrees * 0.65}deg,
      rgba(168,85,247,1) ${degrees}deg,
      rgba(255,255,255,0.08) ${degrees}deg,
      rgba(255,255,255,0.08) 360deg
    )`,
  };
}

export function VoiceView({ text }) {
  return (
    <motion.div
      key={text}
      initial={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 1.03, filter: "blur(8px)" }}
      transition={{ duration: 0.65 }}
      className="text-center text-4xl font-black tracking-[-0.05em] text-white"
    >
      {text}
    </motion.div>
  );
}

export function CounterView({ steps, zpts }) {
  return (
    <div className="absolute left-1/2 top-[12%] w-[316px] -translate-x-1/2">
      <motion.div
        initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: 8, filter: "blur(8px)" }}
        transition={{ duration: 0.5 }}
        className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-[28px] border border-cyan-300/15 bg-white/[0.06] px-5 py-5 text-center shadow-[0_0_42px_rgba(34,211,238,0.16)] backdrop-blur-md"
      >
        <div>
          <div className="text-xl font-black tracking-[-0.03em] text-white">
            {steps}
          </div>
          <div className="mt-1 text-[10px] font-bold tracking-[0.2em] text-white/45">
            STEPS
          </div>
        </div>

        <div className="h-10 w-px bg-white/15" />

        <div>
          <div className="text-xl font-black tracking-[-0.03em] text-cyan-300">
            +{zpts}
          </div>
          <div className="mt-1 text-[10px] font-bold tracking-[0.2em] text-white/45">
            zPTS
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function RingView({ isTracking, onStart, progressPercent = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, filter: "blur(10px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
      transition={{ duration: 0.55 }}
      className="relative"
    >
      <button
        type="button"
        onClick={onStart}
        className="group relative h-64 w-64 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
      >
        <div
          className="absolute inset-0 rounded-full p-[10px] transition-transform duration-200 group-active:scale-[0.98] shadow-[0_0_40px_rgba(34,211,238,0.14)]"
          style={buildRingStyle(progressPercent)}
        >
          <div className="flex h-full w-full items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),rgba(8,23,22,1)_55%)]">
            <div className="rounded-full bg-cyan-400/85 px-7 py-3 text-base font-semibold uppercase tracking-[0.18em] text-[#041214] shadow-[0_0_24px_rgba(34,211,238,0.35)]">
              {isTracking ? "Stop" : "Start"}
            </div>
          </div>
        </div>
      </button>

      {!isTracking && (
        <div className="pointer-events-none absolute left-1/2 top-full mt-5 -translate-x-1/2 whitespace-nowrap text-sm font-bold text-white/80">
          Tap Start
        </div>
      )}
    </motion.div>
  );
}

export function PlayButton({ onClick, onLearnMore }) {
  return (
    <div className="absolute left-1/2 top-1/2 flex w-full max-w-[320px] -translate-x-1/2 -translate-y-1/2 flex-col items-center">
      <motion.button
        type="button"
        onClick={onClick}
        initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.55 }}
        className="w-full rounded-2xl border border-purple-300/50 bg-purple-400/20 px-6 py-5 text-xl font-black text-purple-100 shadow-[0_0_40px_rgba(180,134,255,0.28)]"
      >
        Play
      </motion.button>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mt-5 text-sm font-bold text-white/55"
      >
        Or
      </motion.div>

      <motion.button
        type="button"
        onClick={onLearnMore}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.75 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="mt-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-bold tracking-[0.08em] text-white/70"
      >
        Learn More
      </motion.button>
    </div>
  );
}