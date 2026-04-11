import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import StackzGame from "@/components/play/games/stackz/StackzGame";
import BreakerzGame from "@/components/play/games/breakerz/BreakerzGame";

const VOICE_ONE_DURATION_MS = 2200;
const REWARD_HOLD_MS = 1200;
const VOICE_TWO_DURATION_MS = 2200;
const VOICE_THREE_DURATION_MS = 1700;
const TRANSITION_GAP_MS = 220;

function VoiceScreen({ lines }) {
  return (
    <motion.div
      className="flex min-h-screen w-full items-center justify-center px-7 text-center"
      initial={{ opacity: 0, filter: "blur(10px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(10px)" }}
      transition={{ duration: 0.34 }}
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

function RewardOnlyScreen({ amount }) {
  return (
    <motion.div
      className="flex min-h-screen w-full items-center justify-center px-7"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.26 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{
          opacity: 1,
          scale: [0.96, 1.05, 1],
          boxShadow: [
            "0 0 0px rgba(34,211,238,0)",
            "0 0 28px rgba(34,211,238,0.22)",
            "0 0 18px rgba(34,211,238,0.12)",
          ],
        }}
        transition={{ duration: 0.36 }}
        className="rounded-[28px] border border-cyan-400/20 bg-cyan-400/[0.08] px-8 py-6 text-center"
      >
        <div className="text-[2rem] font-semibold tracking-[-0.04em] text-cyan-300">
          +{amount} zPts
        </div>
      </motion.div>
    </motion.div>
  );
}

function ChoiceScreen({ onKeepPlaying, onTryMove }) {
  return (
    <motion.div
      className="flex min-h-screen w-full items-center justify-center px-7"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.24 }}
    >
      <div className="flex w-full max-w-[330px] flex-col items-center gap-4">
        <motion.button
          type="button"
          onClick={onKeepPlaying}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          whileTap={{ scale: 0.97 }}
          className="w-full rounded-[22px] border border-cyan-400/22 bg-cyan-400/[0.10] px-6 py-4 text-[1.03rem] font-semibold tracking-[-0.02em] text-cyan-200 shadow-[0_0_28px_rgba(34,211,238,0.12)]"
        >
          Keep Playing
        </motion.button>

        <motion.button
          type="button"
          onClick={onTryMove}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.08 }}
          whileTap={{ scale: 0.97 }}
          className="w-full rounded-[22px] border border-violet-400/20 bg-violet-400/[0.10] px-6 py-4 text-[1.03rem] font-semibold tracking-[-0.02em] text-violet-200 shadow-[0_0_28px_rgba(168,85,247,0.10)]"
        >
          Try Move
        </motion.button>
      </div>
    </motion.div>
  );
}

function GameStage({ children }) {
  return (
    <motion.div
      className="min-h-screen w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.26 }}
    >
      {children}
    </motion.div>
  );
}

