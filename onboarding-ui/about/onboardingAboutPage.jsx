import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const SEQUENCE_TIMINGS = {
  voice1: 2100,
  voice2: 2300,
  voice3: 1900,
  proof1: 2300,
  voice4: 1800,
  proof2: 2400,
  voice5: 2400,
  voice6: 2000,
  anchor: 2200,
};

const TRANSITION_GAP_MS = 220;

const SEQUENCES = [
  "voice1",
  "voice2",
  "voice3",
  "proof1",
  "voice4",
  "proof2",
  "voice5",
  "voice6",
  "anchor",
  "final",
];

function getSequenceDuration(sequence) {
  if (sequence === "final") return 0;
  return SEQUENCE_TIMINGS[sequence] ?? 2000;
}

function VoiceScreen({ lines }) {
  return (
    <motion.div
      className="flex min-h-screen w-full items-center justify-center px-7 text-center"
      initial={{ opacity: 0, filter: "blur(10px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(10px)" }}
      transition={{ duration: 0.38 }}
    >
      <div className="flex max-w-[320px] flex-col items-center justify-center gap-3">
        {lines.map((line) => (
          <div
            key={line}
            className="text-[1.45rem] font-medium leading-[1.18] tracking-[-0.03em] text-white/96"
          >
            {line}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function AccumulationProofScreen() {
  return (
    <motion.div
      className="flex min-h-screen w-full items-center justify-center px-7"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.34 }}
    >
      <div className="flex w-full max-w-[280px] flex-col items-center gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.34, delay: 0.12 }}
          className="flex w-full flex-col items-center gap-3"
        >
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.22 }}
            className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-[1.2rem] font-medium tracking-[-0.02em] text-white/92 shadow-[0_0_22px_rgba(255,255,255,0.04)]"
          >
            12 Steps ↑
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.28, delay: 0.38 }}
            className="rounded-full border border-cyan-400/20 bg-cyan-400/[0.08] px-5 py-3 text-[1.15rem] font-medium tracking-[-0.02em] text-cyan-300 shadow-[0_0_30px_rgba(34,211,238,0.16)]"
          >
            +3 zPts ↑
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.34, delay: 0.78 }}
          className="flex w-full flex-col items-center gap-3"
        >
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.88 }}
            className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-[1.2rem] font-medium tracking-[-0.02em] text-white/92 shadow-[0_0_22px_rgba(255,255,255,0.04)]"
          >
            Score: 240 ↑
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.28, delay: 1.04 }}
            className="rounded-full border border-cyan-400/20 bg-cyan-400/[0.08] px-5 py-3 text-[1.15rem] font-medium tracking-[-0.02em] text-cyan-300 shadow-[0_0_30px_rgba(34,211,238,0.16)]"
          >
            +4 zPts ↑
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function ShopProofScreen() {
  const cards = useMemo(
    () => [
      {
        label: "Gift Cards",
        className:
          "z-40 -rotate-[6deg] border-cyan-400/18 bg-[linear-gradient(180deg,rgba(18,40,56,0.88),rgba(10,22,32,0.96))] text-cyan-100/90 shadow-[0_0_30px_rgba(34,211,238,0.10)]",
      },
      {
        label: "eBooks",
        className:
          "z-30 rotate-[4deg] border-violet-400/18 bg-[linear-gradient(180deg,rgba(34,22,56,0.82),rgba(16,10,32,0.94))] text-white/90 shadow-[0_0_30px_rgba(168,85,247,0.10)]",
      },
      {
        label: "Merch",
        className:
          "z-20 -rotate-[2deg] border-white/10 bg-[linear-gradient(180deg,rgba(24,24,32,0.82),rgba(10,10,16,0.94))] text-white/82 shadow-[0_0_24px_rgba(255,255,255,0.05)]",
      },
      {
        label: "Wellness",
        className:
          "z-10 rotate-[7deg] border-emerald-400/18 bg-[linear-gradient(180deg,rgba(14,42,32,0.84),rgba(8,18,16,0.95))] text-emerald-100/90 shadow-[0_0_26px_rgba(16,185,129,0.10)]",
      },
    ],
    []
  );

  return (
    <motion.div
      className="flex min-h-screen w-full items-center justify-center px-7"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.34 }}
    >
      <div className="relative h-[310px] w-[250px]">
        {cards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.34, delay: 0.14 * index }}
            className={`absolute left-1/2 top-1/2 flex h-[92px] w-[205px] -translate-x-1/2 items-center justify-start rounded-[24px] border px-6 ${card.className}`}
            style={{
              marginTop: `${index * 34 - 80}px`,
            }}
          >
            <div className="text-[1.02rem] font-medium tracking-[-0.02em]">
              {card.label}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function FinalAnchorScreen() {
  return (
    <motion.div
      className="flex min-h-screen w-full items-center justify-center px-7 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.34 }}
    >
      <div className="flex flex-col items-center gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.28 }}
          className="text-[1.9rem] font-semibold leading-none tracking-[-0.04em] text-white"
        >
          Move.
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.28, delay: 0.24 }}
          className="text-[1.9rem] font-semibold leading-none tracking-[-0.04em] text-cyan-300"
        >
          Play.
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.5 }}
          className="text-[1.2rem] font-medium leading-none tracking-[-0.03em] text-white/88"
        >
          Earn Today.
        </motion.div>
      </div>
    </motion.div>
  );
}

