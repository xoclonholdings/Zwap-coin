import { useCallback, useEffect, useRef, useState } from "react";

import { PLAY_ONBOARDING_VOICE } from "./playOnboardingScript";

const VOICE_HOLD_MS = 1800;

export default function usePlayOnboardingMachine() {
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

    return () => {
      clearTimer();
    };
  }, [phase, clearTimer]);

  const handleGameEnd = useCallback(() => {
    if (completedRef.current) return;

    completedRef.current = true;
    setShowVoice(false);
    setPhase("complete");
  }, []);

  return {
    phase,
    voice,
    showVoice,
    handleGameEnd,
  };
}