export default function PlayOnboardingSequence({
  onTryMove,
  onForceMove,
  onStackzComplete,
  onBreakerzComplete,
  stackzReward = 10,
  breakerzReward = 12,
  stackzLevel = 1,
  stackzRound = 1,
  breakerzLevel = 1,
  breakerzRound = 1,
  moveRoute = "/move",
  navigate,
}) {
  const [sequence, setSequence] = useState("voice-1");
  const [stackzMounted, setStackzMounted] = useState(false);
  const [breakerzMounted, setBreakerzMounted] = useState(false);

  const timeoutRef = useRef(null);
  const hasTriedMoveRef = useRef(false);

  const clearCurrentTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    clearCurrentTimer();

    if (sequence === "voice-1") {
      timeoutRef.current = setTimeout(() => {
        setSequence("stackz-ready");
      }, VOICE_ONE_DURATION_MS + TRANSITION_GAP_MS);
    }

    if (sequence === "stackz-reward") {
      timeoutRef.current = setTimeout(() => {
        setSequence("voice-2");
      }, REWARD_HOLD_MS + TRANSITION_GAP_MS);
    }

    if (sequence === "voice-2") {
      timeoutRef.current = setTimeout(() => {
        setSequence("choice");
      }, VOICE_TWO_DURATION_MS + TRANSITION_GAP_MS);
    }

    if (sequence === "breakerz-reward") {
      timeoutRef.current = setTimeout(() => {
        setSequence("voice-3");
      }, REWARD_HOLD_MS + TRANSITION_GAP_MS);
    }

    if (sequence === "voice-3") {
      timeoutRef.current = setTimeout(() => {
        handleForcedMove();
      }, VOICE_THREE_DURATION_MS + TRANSITION_GAP_MS);
    }

    return () => {
      clearCurrentTimer();
    };
  }, [sequence]);

  useEffect(() => {
    if (sequence === "stackz-ready") {
      setStackzMounted(true);
      setBreakerzMounted(false);
    }

    if (sequence === "breakerz-ready") {
      setBreakerzMounted(true);
      setStackzMounted(false);
    }
  }, [sequence]);

  const handleMoveRoute = () => {
    hasTriedMoveRef.current = true;

    if (typeof onTryMove === "function") {
      onTryMove();
      return;
    }

    if (typeof navigate === "function") {
      navigate(moveRoute);
    }
  };

  const handleForcedMove = () => {
    if (typeof onForceMove === "function") {
      onForceMove();
      return;
    }

    if (typeof onTryMove === "function") {
      onTryMove();
      return;
    }

    if (typeof navigate === "function") {
      navigate(moveRoute);
    }
  };

  const handleKeepPlaying = () => {
    setSequence("breakerz-ready");
  };

  const handleStackzGameEnd = (result) => {
    if (typeof onStackzComplete === "function") {
      onStackzComplete(result);
    }

    setStackzMounted(false);
    setSequence("stackz-reward");
  };

  const handleBreakerzGameEnd = (result) => {
    if (typeof onBreakerzComplete === "function") {
      onBreakerzComplete(result);
    }

    setBreakerzMounted(false);
    setSequence("breakerz-reward");
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.06),transparent_58%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,10,14,0.40),rgba(0,0,0,0.82))]" />

      <div className="relative z-10 min-h-screen">
        <AnimatePresence mode="wait">
          {sequence === "voice-1" && (
            <VoiceScreen
              key="voice-1"
              lines={["Play a round…", "ZWAP! keeps score."]}
            />
          )}

          {sequence === "stackz-ready" && (
            <GameStage key="stackz-ready">
              {stackzMounted ? (
                <StackzGame
                  isPlaying={true}
                  level={stackzLevel}
                  round={stackzRound}
                  onGameEnd={handleStackzGameEnd}
                />
              ) : null}
            </GameStage>
          )}

          {sequence === "stackz-reward" && (
            <RewardOnlyScreen key="stackz-reward" amount={stackzReward} />
          )}

          {sequence === "voice-2" && (
            <VoiceScreen
              key="voice-2"
              lines={["You just earned.", "Keep playing… or try Move."]}
            />
          )}

          {sequence === "choice" && (
            <ChoiceScreen
              key="choice"
              onKeepPlaying={handleKeepPlaying}
              onTryMove={handleMoveRoute}
            />
          )}

          {sequence === "breakerz-ready" && (
            <GameStage key="breakerz-ready">
              {breakerzMounted ? (
                <BreakerzGame
                  isPlaying={true}
                  level={breakerzLevel}
                  round={breakerzRound}
                  onGameEnd={handleBreakerzGameEnd}
                />
              ) : null}
            </GameStage>
          )}

          {sequence === "breakerz-reward" && (
            <RewardOnlyScreen key="breakerz-reward" amount={breakerzReward} />
          )}

          {sequence === "voice-3" && (
            <VoiceScreen
              key="voice-3"
              lines={["Nice.", "Now try Move."]}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
