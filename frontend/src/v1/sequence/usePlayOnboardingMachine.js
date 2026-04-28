import { useCallback, useEffect, useRef, useState } from "react";

const VOICE_HOLD_MS = 1600;
const REWARD_HOLD_MS = 1700;

export default function usePlayOnboardingMachine({ triedMove = false, onComplete }) {
  const [phase, setPhase] = useState("voice-start");
  const [voice, setVoice] = useState("Play a round.");
  const [showVoice, setShowVoice] = useState(true);

  const completedRef = useRef(false);
  const timerRef = useRef(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const completePlay = useCallback(
    ({ routeToMove = false } = {}) => {
      if (completedRef.current) return;

      completedRef.current = true;

      if (typeof onComplete === "function") {
        onComplete({
          triedPlay: true,
          displayedZpts: 50,
          shouldRouteToMove: routeToMove,
        });
      }
    },
    [onComplete]
  );

  useEffect(() => {
    clearTimer();

    if (phase === "voice-start") {
      setVoice("Play a round.");
      setShowVoice(true);

      timerRef.current = setTimeout(() => {
        setShowVoice(false);
        setPhase("game");
      }, VOICE_HOLD_MS);
    }

    if (phase === "reward") {
      setShowVoice(false);

      timerRef.current = setTimeout(() => {
        setVoice(triedMove ? "Nice." : "Now try Move.");
        setShowVoice(true);
        setPhase("voice-complete");
      }, REWARD_HOLD_MS);
    }

    if (phase === "voice-complete") {
      timerRef.current = setTimeout(() => {
        setShowVoice(false);

        if (triedMove) {
          completePlay({ routeToMove: false });
        } else {
          setPhase("move-offer");
        }
      }, VOICE_HOLD_MS);
    }

    return () => {
      clearTimer();
    };
  }, [phase, triedMove, completePlay]);

  const handleGameEnd = useCallback(() => {
    setShowVoice(false);
    setPhase("reward");
  }, []);

  const handleTryMove = useCallback(() => {
    completePlay({ routeToMove: true });
  }, [completePlay]);

  return {
    phase,
    voice,
    showVoice,
    handleGameEnd,
    handleTryMove,
  };
}
