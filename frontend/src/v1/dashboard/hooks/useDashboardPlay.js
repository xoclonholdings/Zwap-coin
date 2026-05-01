import { useState } from "react";

export default function useDashboardPlay({
  resolvedEmail,
  apiBase,
  refreshActivitySnapshot,
  setActivitySignal,
  onBalanceUpdate,
}) {
  const [activeGameId, setActiveGameId] = useState(null);
  const [localGamesPlayedToday, setLocalGamesPlayedToday] = useState(0);

  function handleStartGame(game) {
    if (!game || game.locked) return;
    setActiveGameId(game.id);
  }

  async function submitPlayResult(result) {
    if (!resolvedEmail) return null;

    const gameType = result?.gameId || result?.game_type || result?.game || "";
    const score = Number(result?.score || 0);
    const level = Number(result?.level || 1);

    if (!gameType) return null;

    const res = await fetch(
      `${apiBase}/games/result/${encodeURIComponent(resolvedEmail)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          game_type: gameType,
          score,
          level,
          blocks_destroyed: Number(result?.blocksDestroyed || 0),
          session_duration_seconds: Number(result?.sessionDurationSeconds || 0),
          completed: true,
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Game result failed");
    }

    return res.json();
  }

  async function handleGameEnd(result) {
    console.log("Game ended:", result);

    setActiveGameId(null);
    setLocalGamesPlayedToday((current) => Math.max(current, 1));

    try {
      const playResult = await submitPlayResult(result);

      if (
        playResult?.new_zpts_balance !== undefined &&
        typeof onBalanceUpdate === "function"
      ) {
        onBalanceUpdate(Number(playResult.new_zpts_balance || 0));
      }

      setActivitySignal?.({
        type: "play",
        game: result?.gameId || playResult?.game || "",
        zpts: Number(playResult?.zpts_earned || 0),
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Play result submit failed:", error);

      setActivitySignal?.({
        type: "play",
        game: result?.gameId || "",
        zpts: 0,
        created_at: new Date().toISOString(),
      });
    }

    await refreshActivitySnapshot?.();
  }

  return {
    activeGameId,
    localGamesPlayedToday,
    handleStartGame,
    handleGameEnd,
  };
}