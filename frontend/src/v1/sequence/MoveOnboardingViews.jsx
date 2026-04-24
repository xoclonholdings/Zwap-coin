import { motion } from "framer-motion";

export function VoiceView({ text }) {
  return (
    <motion.div
      key={text}
      initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -8, filter: "blur(8px)" }}
      transition={{ duration: 0.4 }}
      className="text-4xl font-black tracking-tight text-white text-center"
    >
      {text}
    </motion.div>
  );
}

export function CounterView({ steps, zpts }) {
  return (
    <div className="absolute top-[16%] left-1/2 -translate-x-1/2 w-full max-w-[320px] px-4">
      <div className="rounded-2xl bg-white/5 border border-cyan-300/20 p-4 backdrop-blur-md text-center">
        <div className="text-xl font-bold">{steps}</div>
        <div className="text-xs tracking-widest text-white/40">STEPS</div>

        <div className="mt-2 text-cyan-300 font-bold">+{zpts}</div>
        <div className="text-xs tracking-widest text-white/40">zPTS</div>
      </div>
    </div>
  );
}

export function RingView({ isTracking, onStart }) {
  return (
    <div className="flex items-center justify-center">
      <button
        onClick={onStart}
        className="h-[260px] w-[260px] rounded-full border border-cyan-400/30 bg-cyan-400/10 flex items-center justify-center"
      >
        <div className="text-sm tracking-[0.2em] uppercase">
          {isTracking ? "Active" : "Start"}
        </div>
      </button>
    </div>
  );
}