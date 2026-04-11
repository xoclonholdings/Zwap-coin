import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const INTRO_FADE_MS = 260;
const VOICE_HOLD_MS = 1500;
const RING_ENTRY_DELAY_MS = 380;
const TAP_START_DELAY_MS = 220;

const FALLBACK_ONE_DELAY_MS = 7000;
const FALLBACK_TWO_DELAY_MS = 5000;
const FALLBACK_THREE_DELAY_MS = 6500;

const ONBOARDING_MOVE_DISPLAY_CAP = 15;
const STEPS_PER_DISPLAY_ZPT = 12;
const MEANINGFUL_DISPLAY_THRESHOLD = 10;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function buildRingStyle(progressPercent) {
  const safePercent = clamp(Number(progressPercent || 0), 0, 100);
  const degrees = safePercent * 3.6;

  return {
    background: `conic-gradient(
      from 180deg,
      rgba(34,211,238,1) 0deg,
      rgba(45,212,191,1) ${degrees * 0.65}deg,
      rgba(168,85,247,1) ${degrees}deg,
      rgba(255,255,255,0.08) ${degrees}deg,
      rgba(255,255,255,0.08) 360deg
    )`,
  };
}

function VoiceBlock({ lines }) {
  return (
    <motion.div
      key={lines.join("-")}
      initial={{ opacity: 0, filter: "blur(8px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(8px)" }}
      transition={{ duration: 0.28 }}
      className="pointer-events-none flex min-h-[92px] flex-col items-center justify-center text-center"
    >
      {lines.map((line) => (
        <div
          key={line}
          className="text-[1.4rem] font-medium leading-tight tracking-[-0.02em] text-white/95 sm:text-[1.55rem]"
        >
          {line}
        </div>
      ))}
    </motion.div>
  );
}

function CenterOverlay({ displayedSteps, displayedZpts, emphasized = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.985 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: emphasized ? 1.02 : 1,
        boxShadow: emphasized
          ? "0 0 28px rgba(34,211,238,0.18)"
          : "0 0 0px rgba(34,211,238,0)",
      }}
      exit={{ opacity: 0, y: 8, scale: 0.985 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-[520px] rounded-[28px] border border-white/10 bg-white/[0.06] px-5 py-5 backdrop-blur-md"
    >
      <div className="flex items-center justify-center gap-5 text-center">
        <div className="min-w-0 flex-1 text-[1.15rem] font-medium tracking-[-0.02em] text-white sm:text-[1.35rem]">
          <span className="text-white/75">| </span>
          {displayedSteps.toLocaleString()} Steps
          <span className="text-white/75"> |</span>
        </div>

        <div className="h-8 w-px bg-white/12" />

        <div className="min-w-0 flex-1 text-[1.15rem] font-medium tracking-[-0.02em] text-cyan-300 sm:text-[1.35rem]">
          <span className="text-white/75">| </span>+{displayedZpts} zPts
          <span className="text-white/75"> |</span>
        </div>
      </div>
    </motion.div>
  );
}

