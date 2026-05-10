import React, { Suspense, lazy, useMemo, useState } from "react";

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

const INTERSTITIAL_MS = 1800;
const REWARDED_AD_MS = 2600;

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

function ArcadeInterstitialOverlay({ open, gameTitle, onComplete }) {
  const [ready, setReady] = useState(false);

  React.useEffect(() => {
    if (!open) {
      setReady(false);
      return;
    }

    const timer = setTimeout(() => {
      setReady(true);
    }, INTERSTITIAL_MS);

    return () => clearTimeout(timer);
  }, [open]);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 px-5 text-white backdrop-blur-md">
      <div className="w-full max-w-[330px] rounded-[30px] border border-cyan-300/15 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_36%),linear-gradient(180deg,rgba(9,14,24,0.96),rgba(4,8,16,0.98))] p-5 text-center shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
        <p className="text-[11px] font-black uppercase tracking-[0.26em] text-cyan-300/75">
          Sponsored Break
        </p>

        <h3 className="mt-3 text-xl font-black text-white">
          Round Complete
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-white/58">
          Short ad break before your {gameTitle} reward screen.
        </p>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full bg-[linear-gradient(90deg,rgba(168,85,247,1),rgba(236,72,153,0.95),rgba(34,211,238,1))] transition-all duration-[1800ms] ${
              ready ? "w-full" : "w-[12%]"
            }`}
          />
        </div>

        <button
          type="button"
          disabled={!ready}
          onClick={onComplete}
          className={`mt-5 w-full rounded-full px-5 py-3.5 text-sm font-black transition ${
            ready
              ? "bg-white text-slate-950 active:scale-[0.98]"
              : "bg-white/10 text-white/35"
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function ArcadeRoundCompleteOverlay({
  open,
  gameTitle,
  result,
  rewardDoubled,
  adRunning,
  onWatchDoubleAd,
  onStartNextRound,
  onBackToArcade,
}) {
  if (!open) return null;

  const baseZpts = Number(result?.baseZpts || result?.zpts || 0);
  const finalZpts = rewardDoubled ? baseZpts * 2 : baseZpts;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/78 px-5 text-white backdrop-blur-md">
      <div className="w-full max-w-[340px] rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_36%),linear-gradient(180deg,rgba(9,14,24,0.96),rgba(4,8,16,0.98))] p-5 text-center shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
        <p className="text-[11px] font-black uppercase tracking-[0.26em] text-cyan-300/75">
          {gameTitle}
        </p>

        <h3 className="mt-3 text-xl font-black text-white">
          Reward Ready
        </h3>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-white/8 bg-white/[0.05] px-3 py-3">
            <p className="text-[10px] uppercase tracking-wide text-white/40">
              Score
            </p>
            <p className="mt-1 text-base font-black text-cyan-300">
              {Number(result?.score || 0).toLocaleString()}
            </p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.05] px-3 py-3">
            <p className="text-[10px] uppercase tracking-wide text-white/40">
              zPts
            </p>
            <p className="mt-1 text-base font-black text-pink-300">
              +{Number(finalZpts || 0).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <button
            type="button"
            disabled={rewardDoubled || adRunning || baseZpts <= 0}
            onClick={onWatchDoubleAd}
            className={`flex w-full items-center justify-center rounded-[20px] px-5 py-3.5 text-sm font-black transition ${
              rewardDoubled || baseZpts <= 0
                ? "border border-white/10 bg-white/[0.05] text-white/35"
                : "bg-[linear-gradient(90deg,rgba(250,204,21,0.95),rgba(236,72,153,0.95))] text-white active:scale-[0.98]"
            }`}
          >
            {adRunning
              ? "Playing Ad…"
              : rewardDoubled
                ? "zPts Doubled"
                : "Watch Ad to Double zPts"}
          </button>

          <button
            type="button"
            onClick={onStartNextRound}
            className="flex w-full items-center justify-center rounded-[20px] bg-[linear-gradient(90deg,rgba(168,85,247,1),rgba(236,72,153,0.95),rgba(34,211,238,1))] px-5 py-3.5 text-base font-black text-white transition active:scale-[0.98]"
          >
            Start Next Round
          </button>

          <button
            type="button"
            onClick={onBackToArcade}
            className="flex w-full items-center justify-center rounded-[20px] border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-medium text-white/72 transition hover:bg-white/[0.08]"
          >
            Back to Arcade
          </button>
        </div>
      </div>
    </div>
  );
}

function ArcadeReviveOverlay({
  open,
  gameTitle,
  result,
  reviveUsed,
  adRunning,
  onWatchReviveAd,
  onEndSession,
}) {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 px-5 text-white backdrop-blur-md">
      <div className="w-full max-w-[340px] rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(236,72,153,0.13),transparent_36%),linear-gradient(180deg,rgba(16,10,18,0.96),rgba(8,8,12,0.98))] p-5 text-center shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
        <p className="text-[11px] font-black uppercase tracking-[0.26em] text-pink-300/75">
          {gameTitle}
        </p>

        <h3 className="mt-3 text-xl font-black text-white">
          Continue?
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-white/58">
          Watch an ad to revive with one extra life, or end this session.
        </p>

        <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.05] px-3 py-3">
          <p className="text-[10px] uppercase tracking-wide text-white/40">
            Score
          </p>
          <p className="mt-1 text-base font-black text-cyan-300">
            {Number(result?.score || 0).toLocaleString()}
          </p>
        </div>

        <div className="mt-5 space-y-3">
          <button
            type="button"
            disabled={reviveUsed || adRunning}
            onClick={onWatchReviveAd}
            className={`flex w-full items-center justify-center rounded-[20px] px-5 py-3.5 text-sm font-black transition ${
              reviveUsed
                ? "border border-white/10 bg-white/[0.05] text-white/35"
                : "bg-[linear-gradient(90deg,rgba(250,204,21,0.95),rgba(236,72,153,0.95))] text-white active:scale-[0.98]"
            }`}
          >
            {adRunning
              ? "Playing Ad…"
              : reviveUsed
                ? "Revive Used"
                : "Watch Ad for +1 Life"}
          </button>

          <button
            type="button"
            onClick={onEndSession}
            className="flex w-full items-center justify-center rounded-[20px] border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-medium text-white/72 transition hover:bg-white/[0.08]"
          >
            End Session
          </button>
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

function normalizeFinalResult(gameId, result) {
  return {
    gameId,
    game_type: gameId,
    score: Number(result?.score || 0),
    level: Number(result?.level || result?.round || 1),
    blocksDestroyed: Number(result?.blocksDestroyed || 0),
    sessionDurationSeconds: Number(result?.sessionDurationSeconds || 0),
    completed: true,
  };
}

export default function ZwapArcadeEngine({ activeGameId, onGameEnd }) {
  const [flowState, setFlowState] = useState("live");
  const [roundResult, setRoundResult] = useState(null);
  const [rewardDoubled, setRewardDoubled] = useState(false);
  const [reviveUsed, setReviveUsed] = useState(false);
  const [adRunning, setAdRunning] = useState(false);
  const [roundSeed, setRoundSeed] = useState(1);

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

  function handleWatchDoubleAd() {
    if (rewardDoubled || adRunning) return;

    setAdRunning(true);

    window.setTimeout(() => {
      setRewardDoubled(true);
      setAdRunning(false);
    }, REWARDED_AD_MS);
  }

  function handleWatchReviveAd() {
    if (reviveUsed || adRunning) return;

    setAdRunning(true);

    window.setTimeout(() => {
      setReviveUsed(true);
      setAdRunning(false);
      setFlowState("live");
      setRoundSeed((current) => current + 1);
    }, REWARDED_AD_MS);
  }

  function handleStartNextRound() {
    setRoundResult(null);
    setRewardDoubled(false);
    setFlowState("live");
    setRoundSeed((current) => current + 1);
  }

  function handleFinalGameEnd(result) {
    onGameEnd?.(normalizeFinalResult(activeGameId, result || roundResult || {}));
  }

  function renderGame() {
    const sharedProps = {
      key: `${activeGameId}-${roundSeed}`,
      isPlaying: flowState === "live",
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

      <ArcadeInterstitialOverlay
        open={flowState === "interstitial"}
        gameTitle={gameTitle}
        onComplete={handleInterstitialComplete}
      />

      <ArcadeRoundCompleteOverlay
        open={flowState === "roundComplete"}
        gameTitle={gameTitle}
        result={roundResult}
        rewardDoubled={rewardDoubled}
        adRunning={adRunning}
        onWatchDoubleAd={handleWatchDoubleAd}
        onStartNextRound={handleStartNextRound}
        onBackToArcade={() => handleFinalGameEnd(roundResult)}
      />

      <ArcadeReviveOverlay
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