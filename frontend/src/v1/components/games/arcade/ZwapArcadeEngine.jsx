import React, { Suspense, lazy, useEffect, useMemo, useState } from "react";

import GameInterstitialOverlay from "./GameInterstitialOverlay";
import GameRoundCompleteOverlay from "./GameRoundCompleteOverlay";
import GameReviveOverlay from "./GameReviveOverlay";

import { playDoubleRewardAd, playExtraLifeAd } from "./adService";

import {
  buildArcadeRewardResult,
  buildReviveResult,
  normalizeArcadeFinalResult,
} from "./rewardService";

const StackzGame = lazy(() =>
  import("@/v1/components/games/stackz/StackzGame")
);

const BreakerzGame = lazy(() =>
  import("@/v1/components/games/breakerz/BreakerzGame")
);

const PulzeGame = lazy(() =>
  import("@/v1/components/games/pulze/PulzeGame")
);

const ZapManGame = lazy(() =>
  import("@/v1/components/games/zapman/ZapManGame")
);

const BrainzGame = lazy(() =>
  import("@/v1/components/games/brainz/BrainzGame")
);

const WerdzGame = lazy(() =>
  import("@/v1/components/games/werdz/WerdzGame")
);

const TriplezGame = lazy(() =>
  import("@/v1/components/games/triplez/TriplezGame")
);

const CylinderzGame = lazy(() =>
  import("@/v1/components/games/cylinderz/CylinderzGame")
);

const TailzGame = lazy(() =>
  import("@/v1/components/games/tailz/TailzGame")
);

const InvazionGame = lazy(() =>
  import("@/v1/components/games/invazion/InvazionGame")
);

const AcezGame = lazy(() =>
  import("@/v1/components/games/acez/AcezGame")
);

function GameLoadingScreen() {
  return (
    <div className="flex h-[100dvh] w-full items-center justify-center bg-[#050816] text-white">
      <div className="rounded-[24px] border border-cyan-300/15 bg-white/[0.04] px-5 py-4 text-center shadow-[0_0_32px_rgba(34,211,238,0.10)]">
        <div className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-200/70">
          Loading Game
        </div>

        <div className="mt-2 text-sm font-semibold text-white/70">
          Powering up the arcade…
        </div>
      </div>
    </div>
  );
}

function GameCountdownOverlay({ open, value }) {
  if (!open) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-60 flex items-center justify-center bg-black/25 text-white backdrop-blur-[2px]">
      <div className="flex h-32 w-32 items-center justify-center rounded-full border border-cyan-200/25 bg-black/55 shadow-[0_0_42px_rgba(34,211,238,0.28)]">
        <div className="bg-[linear-gradient(180deg,#ffffff,#67f2ff_45%,#a855f7)] bg-clip-text text-5xl font-black text-transparent drop-shadow-[0_0_18px_rgba(34,211,238,0.35)]">
          {value}
        </div>
      </div>
    </div>
  );
}

function getGameTitle(gameId) {
  if (gameId === "zap-man") return "Zap-Man";
  if (gameId === "breakerz") return "Breakerz";
  if (gameId === "stackz") return "Stackz";
  if (gameId === "pulze") return "Pulze";
  if (gameId === "brainz") return "Brainz";
  if (gameId === "werdz") return "Werdz";
  if (gameId === "triplez") return "Triplez";
  if (gameId === "cylinderz") return "Cylinderz";
  if (gameId === "tailz") return "Tailz";
  if (gameId === "invazion") return "Invazion";
  if (gameId === "acez") return "Acez";

  return "ZWAP! Arcade";
}

