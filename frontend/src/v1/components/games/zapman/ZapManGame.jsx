import React, { Suspense, lazy, useMemo, useState } from "react";

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

function getGameTitle(gameId) {
  if (gameId === "zap-man") return "Zap-Man";
  if (gameId === "breakerz") return "Breakerz";
  if (gameId === "stackz") return "Stackz";
  if (gameId === "pulze") return "Pulze";
  return "ZWAP! Arcade";
}

export default function ZwapArcadeEngine({ activeGameId, onGameEnd }) {
  const [flowState, setFlowState] = useState("live");
  const [roundResult, setRoundResult] = useState(null);
  const [rewardDoubled, setRewardDoubled] = useState(false);
  const [reviveUsed, setReviveUsed] = useState(false);
  const [adRunning, setAdRunning] = useState(false);
  const [roundSeed, setRoundSeed] = useState(1);
  const [currentRound, setCurrentRound] = useState(1);

  const gameTitle = useMemo(() => getGameTitle(activeGameId), [activeGameId]);

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
      setFlowState("live");
      setRoundSeed((current) => current + 1);
    } finally {
      setAdRunning(false);
    }
  }

  function handleStartNextRound() {
    const nextRound = Number(roundResult?.nextRound || currentRound + 1);

    setCurrentRound(nextRound);
    setRoundResult(null);
    setRewardDoubled(false);
    setFlowState("live");
    setRoundSeed((current) => current + 1);
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
    };

    if (activeGameId === "stackz") return <StackzGame {...sharedProps} />;
    if (activeGameId === "breakerz") return <BreakerzGame {...sharedProps} />;
    if (activeGameId === "pulze") return <PulzeGame {...sharedProps} />;
    if (activeGameId === "zap-man") return <ZapManGame {...sharedProps} />;

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
    </div>
  );
}