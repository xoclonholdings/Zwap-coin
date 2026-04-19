import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLogin, usePrivy } from "@privy-io/react-auth";

const VOICE_DURATION_MS = 2600;
const TRANSITION_GAP_MS = 220;
const DISMISS_HELPER_DELAY_MS = 1800;

function VoiceScreen({ lines }) {
  return (
    <motion.div
      className="flex min-h-screen w-full items-center justify-center px-7 text-center"
      initial={{ opacity: 0, filter: "blur(10px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(10px)" }}
      transition={{ duration: 0.32 }}
    >
      <div className="flex max-w-[320px] flex-col items-center justify-center gap-3">
        {lines.map((line) => (
          <div
            key={line}
            className="text-[1.45rem] font-medium leading-[1.18] tracking-[-0.03em] text-white/96"
          >
            {line}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function ActionScreen({
  onContinue,
  isLaunchingAuth,
  helperText,
  errorText,
  canInteract,
}) {
  return (
    <motion.div
      className="flex min-h-screen w-full items-center justify-center px-7"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.24 }}
    >
      <div className="flex w-full max-w-[330px] flex-col items-center gap-4">
        <motion.button
          type="button"
          onClick={onContinue}
          disabled={!canInteract}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          whileTap={{ scale: canInteract ? 0.97 : 1 }}
          className={`w-full rounded-[22px] border px-6 py-4 text-[1.03rem] font-semibold tracking-[-0.02em] shadow-[0_0_28px_rgba(34,211,238,0.12)] transition ${
            canInteract
              ? "border-cyan-400/22 bg-cyan-400/[0.10] text-cyan-200"
              : "border-cyan-400/12 bg-cyan-400/[0.05] text-cyan-200/55"
          }`}
        >
          {isLaunchingAuth ? "Opening..." : "Continue with Email"}
        </motion.button>

        <AnimatePresence mode="wait">
          {helperText ? (
            <motion.div
              key={`helper-${helperText}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 0.72, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.2 }}
              className="text-sm font-medium tracking-[-0.02em] text-white/72"
            >
              {helperText}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {errorText ? (
            <motion.div
              key={`error-${errorText}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 0.82, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.2 }}
              className="text-sm font-medium tracking-[-0.02em] text-pink-200/85"
            >
              {errorText}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function SignupOnboarding({
  onAuthSuccess,
  dashboardRoute = "/dashboard",
  navigate,
}) {
  const { ready, authenticated } = usePrivy();

  const [phase, setPhase] = useState("voice");
  const [authState, setAuthState] = useState("idle");
  const [helperText, setHelperText] = useState("");
  const [errorText, setErrorText] = useState("");

  const voiceTimerRef = useRef(null);
  const dismissTimerRef = useRef(null);
  const authRequestedRef = useRef(false);

  const clearTimer = (ref) => {
    if (ref.current) {
      clearTimeout(ref.current);
      ref.current = null;
    }
  };

  const routeToDashboard = () => {
    if (typeof onAuthSuccess === "function") {
      onAuthSuccess();
      return;
    }

    if (typeof navigate === "function") {
      navigate(dashboardRoute);
    }
  };

  const { login } = useLogin({
    onComplete: () => {
      clearTimer(dismissTimerRef);
      setAuthState("success");
      setHelperText("");
      setErrorText("");
      routeToDashboard();
    },
    onError: () => {
      clearTimer(dismissTimerRef);
      setAuthState("error");
      setHelperText("");
      setErrorText("Try again when ready.");
    },
  });

  useEffect(() => {
    if (!ready) return;

    if (authenticated) {
      routeToDashboard();
    }
  }, [ready, authenticated]);

  useEffect(() => {
    clearTimer(voiceTimerRef);

    if (phase === "voice") {
      voiceTimerRef.current = setTimeout(() => {
        setPhase("action");
      }, VOICE_DURATION_MS + TRANSITION_GAP_MS);
    }

    return () => {
      clearTimer(voiceTimerRef);
    };
  }, [phase]);

  useEffect(() => {
    const handleFocus = () => {
      if (!authRequestedRef.current) return;
      if (authenticated) return;
      if (authState !== "launching") return;

      clearTimer(dismissTimerRef);
      dismissTimerRef.current = setTimeout(() => {
        if (!authenticated) {
          setAuthState("dismissed");
          setErrorText("");
          setHelperText("Still here.");
        }
      }, DISMISS_HELPER_DELAY_MS);
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [authenticated, authState]);

  useEffect(() => {
    return () => {
      clearTimer(voiceTimerRef);
      clearTimer(dismissTimerRef);
    };
  }, []);

  const handleContinue = async () => {
    if (!ready) return;

    clearTimer(dismissTimerRef);

    authRequestedRef.current = true;
    setAuthState("launching");
    setHelperText("");
    setErrorText("");

    try {
      await login({ loginMethods: ["email"] });
    } catch (error) {
      try {
        await login();
      } catch {
        setAuthState("error");
        setErrorText("Try again when ready.");
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.07),transparent_58%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,10,14,0.40),rgba(0,0,0,0.82))]" />

      <div className="relative z-10 min-h-screen">
        <AnimatePresence mode="wait">
          {phase === "voice" && (
            <VoiceScreen
              key="voice"
              lines={["Save your progress.", "Pick up where you left off."]}
            />
          )}

          {phase === "action" && (
            <ActionScreen
              key="action"
              onContinue={handleContinue}
              isLaunchingAuth={authState === "launching"}
              helperText={helperText}
              errorText={errorText}
              canInteract={ready && authState !== "launching" && authState !== "success"}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
