import { useCallback, useEffect, useRef, useState } from "react";

import { MOVE_ONBOARDING_VOICE } from "./moveOnboardingScript";

const VOICE_HOLD_MS = 2600;
const COMPLETE_HOLD_MS = 1800;

const MOCK_START_DELAY_MS = 3200;
const MOCK_STEP_SEQUENCE = [1, 2, 3, 5, 7, 10];
const MOCK_STEP_INTERVAL_MS = 1100;

export default function useMoveOnboardingMachine({
  totalSteps,
  onStartTracking,
  onStopTracking,
}) {
  const [mode, setMode] = useState("voice-start");
  const [voice, setVoice] = useState(MOVE_ONBOARDING_VOICE.start1);
  const [showVoice, setShowVoice] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [moveVerified, setMoveVerified] = useState(false);
  const [mockSteps, setMockSteps] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const voiceTimerRef = useRef(null);
  const mockStartTimerRef = useRef(null);
  const mockStepTimerRef = useRef(null);
  const elapsedTimerRef = useRef(null);
  const completeTimerRef = useRef(null);
  const mockStepIndexRef = useRef(0);

  const clearTimer = (timerRef) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const clearIntervalTimer = (timerRef) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const clearMockTimers = useCallback(() => {
    clearTimer(mockStartTimerRef);
    clearTimer(mockStepTimerRef);
    clearIntervalTimer(elapsedTimerRef);
  }, []);

  const clearAllTimers = useCallback(() => {
    clearTimer(voiceTimerRef);
    clearTimer(mockStartTimerRef);
    clearTimer(mockStepTimerRef);
    clearIntervalTimer(elapsedTimerRef);
    clearTimer(completeTimerRef);
  }, []);

  const showVoiceThen = useCallback((lines, nextMode, holdMs = VOICE_HOLD_MS) => {
    clearTimer(voiceTimerRef);

    setVoice(lines);
    setShowVoice(true);

    voiceTimerRef.current = setTimeout(() => {
      setShowVoice(false);
      setMode(nextMode);
    }, holdMs);
  }, []);

  const completeMoveSession = useCallback(() => {
    clearMockTimers();
    clearTimer(completeTimerRef);

    setMockSteps(10);
    setMoveVerified(true);
    setIsTracking(false);
    setShowVoice(false);
    setMode("complete");

    onStopTracking?.();
  }, [clearMockTimers, onStopTracking]);

  const runMockStepSequence = useCallback(() => {
    mockStepIndexRef.current = 0;

    const advanceMockStep = () => {
      const nextStep = MOCK_STEP_SEQUENCE[mockStepIndexRef.current];

      if (typeof nextStep !== "number") {
        completeMoveSession();
        return;
      }

      setMockSteps(nextStep);
      mockStepIndexRef.current += 1;

      if (nextStep >= 10) {
        clearTimer(mockStepTimerRef);

        mockStepTimerRef.current = setTimeout(() => {
          completeMoveSession();
        }, MOCK_STEP_INTERVAL_MS);

        return;
      }

      clearTimer(mockStepTimerRef);

      mockStepTimerRef.current = setTimeout(
        advanceMockStep,
        MOCK_STEP_INTERVAL_MS
      );
    };

    advanceMockStep();
  }, [completeMoveSession]);

  const startTracking = useCallback(() => {
    if (isTracking) return;

    clearAllTimers();

    setIsTracking(true);
    setMoveVerified(false);
    setMockSteps(0);
    setElapsedSeconds(0);
    setMode("active");
    setShowVoice(false);

    mockStepIndexRef.current = 0;

    onStartTracking?.();

    elapsedTimerRef.current = setInterval(() => {
      setElapsedSeconds((currentSeconds) => currentSeconds + 1);
    }, 1000);

    mockStartTimerRef.current = setTimeout(() => {
      runMockStepSequence();
    }, MOCK_START_DELAY_MS);
  }, [isTracking, onStartTracking, clearAllTimers, runMockStepSequence]);

  const stopTracking = useCallback(() => {
    if (!isTracking) return;

    clearMockTimers();

    setIsTracking(false);
    setShowVoice(false);
    setMode("ring-idle");

    onStopTracking?.();
  }, [isTracking, clearMockTimers, onStopTracking]);

  useEffect(() => {
    if (mode !== "voice-start") return;

    showVoiceThen(MOVE_ONBOARDING_VOICE.start1, "voice-start-2");

    return () => clearTimer(voiceTimerRef);
  }, [mode, showVoiceThen]);

  useEffect(() => {
    if (mode !== "voice-start-2") return;

    showVoiceThen(MOVE_ONBOARDING_VOICE.start2, "voice-start-3");

    return () => clearTimer(voiceTimerRef);
  }, [mode, showVoiceThen]);

  useEffect(() => {
    if (mode !== "voice-start-3") return;

    showVoiceThen(MOVE_ONBOARDING_VOICE.start3, "voice-start-4");

    return () => clearTimer(voiceTimerRef);
  }, [mode, showVoiceThen]);

  useEffect(() => {
    if (mode !== "voice-start-4") return;

    showVoiceThen(MOVE_ONBOARDING_VOICE.start4, "ring-idle");

    return () => clearTimer(voiceTimerRef);
  }, [mode, showVoiceThen]);

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
    mockSteps,
    elapsedSeconds,
    startTracking,
    stopTracking,
  };
}