export default function ZwapArcadeEngine({ activeGameId, onGameEnd }) {
  const [flowState, setFlowState] = useState("live");
  const [roundResult, setRoundResult] = useState(null);
  const [rewardDoubled, setRewardDoubled] = useState(false);
  const [reviveUsed, setReviveUsed] = useState(false);
  const [reviveSignal, setReviveSignal] = useState(0);
  const [adRunning, setAdRunning] = useState(false);
  const [roundSeed, setRoundSeed] = useState(1);
  const [currentRound, setCurrentRound] = useState(1);
  const [countdownValue, setCountdownValue] = useState("3");
  const [skipIntro, setSkipIntro] = useState(false);

  const gameTitle = useMemo(() => getGameTitle(activeGameId), [activeGameId]);

  useEffect(() => {
    if (flowState !== "countdown") return undefined;

    const sequence = ["3", "2", "1", "GO!"];
    let index = 0;

    setCountdownValue(sequence[index]);

    const interval = window.setInterval(() => {
      index += 1;

      if (index >= sequence.length) {
        window.clearInterval(interval);
        setFlowState("live");
        return;
      }

      setCountdownValue(sequence[index]);
    }, 650);

    return () => window.clearInterval(interval);
  }, [flowState]);

  function handleRoundComplete(result) {
    setRoundResult(result || {});
    setRewardDoubled(false);
    setFlowState("interstitial");
  }

  function handleInterstitialComplete() {
    setFlowState("roundComplete");
  }

  function handleOutOfLives(result) {
    setRoundResult(result || {});
    setFlowState("revive");
  }

  async function handleWatchDoubleAd() {
    if (rewardDoubled || adRunning) return;

    setAdRunning(true);

    try {
      const adResult = await playDoubleRewardAd({
        gameId: activeGameId,
        round: Number(roundResult?.round || currentRound || 1),
      });

      if (!adResult?.rewarded) return;

      const updatedResult = buildArcadeRewardResult(roundResult, {
        doubled: true,
      });

      setRoundResult(updatedResult);
      setRewardDoubled(true);
    } finally {
      setAdRunning(false);
    }
  }

  async function handleWatchReviveAd() {
    if (reviveUsed || adRunning) return;

    setAdRunning(true);

    try {
      const adResult = await playExtraLifeAd({
        gameId: activeGameId,
        round: Number(roundResult?.round || currentRound || 1),
      });

      if (!adResult?.rewarded) return;

      const updatedResult = buildReviveResult(roundResult);

      setRoundResult(updatedResult);
      setReviveUsed(true);
      setReviveSignal((current) => current + 1);
      setSkipIntro(true);
      setFlowState("countdown");
    } finally {
      setAdRunning(false);
    }
  }

  function handleStartNextRound() {
    const nextRound = Number(roundResult?.nextRound || currentRound + 1);

    setCurrentRound(nextRound);
    setRoundResult(null);
    setRewardDoubled(false);
    setReviveUsed(false);
    setReviveSignal(0);
    setSkipIntro(true);
    setRoundSeed((current) => current + 1);
    setFlowState("countdown");
  }

  function handleFinalGameEnd(result) {
    onGameEnd?.(
      normalizeArcadeFinalResult(activeGameId, result || roundResult || {})
    );
  }

  function renderGame() {
    const sharedProps = {
      key: `${activeGameId}-${roundSeed}`,
      isPlaying: flowState === "live",
      level: currentRound,
      round: currentRound,
      onGameEnd: handleFinalGameEnd,
      onRoundComplete: handleRoundComplete,
      onOutOfLives: handleOutOfLives,
      reviveUsed,
      reviveSignal,
      skipIntro,
      startMode: skipIntro ? "countdown" : "splash",
    };

    if (activeGameId === "stackz") return <StackzGame {...sharedProps} />;
    if (activeGameId === "breakerz") return <BreakerzGame {...sharedProps} />;
    if (activeGameId === "pulze") return <PulzeGame {...sharedProps} />;
    if (activeGameId === "zap-man") return <ZapManGame {...sharedProps} />;
    if (activeGameId === "brainz") return <BrainzGame {...sharedProps} />;
    if (activeGameId === "werdz") return <WerdzGame {...sharedProps} />;
    if (activeGameId === "triplez") return <TriplezGame {...sharedProps} />;
    if (activeGameId === "cylinderz") return <CylinderzGame {...sharedProps} />;
    if (activeGameId === "tailz") return <TailzGame {...sharedProps} />;
    if (activeGameId === "invazion") return <InvazionGame {...sharedProps} />;
    if (activeGameId === "acez") return <AcezGame {...sharedProps} />;

    return null;
  }

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#050816] text-white">
      <Suspense fallback={<GameLoadingScreen />}>{renderGame()}</Suspense>

      <GameInterstitialOverlay
        open={flowState === "interstitial"}
        gameTitle={gameTitle}
        onComplete={handleInterstitialComplete}
      />

      <GameRoundCompleteOverlay
        open={flowState === "roundComplete"}
        gameTitle={gameTitle}
        result={roundResult}
        rewardDoubled={rewardDoubled}
        adRunning={adRunning}
        onWatchDoubleAd={handleWatchDoubleAd}
        onStartNextRound={handleStartNextRound}
        onBackToArcade={() => handleFinalGameEnd(roundResult)}
      />

      <GameReviveOverlay
        open={flowState === "revive"}
        gameTitle={gameTitle}
        result={roundResult}
        reviveUsed={reviveUsed}
        adRunning={adRunning}
        onWatchReviveAd={handleWatchReviveAd}
        onEndSession={() => handleFinalGameEnd(roundResult)}
      />

      <GameCountdownOverlay
        open={flowState === "countdown"}
        value={countdownValue}
      />
    </div>
  );
}