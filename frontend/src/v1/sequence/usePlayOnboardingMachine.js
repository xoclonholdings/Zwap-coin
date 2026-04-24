import { useEffect, useRef, useState } from "react";

const HOLD = 1400;
const REWARD_HOLD = 1600;

export default function usePlayOnboardingMachine({
  onComplete,
  triedMove = false,
}) {
  const [phase, setPhase] = useState("voice-1");
  const [showVoice, setShowVoice] = useState(true);

  const completedRef = useRef(false);

  // ---- VOICE → GAME ----
  useEffect(() => {
    if (phase !== "voice-1") return;

    const t = setTimeout(() => {
      setShowVoice(false);
      setPhase("game");
    }, HOLD);

    return () => clearTimeout(t);
  }, [phase]);

  // ---- REWARD → FINAL VOICE ----
  useEffect(() => {
    if (phase !== "reward") return;

    const t = setTimeout(() => {
      setShowVoice(true);
      setPhase("voice-2");
    }, REWARD_HOLD);

    return () => clearTimeout(t);
  }, [phase]);

  // ---- FINAL VOICE → COMPLETE ----
  useEffect(() => {
    if (phase !== "voice-2") return;

    const t = setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true;

        onComplete?.({
          triedPlay: true,
          shouldRouteToMove: !triedMove,
        });
      }
    }, HOLD);

    return () => clearTimeout(t);
  }, [phase, onComplete, triedMove]);

  // ---- GAME END HANDLER ----
  const handleGameEnd = () => {
    setPhase("reward");
  };

  // ---- VOICE TEXT ----
  const voice =
    phase === "voice-1"
      ? "Play a round."
      : phase === "voice-2"
      ? triedMove
        ? "Nice."
        : "Now try Move."
      : "";

  return {
    phase,
    showVoice,
    voice,
    handleGameEnd,
  };
}