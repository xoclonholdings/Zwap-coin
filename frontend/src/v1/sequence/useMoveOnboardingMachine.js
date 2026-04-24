import { useEffect, useRef, useState } from "react";

const HOLD = 1400;
const NO_MOVE = 2600;
const STOPPED = 2500;
const LONG_IDLE = 7000;

export default function useMoveOnboardingMachine({
  totalSteps,
  onStartTracking,
}) {
  const [mode, setMode] = useState("voice-start");
  const [voice, setVoice] = useState("Tap to start.");
  const [showVoice, setShowVoice] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [showPlay, setShowPlay] = useState(false);

  const startStepsRef = useRef(0);
  const lastMoveRef = useRef(null);
  const movedOnceRef = useRef(false);

  // ---- START FLOW ----
  useEffect(() => {
    if (mode !== "voice-start") return;

    const t = setTimeout(() => {
      setShowVoice(false);
      setMode("ring-idle");
    }, HOLD);

    return () => clearTimeout(t);
  }, [mode]);

  const startTracking = () => {
    setIsTracking(true);
    setMode("voice-move");
    setVoice("Take a few steps.");
    setShowVoice(true);

    startStepsRef.current = totalSteps;
    lastMoveRef.current = Date.now();

    onStartTracking?.();

    setTimeout(() => {
      setShowVoice(false);
      setMode("waiting");
    }, HOLD);
  };

  // ---- MOVEMENT DETECTION ----
  useEffect(() => {
    if (!isTracking) return;

    const delta = totalSteps - startStepsRef.current;

    if (delta > 0) {
      lastMoveRef.current = Date.now();

      if (!movedOnceRef.current) {
        movedOnceRef.current = true;

        setMode("voice-success");
        setVoice("That’s it.");
        setShowVoice(true);

        setTimeout(() => {
          setShowVoice(false);
          setMode("active");
        }, HOLD);
      }
    }
  }, [totalSteps, isTracking]);

  // ---- NO MOVEMENT ----
  useEffect(() => {
    if (!isTracking || mode !== "waiting") return;

    const t = setTimeout(() => {
      setMode("voice-nudge");
      setVoice("Just a few steps.");
      setShowVoice(true);

      setTimeout(() => {
        setShowVoice(false);
        setMode("waiting");
      }, HOLD);
    }, NO_MOVE);

    return () => clearTimeout(t);
  }, [mode, isTracking]);

  // ---- STOPPED ----
  useEffect(() => {
    if (!isTracking || mode !== "active") return;

    const i = setInterval(() => {
      const idle = Date.now() - (lastMoveRef.current || Date.now());

      if (idle > STOPPED) {
        setMode("voice-continue");
        setVoice("Keep going.");
        setShowVoice(true);

        setTimeout(() => {
          setShowVoice(false);
          setMode("active");
        }, HOLD);
      }
    }, 800);

    return () => clearInterval(i);
  }, [mode, isTracking]);

  // ---- LONG IDLE → PLAY ----
  useEffect(() => {
    if (!isTracking) return;

    const t = setTimeout(() => {
      if (!movedOnceRef.current) {
        setShowPlay(true);
      }
    }, LONG_IDLE);

    return () => clearTimeout(t);
  }, [isTracking]);

  return {
    mode,
    voice,
    showVoice,
    isTracking,
    startTracking,
    showPlay,
  };
}