import { useCallback, useEffect, useRef, useState } from "react";

import { PLAY_ONBOARDING_VOICE } from "./playOnboardingScript";

const VOICE_HOLD_MS = 1600;
const REWARD_HOLD_MS = 1700;

export default function usePlayOnboardingMachine({
  triedMove = false,
  onComplete,
}) {
  const [phase, setPhase] = useState("voice-start");
  const [voice, setVoice] = useState(PLAY_ONBOARDING_VOICE.start);
  const [showVoice, setShowVoice] = useState(true);

  const completedRef = useRef(false);
  const timerRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const completePlay = useCallback(
    ({ shouldRouteToMove = false } = {}) => {
      if (completedRef.current) return;

      completedRef.current = true;

      onComplete?.({
        triedPlay: true,
        displayedZpts: 50,
        shouldRouteToMove,
      });
    },
    [onComplete]
  );

  useEffect(() => {
    clearTimer();

    if (phase === "voice-start") {
      setVoice(PLAY_ONBOARDING_VOICE.start);
      setShowVoice(true);

      timerRef.current = setTimeout(() => {
        setShowVoice(false);
        setPhase("game");
      }, VOICE_HOLD_MS);
    }

    if (phase === "reward") {
      setShowVoice(false);

      timerRef.current = setTimeout(() => {
        setVoice(
          triedMove
            ? PLAY_ONBOARDING_VOICE.success
            : PLAY_ONBOARDING_VOICE.tryMove
        );
        setShowVoice(true);
        setPhase("voice-complete");
      }, REWARD_HOLD_MS);
    }

    if (phase === "voice-complete") {
      timerRef.current = setTimeout(() => {
        setShowVoice(false);

        if (triedMove) {
          completePlay({ shouldRouteToMove: false });
          return;
        }

        setPhase("move-offer");
      }, VOICE_HOLD_MS);
    }

    return () => {
      clearTimer();
    };
  }, [phase, triedMove, completePlay, clearTimer]);

  const handleGameEnd = useCallback(() => {
    if (completedRef.current) return;

    setShowVoice(false);
    setPhase("reward");
  }, []);

  const handleTryMove = useCallback(() => {
    completePlay({ shouldRouteToMove: true });
  }, [completePlay]);

  return {
    phase,
    voice,
    showVoice,
    handleGameEnd,
    handleTryMove,
  };
}