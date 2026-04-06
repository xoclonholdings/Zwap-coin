import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/App";
import PlayHome from "./PlayHome";
import PlayArcadeCard from "./PlayArcadeCard";
import GameLeaderboard from "./GameLeaderboard";
import PlaySessionView from "./PlaySessionView";

const GAME_THEMES = {
  breakerz: {
    shell:
      "border-cyan-400/20 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_transparent_32%),linear-gradient(180deg,rgba(7,19,27,0.96),rgba(7,14,20,0.98))]",
    icon: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    button: "from-cyan-400 via-teal-400 to-violet-400",
  },
  brainz: {
    shell:
      "border-violet-400/20 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),_transparent_32%),linear-gradient(180deg,rgba(16,10,31,0.96),rgba(11,10,22,0.98))]",
    icon: "border-violet-400/20 bg-violet-400/10 text-violet-300",
    button: "from-violet-400 via-fuchsia-400 to-cyan-400",
  },
  stackz: {
    shell:
      "border-pink-400/20 bg-[radial-gradient(circle_at_top,_rgba(244,114,182,0.18),_transparent_32%),linear-gradient(180deg,rgba(28,10,25,0.96),rgba(14,9,18,0.98))]",
    icon: "border-pink-400/20 bg-pink-400/10 text-pink-300",
    button: "from-pink-400 via-fuchsia-400 to-violet-400",
  },
  pulze: {
    shell:
      "border-cyan-400/20 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_transparent_32%),linear-gradient(180deg,rgba(7,19,27,0.96),rgba(7,14,20,0.98))]",
    icon: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    button: "from-cyan-400 via-violet-400 to-pink-400",
  },
  triplez: {
    shell:
      "border-pink-400/20 bg-[radial-gradient(circle_at_top,_rgba(236,72,153,0.16),_transparent_32%),linear-gradient(180deg,rgba(24,10,22,0.96),rgba(14,9,18,0.98))]",
    icon: "border-pink-400/20 bg-pink-400/10 text-pink-300",
    button: "from-pink-400 via-violet-400 to-cyan-400",
  },
  werdz: {
    shell:
      "border-violet-400/20 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),_transparent_32%),linear-gradient(180deg,rgba(16,10,31,0.96),rgba(11,10,22,0.98))]",
    icon: "border-violet-400/20 bg-violet-400/10 text-violet-300",
    button: "from-violet-400 via-cyan-400 to-teal-400",
  },
};

function createInitialSession(game) {
  const comingSoon = game?.status === "coming";

  return {
    gameId: game?.id || "",
    round: 1,
    maxRounds: 1,
    totalScore: 0,
    level: 1,
    status: comingSoon ? "coming" : "splash",
  };
}