function FinalButtonsScreen({ onMove, onPlay }) {
  return (
    <motion.div
      className="flex min-h-screen w-full items-center justify-center px-7"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.28 }}
    >
      <div className="flex w-full max-w-[320px] flex-col items-center gap-4">
        <div className="flex w-full items-center justify-center gap-4">
          <motion.button
            type="button"
            onClick={onMove}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24 }}
            whileTap={{ scale: 0.97 }}
            className="flex-1 rounded-[22px] border border-cyan-400/22 bg-cyan-400/[0.10] px-6 py-4 text-[1.05rem] font-semibold tracking-[-0.02em] text-cyan-200 shadow-[0_0_28px_rgba(34,211,238,0.12)]"
          >
            Move
          </motion.button>

          <motion.button
            type="button"
            onClick={onPlay}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, delay: 0.08 }}
            whileTap={{ scale: 0.97 }}
            className="flex-1 rounded-[22px] border border-violet-400/20 bg-violet-400/[0.10] px-6 py-4 text-[1.05rem] font-semibold tracking-[-0.02em] text-violet-200 shadow-[0_0_28px_rgba(168,85,247,0.10)]"
          >
            Play
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default function OnboardingAboutPage({
  onMove,
  onPlay,
  navigate,
  moveRoute = "/move",
  playRoute = "/play",
}) {
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const timeoutRef = useRef(null);

  const currentSequence = SEQUENCES[sequenceIndex];

  useEffect(() => {
    if (currentSequence === "final") return;

    const totalDuration = getSequenceDuration(currentSequence) + TRANSITION_GAP_MS;

    timeoutRef.current = setTimeout(() => {
      setSequenceIndex((prev) => {
        const next = prev + 1;
        return next >= SEQUENCES.length ? prev : next;
      });
    }, totalDuration);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [currentSequence]);

  const handleMove = () => {
    if (typeof onMove === "function") {
      onMove();
      return;
    }

    if (typeof navigate === "function") {
      navigate(moveRoute);
    }
  };

  const handlePlay = () => {
    if (typeof onPlay === "function") {
      onPlay();
      return;
    }

    if (typeof navigate === "function") {
      navigate(playRoute);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.07),transparent_58%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,10,14,0.40),rgba(0,0,0,0.82))]" />
      <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_center,rgba(255,255,255,0.7)_0.6px,transparent_0.7px)] [background-size:24px_24px]" />

      <div className="relative z-10 min-h-screen">
        <AnimatePresence mode="wait">
          {currentSequence === "voice1" && (
            <VoiceScreen
              key="voice1"
              lines={["ZWAP! turns simple actions into value."]}
            />
          )}

          {currentSequence === "voice2" && (
            <VoiceScreen
              key="voice2"
              lines={["It starts with you.", "ZWAP! keeps score."]}
            />
          )}

          {currentSequence === "voice3" && (
            <VoiceScreen
              key="voice3"
              lines={["It adds up…", "It all adds up."]}
            />
          )}

          {currentSequence === "proof1" && (
            <AccumulationProofScreen key="proof1" />
          )}

          {currentSequence === "voice4" && (
            <VoiceScreen
              key="voice4"
              lines={["You can spend what you earn."]}
            />
          )}

          {currentSequence === "proof2" && <ShopProofScreen key="proof2" />}

          {currentSequence === "voice5" && (
            <VoiceScreen
              key="voice5"
              lines={[
                "It’s really that simple.",
                "You value your time… and so should we.",
              ]}
            />
          )}

          {currentSequence === "voice6" && (
            <VoiceScreen
              key="voice6"
              lines={["You ready to start your journey?"]}
            />
          )}

          {currentSequence === "anchor" && <FinalAnchorScreen key="anchor" />}

          {currentSequence === "final" && (
            <FinalButtonsScreen
              key="final"
              onMove={handleMove}
              onPlay={handlePlay}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
