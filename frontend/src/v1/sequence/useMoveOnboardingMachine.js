import { useCallback, useEffect, useRef, useState } from "react";

import { MOVE_ONBOARDING_VOICE } from "./moveOnboardingScript";

const VOICE_HOLD_MS = 1600;
const REDIRECT_VOICE_HOLD_MS = 1900;

const FIRST_NO_MOVE_DELAY_MS = 6500;
const SECOND_NO_MOVE_DELAY_MS = 7000;
const PLAY_REDIRECT_DELAY_MS = 6500;
const STOPPED_MOVING_DELAY_MS = 4500;

export default function useMoveOnboardingMachine({
  totalSteps,
  onStartTracking,
}) {
  const [mode, setMode] = useState("voice-start");
  const [voice, setVoice] = useState(MOVE_ONBOARDING_VOICE.start);
  const [showVoice, setShowVoice] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [showPlay, setShowPlay] = useState(false);

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
    setShowPlay(false);

    voiceTimerRef.current = setTimeout(() => {
      setShowVoice(false);
      setMode(nextMode);
    }, holdMs);
  }, []);

  const startTracking = useCallback(() => {
    if (isTracking) return;

    clearAllTimers();

    setIsTracking(true);
    setShowPlay(false);
    setMode("voice-move");

    startStepsRef.current = Number(totalSteps || 0);
    movedOnceRef.current = false;
    idleNudgeCountRef.current = 0;

    onStartTracking?.();

    showVoiceThen(MOVE_ONBOARDING_VOICE.move, "waiting");
  }, [isTracking, totalSteps, onStartTracking, clearAllTimers, showVoiceThen]);

  useEffect(() => {
    if (mode !== "voice-start") return undefined;

    showVoiceThen(MOVE_ONBOARDING_VOICE.start, "ring-idle");

    return () => {
      clearTimer(voiceTimerRef);
    };
  }, [mode, showVoiceThen]);

  useEffect(() => {
    if (!isTracking) return;
    if (showVoice) return;

    const currentSteps = Number(totalSteps || 0);
    const startSteps = Number(startStepsRef.current || 0);
    const deltaSteps = currentSteps - startSteps;

    if (deltaSteps <= 0) return;

    clearTimer(idleTimerRef);
    clearTimer(stoppedTimerRef);
    setShowPlay(false);

    if (!movedOnceRef.current) {
      movedOnceRef.current = true;
      idleNudgeCountRef.current = 0;

      setMode("voice-success");
      showVoiceThen(MOVE_ONBOARDING_VOICE.success, "active");
      return;
    }

    if (mode === "active") {
      clearTimer(stoppedTimerRef);

      stoppedTimerRef.current = setTimeout(() => {
        if (!movedOnceRef.current) return;

        setMode("voice-continue");
        showVoiceThen(MOVE_ONBOARDING_VOICE.continue, "active");
      }, STOPPED_MOVING_DELAY_MS);
    }
  }, [totalSteps, isTracking, mode, showVoice, showVoiceThen]);

  useEffect(() => {
    if (!isTracking) return undefined;
    if (showVoice) return undefined;
    if (mode !== "waiting") return undefined;
    if (movedOnceRef.current) return undefined;

    clearTimer(idleTimerRef);

    let delay = FIRST_NO_MOVE_DELAY_MS;

    if (idleNudgeCountRef.current === 1) {
      delay = SECOND_NO_MOVE_DELAY_MS;
    }

    if (idleNudgeCountRef.current >= 2) {
      delay = PLAY_REDIRECT_DELAY_MS;
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

      setMode("voice-play-redirect");
      showVoiceThen(
        MOVE_ONBOARDING_VOICE.playRedirect,
        "play-offer",
        REDIRECT_VOICE_HOLD_MS
      );
    }, delay);

    return () => {
      clearTimer(idleTimerRef);
    };
  }, [isTracking, mode, showVoice, showVoiceThen]);

  useEffect(() => {
    if (mode !== "play-offer") return;

    setShowVoice(false);
    setShowPlay(true);
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
    startTracking,
    showPlay,
  };
}