function SessionSplash({ game, onStart, onBack }) {
  return (
    <div className="flex h-full w-full items-center justify-center px-4 py-6">
      <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-black/20 p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        {game?.logo ? (
          <img
            src={game.logo}
            alt={game.name}
            className="mx-auto mb-6 h-32 object-contain"
          />
        ) : null}

        <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">
          Ready
        </p>

        <h2 className="mt-3 text-2xl font-semibold text-white">
          {game?.name}
        </h2>

        {game?.mechanic ? (
          <p className="mx-auto mt-3 max-w-[280px] text-sm leading-relaxed text-white/55">
            {game.mechanic}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={onStart}
            className="rounded-[20px] bg-[linear-gradient(90deg,rgba(34,211,238,1),rgba(139,92,246,1),rgba(236,72,153,0.95))] px-6 py-3.5 text-lg font-semibold text-[#071019] shadow-[0_0_34px_rgba(139,92,246,0.30)] transition active:scale-[0.98]"
          >
            Start
          </button>

          <button
            type="button"
            onClick={onBack}
            className="rounded-[20px] border border-white/10 bg-white/[0.05] px-6 py-3 text-sm font-medium text-white/70 transition hover:bg-white/[0.08]"
          >
            Back to Arcade
          </button>
        </div>
      </div>
    </div>
  );
}

function ComingSoonStage({ game, onBack }) {
  return (
    <div className="flex h-full w-full items-center justify-center px-4 py-6">
      <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-black/20 p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        {game?.logo ? (
          <img
            src={game.logo}
            alt={game.name}
            className="mx-auto mb-6 h-32 object-contain opacity-90"
          />
        ) : null}

        <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">
          Coming Soon
        </p>

        <h2 className="mt-3 text-2xl font-semibold text-white">
          {game?.name}
        </h2>

        {game?.mechanic ? (
          <p className="mx-auto mt-3 max-w-[280px] text-sm leading-relaxed text-white/55">
            {game.mechanic}
          </p>
        ) : null}

        <button
          type="button"
          onClick={onBack}
          className="mt-8 rounded-[20px] border border-white/10 bg-white/[0.05] px-6 py-3 text-sm font-medium text-white/70 transition hover:bg-white/[0.08]"
        >
          Back to Arcade
        </button>
      </div>
    </div>
  );
}

function LivePlaceholderStage({ game, onEnd }) {
  return (
    <div className="flex h-full w-full items-center justify-center px-4 py-6">
      <div className="w-full max-w-lg rounded-[28px] border border-white/10 bg-black/20 p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">
          Live Session
        </p>

        <h2 className="mt-3 text-2xl font-semibold text-white">
          {game?.name}
        </h2>

        <p className="mx-auto mt-3 max-w-[320px] text-sm leading-relaxed text-white/55">
          Full gameplay wiring comes next. The fullscreen session flow is now in
          place.
        </p>

        <button
          type="button"
          onClick={onEnd}
          className="mt-8 rounded-[20px] bg-[linear-gradient(90deg,rgba(34,211,238,1),rgba(139,92,246,1),rgba(236,72,153,0.95))] px-6 py-3 text-base font-semibold text-[#071019] shadow-[0_0_34px_rgba(139,92,246,0.30)] transition active:scale-[0.98]"
        >
          End Session
        </button>
      </div>
    </div>
  );
}

export default function PlayTab() {
  const { user } = useApp();

  const isPlus = String(user?.tier || "starter").toLowerCase() === "plus";

  const [activeGame, setActiveGame] = useState(null);
  const [session, setSession] = useState(null);
  const [submittingResult, setSubmittingResult] = useState(false);

  const currentTheme = useMemo(() => {
    return GAME_THEMES[activeGame?.id] || GAME_THEMES.brainz;
  }, [activeGame]);

  const handleOpenGame = (game) => {
    if (!game) return;

    setActiveGame(game);
    setSession(createInitialSession(game));
    setSubmittingResult(false);
  };

  const handleBackToArcade = () => {
    if (submittingResult) return;

    setActiveGame(null);
    setSession(null);
    setSubmittingResult(false);
  };

  const handleBeginSession = () => {
    setSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        status: "live",
      };
    });
  };

  const handleEndSession = () => {
    setSubmittingResult(true);

    window.setTimeout(() => {
      setSubmittingResult(false);
      handleBackToArcade();
    }, 700);
  };

  const renderGameStage = () => {
    if (!activeGame || !session) return null;

    if (session.status === "coming") {
      return (
        <ComingSoonStage
          game={activeGame}
          onBack={handleBackToArcade}
        />
      );
    }

    if (session.status === "splash") {
      return (
        <SessionSplash
          game={activeGame}
          onStart={handleBeginSession}
          onBack={handleBackToArcade}
        />
      );
    }

    return (
      <LivePlaceholderStage
        game={activeGame}
        onEnd={handleEndSession}
      />
    );
  };

  if (activeGame && session) {
    return (
      <PlaySessionView
        currentGameData={activeGame}
        currentTheme={currentTheme}
        session={session}
        submittingResult={submittingResult}
        onBack={handleBackToArcade}
        renderGameStage={renderGameStage}
      />
    );
  }

  return (
    <div className="w-full px-4 pb-6 pt-4">
      <div className="mx-auto w-full max-w-md space-y-4">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <PlayHome isPlus={isPlus} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <PlayArcadeCard onStartGame={handleOpenGame} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <GameLeaderboard />
        </motion.div>
      </div>
    </div>
  );
}