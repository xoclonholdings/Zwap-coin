import { useCallback, useEffect, useRef, useState } from "react";

import { MOVE_ONBOARDING_VOICE } from "./moveOnboardingScript";

const VOICE_HOLD_MS = 1800;
const COMPLETE_HOLD_MS = 1400;

const FIRST_NO_MOVE_DELAY_MS = 9000;
const SECOND_NO_MOVE_DELAY_MS = 11000;
const FINAL_NO_MOVE_DELAY_MS = 14000;

const MOVED_COMPLETE_DELAY_MS = 2200;

export default function useMoveOnboardingMachine({
  totalSteps,
  onStartTracking,
}) {
  const [mode, setMode] = useState("voice-start");
  const [voice, setVoice] = useState(MOVE_ONBOARDING_VOICE.start);
  const [showVoice, setShowVoice] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [moveVerified, setMoveVerified] = useState(false);

  const startStepsRef = useRef(0);
  const movedOnceRef = useRef(false);
  const idleNudgeCountRef = useRef(0);

  const voiceTimerRef = useRef(null);
  const idleTimerRef = useRef(null);
  const completeTimerRef = useRef(null);

  const clearTimer = (timerRef) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const clearAllTimers = useCallback(() => {
    clearTimer(voiceTimerRef);
    clearTimer(idleTimerRef);
    clearTimer(completeTimerRef);
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

  const completeMoveSession = useCallback(
    ({ verified = false } = {}) => {
      clearAllTimers();

      setMoveVerified(Boolean(verified));
      setIsTracking(false);
      setShowVoice(false);
      setMode("complete");
    },
    [clearAllTimers]
  );

  const startTracking = useCallback(() => {
    if (isTracking) return;

    clearAllTimers();

    setIsTracking(true);
    setMoveVerified(false);
    setMode("voice-move");

    startStepsRef.current = Number(totalSteps || 0);
    movedOnceRef.current = false;
    idleNudgeCountRef.current = 0;

    onStartTracking?.();

    showVoiceThen(MOVE_ONBOARDING_VOICE.move, "waiting");
  }, [isTracking, totalSteps, onStartTracking, clearAllTimers, showVoiceThen]);

  useEffect(() => {
    if (mode !== "voice-start") return;

    showVoiceThen(MOVE_ONBOARDING_VOICE.start, "ring-idle");

    return () => clearTimer(voiceTimerRef);
  }, [mode, showVoiceThen]);

  useEffect(() => {
    if (!isTracking) return;
    if (showVoice) return;

    const currentSteps = Number(totalSteps || 0);
    const startSteps = Number(startStepsRef.current || 0);
    const deltaSteps = currentSteps - startSteps;

    if (deltaSteps <= 0) return;

    clearTimer(idleTimerRef);
    clearTimer(completeTimerRef);

    if (!movedOnceRef.current) {
      movedOnceRef.current = true;
      idleNudgeCountRef.current = 0;

      setMoveVerified(true);
      setMode("voice-success");

      showVoiceThen(MOVE_ONBOARDING_VOICE.success, "active");

      completeTimerRef.current = setTimeout(() => {
        completeMoveSession({ verified: true });
      }, VOICE_HOLD_MS + MOVED_COMPLETE_DELAY_MS);

      return;
    }
  }, [
    totalSteps,
    isTracking,
    showVoice,
    showVoiceThen,
    completeMoveSession,
  ]);

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
      delay = FINAL_NO_MOVE_DELAY_MS;
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

      completeMoveSession({ verified: false });
    }, delay);

    return () => clearTimer(idleTimerRef);
  }, [isTracking, mode, showVoice, showVoiceThen, completeMoveSession]);

  useEffect(() => {
    if (mode !== "complete") return;

    completeTimerRef.current = setTimeout(() => {
      setMode("done");
    }, COMPLETE_HOLD_MS);

    return () => clearTimer(completeTimerRef);
  }, [mode]);

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
    moveVerified,
    startTracking,
  };
}