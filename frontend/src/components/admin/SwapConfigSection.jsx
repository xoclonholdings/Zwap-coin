import React, { useEffect, useState } from "react";
import { ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";

import adminApi from "@/lib/adminApi";

export default function SwapConfigSection() {
  const [config, setConfig] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const data = await adminApi.get("/config/swap");
      setConfig(data.tokens || []);
    } catch {
      toast.error("Failed to load swap config");
    } finally {
      setLoading(false);
    }
  };

  const toggleToken = async (symbol, currentlyEnabled) => {
    try {
      await adminApi.put(`/config/swap/${symbol}`, {
        token_symbol: symbol,
        enabled: !currentlyEnabled,
        external_url: "https://jumper.exchange",
      });
      toast.success(`${symbol} ${!currentlyEnabled ? "enabled" : "disabled"}`);
      loadConfig();
    } catch {
      toast.error("Failed to update");
    }
  };

  if (loading) {
    return <div className="text-gray-400 text-center py-8">Loading swap config...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Swap Configuration</h2>
      <p className="text-gray-400 text-sm">
        Control which tokens can be swapped via external services.
      </p>

      <div className="grid gap-3">
        {config.map((token) => (
          <div
            key={token.token_symbol}
            className="p-4 rounded-xl border border-gray-700 bg-gray-800/30 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <ArrowRightLeft className="w-5 h-5 text-blue-400" />
              </div>

              <div>
                <h3 className="text-white font-semibold">{token.token_symbol}</h3>
                <p className="text-gray-500 text-xs truncate max-w-[200px]">
                  {token.external_url}
                </p>
              </div>
            </div>

            <button
              onClick={() => toggleToken(token.token_symbol, token.enabled)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                token.enabled
                  ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                  : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
              }`}
            >
              {token.enabled ? "Enabled" : "Disabled"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}