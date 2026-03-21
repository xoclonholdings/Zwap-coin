import React, { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { toast } from "sonner";

import adminApi from "@/lib/adminApi";

export default function SettingsSection() {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const system = await adminApi.get("/config/system");
      setConfig(system || {});
    } catch {
      toast.error("Failed to load settings");
    }
    setLoading(false);
  };

  const toggleMaintenance = async () => {
    try {
      await adminApi.put("/config/system", {
        ...config,
        maintenance_mode: !config.maintenance_mode,
      });
      toast.success(
        `Maintenance mode ${!config.maintenance_mode ? "enabled" : "disabled"}`
      );
      loadConfig();
    } catch {
      toast.error("Failed to update");
    }
  };

  if (loading) {
    return <div className="text-gray-400 text-center py-8">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">System Settings</h2>

      <div className="p-4 rounded-xl border border-gray-700 bg-gray-800/30 space-y-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Globe className="w-5 h-5 text-cyan-400" />
          System Controls
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-white">Maintenance Mode</p>
            <p className="text-gray-500 text-sm">
              Show maintenance message to all users
            </p>
          </div>

          <button
            onClick={toggleMaintenance}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              config.maintenance_mode
                ? "bg-yellow-500/20 text-yellow-400"
                : "bg-gray-700 text-gray-400"
            }`}
          >
            {config.maintenance_mode ? "Enabled" : "Disabled"}
          </button>
        </div>
      </div>
    </div>
  );
}