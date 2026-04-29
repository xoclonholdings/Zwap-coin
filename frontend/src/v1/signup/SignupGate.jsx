import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";

import {
  SignupGateShell,
  SignupGateVoiceView,
  SignupGateChoiceView,
  SignupGateExitView,
} from "./SignupGateViews";

const VOICE_DURATION_MS = 2600;
const RESPONSE_DURATION_MS = 1600;
const TRANSITION_GAP_MS = 240;

export default function SignupGate({
  moveStarted = false,
  playCompleted = false,
  onBeginAuth,
  onExitOnboarding,
}) {
  const [phase, setPhase] = useState("voice");
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (phase === "voice") {
      timeoutRef.current = setTimeout(() => {
        setPhase("choice");
      }, VOICE_DURATION_MS + TRANSITION_GAP_MS);
    }

    if (phase === "response_yes") {
      timeoutRef.current = setTimeout(() => {
        onBeginAuth?.();
      }, RESPONSE_DURATION_MS + TRANSITION_GAP_MS);
    }

    if (phase === "response_no") {
      timeoutRef.current = setTimeout(() => {
        setPhase("exit");
      }, RESPONSE_DURATION_MS + TRANSITION_GAP_MS);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [phase, onBeginAuth]);

  if (!moveStarted || !playCompleted) return null;

  return (
    <SignupGateShell>
      <AnimatePresence mode="wait">
        {phase === "voice" && (
          <SignupGateVoiceView
            key="voice"
            lines={["You earned 50 zPts.", "Would you like to keep earning?"]}
          />
        )}

        {phase === "choice" && (
          <SignupGateChoiceView
            key="choice"
            onKeepEarning={() => setPhase("response_yes")}
            onNotNow={() => setPhase("response_no")}
          />
        )}

        {phase === "response_yes" && (
          <SignupGateVoiceView key="yes" lines={["Let’s keep going."]} />
        )}

        {phase === "response_no" && (
          <SignupGateVoiceView key="no" lines={["No pressure."]} />
        )}

        {phase === "exit" && (
          <SignupGateExitView key="exit" onDone={onExitOnboarding} />
        )}
      </AnimatePresence>
    </SignupGateShell>
  );
}
