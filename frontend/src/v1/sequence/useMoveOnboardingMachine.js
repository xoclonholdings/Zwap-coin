import { useEffect, useRef, useState } from "react";

const NO_MOVEMENT_DELAY = 2800;
const IDLE_NUDGE_DELAY = 4200;
const STOPPED_DELAY = 2500;

export default function useMoveOnboardingMachine({
  totalSteps,
  onStartTracking,
  onStopTracking,
}) {
  const [mode, setMode] = useState("voice-start"); 
  // voice-start → ring-idle → voice-move → waiting → active → voice-encourage → etc.

  const [voice, setVoice] = useState("Tap to start.");
  const [showVoice, setShowVoice] = useState(true);
  const [isTracking, setIsTracking] = useState(false);

  const lastStepsRef = useRef(0);
  const lastMoveTimeRef = useRef(null);

  const clearVoice = (delay = 600) => {
    setTimeout(() => setShowVoice(false), delay);
  };

  // ---------- START FLOW ----------
  useEffect(() => {
    if (mode !== "voice-start") return;

    const t = setTimeout(() => {
      setShowVoice(false);
      setMode("ring-idle");
    }, 1400);

    return () => clearTimeout(t);
  }, [mode]);

  // ---------- START TRACKING ----------
  const startTracking = () => {
    setIsTracking(true);
    setMode("voice-move");
    setVoice("Take a few steps.");
    setShowVoice(true);

    onStartTracking?.();

    setTimeout(() => {
      setShowVoice(false);
      setMode("waiting");
      lastMoveTimeRef.current = Date.now();
    }, 1400);
  };

  // ---------- STEP DETECTION ----------
  useEffect(() => {
    if (!isTracking) return;

    const delta = totalSteps - lastStepsRef.current;

    if (delta > 0) {
      lastStepsRef.current = totalSteps;
      lastMoveTimeRef.current = Date.now();

      // FIRST MOVEMENT
      if (mode !== "active") {
        setMode("voice-success");
        setVoice("That’s it.");
        setShowVoice(true);

        setTimeout(() => {
          setShowVoice(false);
          setMode("active");
        }, 1400);
      }
    }
  }, [totalSteps, isTracking, mode]);

  // ---------- NO MOVEMENT ----------
  useEffect(() => {
    if (!isTracking || mode !== "waiting") return;

    const t = setTimeout(() => {
      setMode("voice-nudge");
      setVoice("Just a few steps.");
      setShowVoice(true);

      setTimeout(() => {
        setShowVoice(false);
        setMode("waiting");
      }, 1400);
    }, NO_MOVEMENT_DELAY);

    return () => clearTimeout(t);
  }, [mode, isTracking]);

  // ---------- STOPPED MOVING ----------
  useEffect(() => {
    if (!isTracking || mode !== "active") return;

    const interval = setInterval(() => {
      const lastMove = lastMoveTimeRef.current;
      if (!lastMove) return;

      const idleTime = Date.now() - lastMove;

      if (idleTime > STOPPED_DELAY) {
        setMode("voice-continue");
        setVoice("Keep going.");
        setShowVoice(true);

        setTimeout(() => {
          setShowVoice(false);
          setMode("active");
        }, 1400);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [mode, isTracking]);

  return {
    mode,
    voice,
    showVoice,
    isTracking,
    startTracking,
  };
}