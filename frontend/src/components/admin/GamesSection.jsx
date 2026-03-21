import React, { useEffect, useState } from "react";
import { Gamepad2 } from "lucide-react";
import { toast } from "sonner";

import adminApi from "@/lib/adminApi";

export default function GamesSection() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    setLoading(true);
    try {
      const data = await adminApi.get("/config/games");
      setGames(data.games || []);
    } catch {
      toast.error("Failed to load games");
    }
    setLoading(false);
  };

  const toggleGame = async (gameId, currentlyEnabled) => {
    try {
      await adminApi.post(
        `/config/games/${gameId}/toggle?enabled=${!currentlyEnabled}`
      );
      toast.success(`Game ${!currentlyEnabled ? "enabled" : "disabled"}`);
      loadGames();
    } catch {
      toast.error("Failed to toggle game");
    }
  };

  if (loading) {
    return (
      <div className="text-gray-400 text-center py-8">
        Loading games...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">
        Games Configuration
      </h2>

      <div className="grid gap-3">
        {games.map((game) => (
          <div
            key={game.game_id}
            className="p-4 rounded-xl border border-gray-700 bg-gray-800/30 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-purple-400" />
              </div>

              <div>
                <h3 className="text-white font-semibold">
                  {game.name || game.game_id}
                </h3>
                <p className="text-gray-400 text-sm">
                  Reward: {game.reward_rate || 1}x • Tier:{" "}
                  {game.tier_required || "starter"}
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                toggleGame(game.game_id, game.enabled)
              }
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                game.enabled
                  ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                  : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
              }`}
            >
              {game.enabled ? "Enabled" : "Disabled"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}