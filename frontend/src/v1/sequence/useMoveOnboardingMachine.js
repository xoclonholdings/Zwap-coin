import { useCallback, useEffect, useRef, useState } from "react";

import { MOVE_ONBOARDING_VOICE } from "./moveOnboardingScript";

const VOICE_HOLD_MS = 1800;

// ⏳ Slower pacing (more human reaction time)
const FIRST_NO_MOVE_DELAY_MS = 9000;
const SECOND_NO_MOVE_DELAY_MS = 11000;
const THIRD_NO_MOVE_DELAY_MS = 14000;

const STOPPED_MOVING_DELAY_MS = 6000;

export default function useMoveOnboardingMachine({
  totalSteps,
  onStartTracking,
}) {
  const [mode, setMode] = useState("voice-start");
  const [voice, setVoice] = useState(MOVE_ONBOARDING_VOICE.start);
  const [showVoice, setShowVoice] = useState(true);
  const [isTracking, setIsTracking] = useState(false);

  const startStepsRef = useRef(0);
  const movedOnceRef = useRef(false);
  const idleNudgeCountRef = useRef(0);

  const voiceTimerRef = useRef(null);
  const idleTimerRef = useRef(null);
  const stoppedTimerRef = useRef(null);

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
  }, []);

  const showVoiceThen = useCallback((line, nextMode, holdMs = VOICE_HOLD_MS) => {
    clearTimer(voiceTimerRef);

    setVoice(line);
    setShowVoice(true);

    voiceTimerRef.current = setTimeout(() => {
      setShowVoice(false);
      setMode(nextMode);
    }, holdMs);
  }, []);

  const startTracking = useCallback(() => {
    if (isTracking) return;

    clearAllTimers();

    setIsTracking(true);
    setMode("voice-move");

    startStepsRef.current = Number(totalSteps || 0);
    movedOnceRef.current = false;
    idleNudgeCountRef.current = 0;

    onStartTracking?.();

    showVoiceThen(MOVE_ONBOARDING_VOICE.move, "waiting");
  }, [isTracking, totalSteps, onStartTracking, clearAllTimers, showVoiceThen]);

  // Initial intro
  useEffect(() => {
    if (mode !== "voice-start") return;

    showVoiceThen(MOVE_ONBOARDING_VOICE.start, "ring-idle");

    return () => clearTimer(voiceTimerRef);
  }, [mode, showVoiceThen]);

  // Movement detection
  useEffect(() => {
    if (!isTracking || showVoice) return;

    const currentSteps = Number(totalSteps || 0);
    const startSteps = Number(startStepsRef.current || 0);
    const deltaSteps = currentSteps - startSteps;

    if (deltaSteps <= 0) return;

    clearTimer(idleTimerRef);
    clearTimer(stoppedTimerRef);

    if (!movedOnceRef.current) {
      movedOnceRef.current = true;
      idleNudgeCountRef.current = 0;

      setMode("voice-success");
      showVoiceThen(MOVE_ONBOARDING_VOICE.success, "active");
      return;
    }

    if (mode === "active") {
      stoppedTimerRef.current = setTimeout(() => {
        if (!movedOnceRef.current) return;

        setMode("voice-continue");
        showVoiceThen(MOVE_ONBOARDING_VOICE.continue, "active");
      }, STOPPED_MOVING_DELAY_MS);
    }
  }, [totalSteps, isTracking, mode, showVoice, showVoiceThen]);

  // Idle nudges (NO REDIRECTS)
  useEffect(() => {
    if (!isTracking) return;
    if (showVoice) return;
    if (mode !== "waiting") return;
    if (movedOnceRef.current) return;

    clearTimer(idleTimerRef);

    let delay = FIRST_NO_MOVE_DELAY_MS;

    if (idleNudgeCountRef.current === 1) {
      delay = SECOND_NO_MOVE_DELAY_MS;
    }

    if (idleNudgeCountRef.current >= 2) {
      delay = THIRD_NO_MOVE_DELAY_MS;
    }

    idleTimerRef.current = setTimeout(() => {
      if (movedOnceRef.current) return;

      idleNudgeCountRef.current += 1;

      if (idleNudgeCountRef.current === 1) {
        setMode("voice-nudge");
        showVoiceThen(MOVE_ONBOARDING_VOICE.nudgeFirst, "waiting");
        return;
      }

      if (idleNudgeCountRef.current === 2) {
        setMode("voice-nudge");
        showVoiceThen(MOVE_ONBOARDING_VOICE.nudgeSecond, "waiting");
        return;
      }

      // After multiple nudges → stay idle, no redirect
      setMode("waiting");
    }, delay);

    return () => clearTimer(idleTimerRef);
  }, [isTracking, mode, showVoice, showVoiceThen]);

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
  };
}