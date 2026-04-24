import { motion } from "framer-motion";

export function VoiceView({ text }) {
  return (
    <motion.div
      key={text}
      initial={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 1.03, filter: "blur(8px)" }}
      transition={{ duration: 0.65 }}
      className="whitespace-nowrap text-4xl font-black tracking-[-0.05em] text-white"
    >
      {text}
    </motion.div>
  );
}

export function CounterView({ steps, zpts }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: 8, filter: "blur(8px)" }}
      transition={{ duration: 0.5 }}
      className="absolute left-1/2 top-[13%] w-full max-w-[340px] -translate-x-1/2 px-4"
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-[28px] border border-cyan-300/15 bg-white/[0.06] px-5 py-5 text-center shadow-[0_0_42px_rgba(34,211,238,0.16)] backdrop-blur-md">
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
      </div>
    </motion.div>
  );
}

export function RingView({ isTracking, onStart }) {
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
        className="group relative h-[270px] w-[270px] rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
      >
        <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_180deg,_rgba(34,211,238,1)_0deg,_rgba(45,212,191,1)_120deg,_rgba(168,85,247,1)_260deg,_rgba(255,255,255,0.08)_260deg,_rgba(255,255,255,0.08)_360deg)] p-[10px] shadow-[0_0_58px_rgba(34,211,238,0.22)] transition-transform duration-200 group-active:scale-[0.98]">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),rgba(8,23,22,1)_58%)]">
            <div
              className={`rounded-full px-8 py-3 text-sm font-black uppercase tracking-[0.22em] shadow-[0_0_28px_rgba(34,211,238,0.42)] ${
                isTracking
                  ? "bg-red-500/90 text-white"
                  : "bg-cyan-300 text-[#041214]"
              }`}
            >
              {isTracking ? "Active" : "Start"}
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

export function PlayButton({ onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.55 }}
      className="absolute bottom-[10%] left-1/2 w-[260px] -translate-x-1/2"
    >
      <button
        type="button"
        onClick={onClick}
        className="w-full rounded-2xl border border-purple-300/45 bg-purple-400/15 px-6 py-4 text-lg font-black text-purple-100 shadow-[0_0_28px_rgba(180,134,255,0.16)]"
      >
        Play
      </button>
    </motion.div>
  );
}