function RingOnly({
  isTracking,
  progressPercent,
  onToggleTracking,
  docked = false,
  passive = false,
  showTapStart = false,
}) {
  const ringStyle = useMemo(() => buildRingStyle(progressPercent), [progressPercent]);

  return (
    <motion.div
      animate={{
        width: docked ? 164 : 264,
        height: docked ? 164 : 264,
        opacity: passive ? 0.58 : 1,
        scale: passive ? 0.985 : 1,
      }}
      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      <button
        type="button"
        onClick={onToggleTracking}
        className="group relative h-full w-full rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
        aria-label={isTracking ? "Stop walking session" : "Start walking session"}
      >
        <div
          className={`absolute inset-0 rounded-full p-[10px] transition-transform duration-200 group-active:scale-[0.98] ${
            isTracking
              ? "shadow-[0_0_60px_rgba(34,211,238,0.24)]"
              : "shadow-[0_0_40px_rgba(34,211,238,0.14)]"
          }`}
          style={ringStyle}
        >
          <div className="flex h-full w-full items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),rgba(8,23,22,1)_55%)]">
            <div
              className={`rounded-full px-7 py-3 text-base font-semibold uppercase tracking-[0.18em] transition ${
                isTracking
                  ? "bg-red-500/85 text-white shadow-[0_0_24px_rgba(239,68,68,0.35)]"
                  : "bg-cyan-400/85 text-[#041214] shadow-[0_0_24px_rgba(34,211,238,0.35)]"
              }`}
            >
              {isTracking ? "Stop" : "Start"}
            </div>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {showTapStart && !isTracking && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none absolute left-1/2 top-full mt-4 -translate-x-1/2 text-sm font-medium text-white/80"
          >
            Tap Start
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function MoveOnboardingSequence({
  totalSteps = 0,
  progressPercent = 0,
  onStartTracking,
  onStopTracking,
  onTryPlay,
  onLearnMore,
  onMoveMilestone,
  onboardingAboutPage = "/about",
}) {
  const [phase, setPhase] = useState("intro-1");
  const [voiceLines, setVoiceLines] = useState(["Take a few steps…", "We’ll keep score."]);
  const [voiceVisible, setVoiceVisible] = useState(true);
  const [ringVisible, setRingVisible] = useState(false);
  const [showTapStart, setShowTapStart] = useState(false);
  const [isTracking, setIsTracking] = useState(false);

  const [displayedSteps, setDisplayedSteps] = useState(0);
  const [displayedZpts, setDisplayedZpts] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayEmphasis, setOverlayEmphasis] = useState(false);

  const [showPlayButton, setShowPlayButton] = useState(false);
  const [showLearnMoreButton, setShowLearnMoreButton] = useState(false);

  const sessionStartStepsRef = useRef(null);
  const lastMovementAtRef = useRef(null);
  const meaningfulMilestoneSentRef = useRef(false);

  const introTimeoutsRef = useRef([]);
  const fallbackOneRef = useRef(null);
  const fallbackTwoRef = useRef(null);
  const fallbackThreeRef = useRef(null);
  const emphasisTimeoutRef = useRef(null);

  const clearTimer = (ref) => {
    if (ref.current) {
      clearTimeout(ref.current);
      ref.current = null;
    }
  };

  const clearAllFallbacks = () => {
    clearTimer(fallbackOneRef);
    clearTimer(fallbackTwoRef);
    clearTimer(fallbackThreeRef);
  };

  const clearIntroTimeouts = () => {
    introTimeoutsRef.current.forEach(clearTimeout);
    introTimeoutsRef.current = [];
  };

  const beginFallbackOne = () => {
    if (!isTracking) return;
    if (displayedZpts >= MEANINGFUL_DISPLAY_THRESHOLD) return;

    setShowOverlay(false);
    setShowPlayButton(false);
    setShowLearnMoreButton(false);
    setVoiceLines(["Take your time…", "We’re still here."]);
    setVoiceVisible(true);
    setPhase("fallback-1");

    clearTimer(fallbackTwoRef);
    clearTimer(fallbackThreeRef);

    fallbackTwoRef.current = setTimeout(() => {
      if (!isTracking) return;
      if (displayedZpts >= MEANINGFUL_DISPLAY_THRESHOLD) return;

      setVoiceVisible(false);

      setTimeout(() => {
        if (!isTracking) return;
        if (displayedZpts >= MEANINGFUL_DISPLAY_THRESHOLD) return;

        setVoiceLines(["Can’t move yet?", "Try Play."]);
        setVoiceVisible(true);
        setPhase("fallback-2");
      }, 180);

      fallbackThreeRef.current = setTimeout(() => {
        if (!isTracking) return;
        if (displayedZpts >= MEANINGFUL_DISPLAY_THRESHOLD) return;

        setVoiceVisible(false);

        setTimeout(() => {
          if (!isTracking) return;
          if (displayedZpts >= MEANINGFUL_DISPLAY_THRESHOLD) return;

          setVoiceLines(["Still unsure…?", "You can always learn more."]);
          setVoiceVisible(true);
          setPhase("fallback-3");

          setTimeout(() => {
            setShowPlayButton(true);
            setShowLearnMoreButton(true);
          }, 300);
        }, 180);
      }, FALLBACK_THREE_DELAY_MS);

      setTimeout(() => {
        setShowPlayButton(true);
      }, 300);
    }, FALLBACK_TWO_DELAY_MS);
  };

  const armFallbackOne = () => {
    clearTimer(fallbackOneRef);

    fallbackOneRef.current = setTimeout(() => {
      if (!isTracking) return;

      const now = Date.now();
      const lastMove = lastMovementAtRef.current || now;
      const inactiveFor = now - lastMove;

      if (inactiveFor >= FALLBACK_ONE_DELAY_MS && displayedZpts < MEANINGFUL_DISPLAY_THRESHOLD) {
        beginFallbackOne();
      }
    }, FALLBACK_ONE_DELAY_MS);
  };

  const resumeActiveFromIdle = () => {
    setVoiceVisible(false);
    setShowPlayButton(false);
    setShowLearnMoreButton(false);
    setShowOverlay(true);
    setPhase("active");
    clearAllFallbacks();
    armFallbackOne();
  };

  useEffect(() => {
    clearIntroTimeouts();

    introTimeoutsRef.current.push(
      setTimeout(() => {
        setVoiceVisible(false);
      }, VOICE_HOLD_MS)
    );

    introTimeoutsRef.current.push(
      setTimeout(() => {
        setRingVisible(true);
        setPhase("ring-entry");
      }, VOICE_HOLD_MS + INTRO_FADE_MS + RING_ENTRY_DELAY_MS)
    );

    introTimeoutsRef.current.push(
      setTimeout(() => {
        setShowTapStart(true);
        setPhase("ready");
      }, VOICE_HOLD_MS + INTRO_FADE_MS + RING_ENTRY_DELAY_MS + TAP_START_DELAY_MS)
    );

    return () => {
      clearIntroTimeouts();
      clearAllFallbacks();
      clearTimer(emphasisTimeoutRef);
    };
  }, []);

  useEffect(() => {
    if (!isTracking) return;

    const sessionStart = sessionStartStepsRef.current ?? totalSteps;
    const deltaSteps = Math.max(0, Number(totalSteps || 0) - Number(sessionStart || 0));
    const nextDisplayedZpts = clamp(
      Math.floor(deltaSteps / STEPS_PER_DISPLAY_ZPT),
      0,
      ONBOARDING_MOVE_DISPLAY_CAP
    );

    setDisplayedSteps(deltaSteps);

    if (deltaSteps > 0) {
      lastMovementAtRef.current = Date.now();

      if (phase === "fallback-1" || phase === "fallback-2" || phase === "fallback-3") {
        resumeActiveFromIdle();
      } else if (!showOverlay && !voiceVisible) {
        setShowOverlay(true);
      }

      clearAllFallbacks();
      armFallbackOne();
    }

    if (nextDisplayedZpts !== displayedZpts) {
      setDisplayedZpts(nextDisplayedZpts);
    }

    if (
      nextDisplayedZpts >= MEANINGFUL_DISPLAY_THRESHOLD &&
      !meaningfulMilestoneSentRef.current
    ) {
      meaningfulMilestoneSentRef.current = true;
      setOverlayEmphasis(true);

      if (typeof onMoveMilestone === "function") {
        onMoveMilestone({
          displayedSteps: deltaSteps,
          displayedZpts: nextDisplayedZpts,
        });
      }

      clearTimer(emphasisTimeoutRef);
      emphasisTimeoutRef.current = setTimeout(() => {
        setOverlayEmphasis(false);
      }, 650);
    }
  }, [
    totalSteps,
    isTracking,
    displayedZpts,
    phase,
    showOverlay,
    voiceVisible,
    onMoveMilestone,
  ]);

  useEffect(() => {
    if (!isTracking) return;
    if (!showOverlay) return;
    if (displayedZpts >= MEANINGFUL_DISPLAY_THRESHOLD) return;

    armFallbackOne();

    return () => {
      clearTimer(fallbackOneRef);
    };
  }, [isTracking, showOverlay, displayedZpts]);

  const handleToggleTracking = () => {
    if (!isTracking) {
      setIsTracking(true);
      setPhase("active");
      setShowTapStart(false);
      setVoiceVisible(false);
      setShowOverlay(true);
      setShowPlayButton(false);
      setShowLearnMoreButton(false);

      sessionStartStepsRef.current = Number(totalSteps || 0);
      lastMovementAtRef.current = Date.now();
      meaningfulMilestoneSentRef.current = false;
      setDisplayedSteps(0);
      setDisplayedZpts(0);

      clearAllFallbacks();
      armFallbackOne();

      if (typeof onStartTracking === "function") {
        onStartTracking();
      }

      return;
    }

    setIsTracking(false);
    setShowOverlay(false);
    setShowPlayButton(false);
    setShowLearnMoreButton(false);
    clearAllFallbacks();

    if (typeof onStopTracking === "function") {
      onStopTracking();
    }
  };

  const handleTryPlay = () => {
    if (typeof onTryPlay === "function") {
      onTryPlay();
    }
  };

  const handleLearnMore = () => {
    if (typeof onLearnMore === "function") {
      onLearnMore({ onboardingAboutPage });
    }
  };

  const ringDocked = isTracking;
  const ringPassive = voiceVisible && phase !== "ready" && phase !== "ring-entry";

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.08),transparent_58%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.25),rgba(0,0,0,0.72))]" />

      <div className="relative z-10 min-h-screen">
        <AnimatePresence>
          {voiceVisible && (
            <motion.div
              key={`voice-${phase}`}
              className="absolute inset-x-0 top-[20svh] px-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.24 }}
            >
              <VoiceBlock lines={voiceLines} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showOverlay && !voiceVisible && (
            <motion.div
              key="movement-overlay"
              className="absolute inset-x-0 top-[16svh] px-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <div className="mx-auto flex justify-center">
                <CenterOverlay
                  displayedSteps={displayedSteps}
                  displayedZpts={displayedZpts}
                  emphasized={overlayEmphasis}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {ringVisible && (
            <motion.div
              key="ring-shell"
              className={`absolute ${
                ringDocked
                  ? "bottom-8 left-6 sm:bottom-10 sm:left-8"
                  : "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              }`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <RingOnly
                isTracking={isTracking}
                progressPercent={progressPercent}
                onToggleTracking={handleToggleTracking}
                docked={ringDocked}
                passive={ringPassive}
                showTapStart={showTapStart && !voiceVisible}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showPlayButton && !voiceVisible && (
            <motion.div
              key="play-fallback"
              className="absolute inset-x-0 top-[58svh] px-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.22 }}
            >
              <div className="mx-auto flex max-w-[280px] justify-center">
                <button
                  type="button"
                  onClick={handleTryPlay}
                  className="w-full rounded-2xl border border-cyan-400/30 bg-cyan-400/12 px-6 py-4 text-base font-semibold text-cyan-200 shadow-[0_0_26px_rgba(34,211,238,0.14)]"
                >
                  Play
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showLearnMoreButton && !voiceVisible && (
            <motion.div
              key="learn-more-fallback"
              className="absolute inset-x-0 top-[69svh] px-6"
              initial={{ opacity: 0, filter: "blur(6px)" }}
              animate={{ opacity: 0.7, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(6px)" }}
              transition={{ duration: 0.2 }}
            >
              <div className="mx-auto flex max-w-[220px] justify-center">
                <button
                  type="button"
                  onClick={handleLearnMore}
                  className="text-sm font-medium text-white/70"
                >
                  Learn More
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
