import { useCallback, useEffect, useRef, useState } from "react";

const VOICE_HOLD_MS = 1600;
const FIRST_NO_MOVE_DELAY_MS = 6000;
const REPEAT_NO_MOVE_DELAY_MS = 6500;
const STOPPED_MOVING_DELAY_MS = 4500;
const PLAY_OPTION_DELAY_MS = 18000;

export default function useMoveOnboardingMachine({ totalSteps, onStartTracking }) {
  const [mode, setMode] = useState("voice-start");
  const [voice, setVoice] = useState("Tap to start.");
  const [showVoice, setShowVoice] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [showPlay, setShowPlay] = useState(false);

  const startStepsRef = useRef(0);
  const lastMoveRef = useRef(null);
  const movedOnceRef = useRef(false);
  const nudgeCountRef = useRef(0);

  const voiceTimerRef = useRef(null);
  const idleTimerRef = useRef(null);
  const stoppedTimerRef = useRef(null);
  const playTimerRef = useRef(null);

  const clearTimer = (timerRef) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const clearAllTimers = useCallback(() => {
    clearTimer(voiceTimerRef);
    clearTimer(idleTimerRef);
    clearTimer(stoppedTimerRef);
    clearTimer(playTimerRef);
  }, []);

  const showVoiceThen = useCallback(
    (nextVoice, nextModeAfterVoice, holdMs = VOICE_HOLD_MS) => {
      clearTimer(voiceTimerRef);

      setVoice(nextVoice);
      setShowVoice(true);

      voiceTimerRef.current = setTimeout(() => {
        setShowVoice(false);
        setMode(nextModeAfterVoice);
      }, holdMs);
    },
    []
  );

  const armNoMovementTimer = useCallback(() => {
    clearTimer(idleTimerRef);

    const delay =
      nudgeCountRef.current === 0
        ? FIRST_NO_MOVE_DELAY_MS
        : REPEAT_NO_MOVE_DELAY_MS;

    idleTimerRef.current = setTimeout(() => {
      if (movedOnceRef.current) return;

      nudgeCountRef.current += 1;
      setMode("voice-nudge");
      showVoiceThen("Just a few steps.", "waiting");
    }, delay);
  }, [showVoiceThen]);

  const armStoppedMovingTimer = useCallback(() => {
    clearTimer(stoppedTimerRef);

    stoppedTimerRef.current = setTimeout(() => {
      if (!movedOnceRef.current) return;

      setMode("voice-continue");
      showVoiceThen("Keep going.", "active");

      lastMoveRef.current = Date.now();
    }, STOPPED_MOVING_DELAY_MS);
  }, [showVoiceThen]);

  const armPlayOptionTimer = useCallback(() => {
    clearTimer(playTimerRef);

    playTimerRef.current = setTimeout(() => {
      if (movedOnceRef.current) return;

      setShowPlay(true);
    }, PLAY_OPTION_DELAY_MS);
  }, []);

  useEffect(() => {
    if (mode !== "voice-start") return undefined;

    showVoiceThen("Tap to start.", "ring-idle");

    return () => {
      clearTimer(voiceTimerRef);
    };
  }, [mode, showVoiceThen]);

  const startTracking = useCallback(() => {
    if (isTracking) return;

    clearAllTimers();

    setIsTracking(true);
    setShowPlay(false);
    setMode("voice-move");

    startStepsRef.current = Number(totalSteps || 0);
    lastMoveRef.current = Date.now();
    movedOnceRef.current = false;
    nudgeCountRef.current = 0;

    if (typeof onStartTracking === "function") {
      onStartTracking();
    }

    showVoiceThen("Take a few steps.", "waiting");
    armPlayOptionTimer();
  }, [
    isTracking,
    totalSteps,
    onStartTracking,
    clearAllTimers,
    showVoiceThen,
    armPlayOptionTimer,
  ]);

  useEffect(() => {
    if (!isTracking) return undefined;
    if (mode !== "waiting") return undefined;
    if (movedOnceRef.current) return undefined;

    armNoMovementTimer();

    return () => {
      clearTimer(idleTimerRef);
    };
  }, [isTracking, mode, armNoMovementTimer]);

  useEffect(() => {
    if (!isTracking) return;

    const currentSteps = Number(totalSteps || 0);
    const startSteps = Number(startStepsRef.current || 0);
    const deltaSteps = currentSteps - startSteps;

    if (deltaSteps <= 0) return;

    lastMoveRef.current = Date.now();
    clearTimer(idleTimerRef);
    clearTimer(stoppedTimerRef);
    clearTimer(playTimerRef);
    setShowPlay(false);

    if (!movedOnceRef.current) {
      movedOnceRef.current = true;
      setMode("voice-success");
      showVoiceThen("That’s it.", "active");
      return;
    }

    if (mode === "active") {
      armStoppedMovingTimer();
    }
  }, [totalSteps, isTracking, mode, showVoiceThen, armStoppedMovingTimer]);

  useEffect(() => {
    if (!isTracking) return undefined;
    if (mode !== "active") return undefined;
    if (!movedOnceRef.current) return undefined;

    armStoppedMovingTimer();

    return () => {
      clearTimer(stoppedTimerRef);
    };
  }, [isTracking, mode, armStoppedMovingTimer]);

  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  return {
    mode,
    voice,
    showVoice,
    isTracking,
    startTracking,
    showPlay,
  };
}