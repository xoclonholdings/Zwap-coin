import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const INTRO_FADE_MS = 260;
const VOICE_HOLD_MS = 2200;
const RING_ENTRY_DELAY_MS = 480;
const TAP_START_DELAY_MS = 320;

const FALLBACK_ONE_DELAY_MS = 9000;
const FALLBACK_TWO_DELAY_MS = 6500;
const FALLBACK_THREE_DELAY_MS = 7500;

const ONBOARDING_MOVE_DISPLAY_CAP = 15;
const STEPS_PER_DISPLAY_ZPT = 12;
const MEANINGFUL_DISPLAY_THRESHOLD = 6;

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
      initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      exit={{ opacity: 0, filter: "blur(10px)", y: -8 }}
      transition={{ duration: 0.42 }}
      className="pointer-events-none flex min-h-[120px] flex-col items-center justify-center text-center"
    >
      {lines.map((line) => (
        <div
          key={line}
          className="text-4xl font-black leading-[1.02] tracking-[-0.05em] text-white"
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
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: emphasized ? 1.02 : 1,
      }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      transition={{ duration: 0.26 }}
      className="w-full rounded-[28px] border border-cyan-300/15 bg-white/[0.06] px-5 py-5 shadow-[0_0_42px_rgba(34,211,238,0.16)] backdrop-blur-md"
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-center">
        <div className="text-lg font-black tracking-[-0.03em] text-white">
          {displayedSteps.toLocaleString()}
          <div className="mt-1 text-[10px] font-bold tracking-[0.2em] text-white/45">
            STEPS
          </div>
        </div>

        <div className="h-10 w-px bg-white/15" />

        <div className="text-lg font-black tracking-[-0.03em] text-cyan-300">
          +{displayedZpts}
          <div className="mt-1 text-[10px] font-bold tracking-[0.2em] text-white/45">
            zPTS
          </div>
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
        width: docked ? 168 : 270,
        height: docked ? 168 : 270,
        opacity: passive ? 0.72 : 1,
        scale: passive ? 0.985 : 1,
      }}
      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto"
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
              ? "shadow-[0_0_70px_rgba(34,211,238,0.28)]"
              : "shadow-[0_0_58px_rgba(34,211,238,0.22)]"
          }`}
          style={ringStyle}
        >
          <div className="flex h-full w-full items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),rgba(8,23,22,1)_58%)]">
            <div
              className={`rounded-full px-8 py-3 text-sm font-black uppercase tracking-[0.22em] transition ${
                isTracking
                  ? "bg-red-500/90 text-white shadow-[0_0_26px_rgba(239,68,68,0.36)]"
                  : "bg-cyan-300 text-[#041214] shadow-[0_0_28px_rgba(34,211,238,0.42)]"
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
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.22 }}
            className="pointer-events-none absolute left-1/2 top-full mt-5 -translate-x-1/2 whitespace-nowrap text-sm font-bold text-white/80"
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
      }, 220);

      fallbackThreeRef.current = setTimeout(() => {
        if (!isTracking) return;
        if (displayedZpts >= MEANINGFUL_DISPLAY_THRESHOLD) return;

        setVoiceVisible(false);

        setTimeout(() => {
          if (!isTracking) return;
          if (displayedZpts >= MEANINGFUL_DISPLAY_THRESHOLD) return;

          setVoiceLines(["Still unsure…?", "You can learn more."]);
          setVoiceVisible(true);
          setPhase("fallback-3");

          setTimeout(() => {
            setShowPlayButton(true);
            setShowLearnMoreButton(true);
          }, 300);
        }, 220);
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

    const sessionStart = sessionStartStepsRef.current ?? Number(totalSteps || 0);
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

  const sessionRingProgress = isTracking
    ? (displayedZpts / ONBOARDING_MOVE_DISPLAY_CAP) * 100
    : progressPercent;

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.18),_rgba(8,10,22,0.96)_58%,_rgba(0,0,0,1)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(180,134,255,0.08),_transparent_35%,_rgba(34,211,238,0.08))]" />

      <div className="absolute left-1/2 top-1/2 h-[560px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-[42px] border border-cyan-300/10 bg-white/[0.025] shadow-[0_0_90px_rgba(34,211,238,0.22)]" />

      <div className="relative z-10 flex min-h-[560px] w-full max-w-[460px] flex-col items-center justify-center px-10 text-center">
        <AnimatePresence mode="wait">
          {voiceVisible && (
            <VoiceBlock key={`voice-${phase}`} lines={voiceLines} />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showOverlay && !voiceVisible && (
            <motion.div
              key="movement-overlay"
              className="absolute left-1/2 top-[14%] w-[330px] -translate-x-1/2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.22 }}
            >
              <CenterOverlay
                displayedSteps={displayedSteps}
                displayedZpts={displayedZpts}
                emphasized={overlayEmphasis}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {ringVisible && (
            <motion.div
              key="ring-shell"
              className={
                ringDocked
                  ? "absolute bottom-12 left-12"
                  : "flex w-full items-center justify-center"
              }
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            >
              <RingOnly
                isTracking={isTracking}
                progressPercent={sessionRingProgress}
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
              className="absolute left-1/2 top-[60%] w-[260px] -translate-x-1/2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.22 }}
            >
              <button
                type="button"
                onClick={handleTryPlay}
                className="w-full rounded-2xl border border-cyan-300/45 bg-cyan-300/15 px-6 py-4 text-lg font-black text-cyan-100 shadow-[0_0_28px_rgba(34,211,238,0.16)]"
              >
                Play
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showLearnMoreButton && !voiceVisible && (
            <motion.div
              key="learn-more-fallback"
              className="absolute left-1/2 top-[71%] -translate-x-1/2"
              initial={{ opacity: 0, filter: "blur(6px)" }}
              animate={{ opacity: 0.75, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(6px)" }}
              transition={{ duration: 0.2 }}
            >
              <button
                type="button"
                onClick={handleLearnMore}
                className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-bold tracking-[0.08em] text-white/70"
              >
                Learn More
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}