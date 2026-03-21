import React, { useEffect, useState } from "react";
import { Footprints, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import adminApi from "@/lib/adminApi";

export default function WalkSection() {
  const [walkConfig, setWalkConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadWalkConfig();
  }, []);

  const loadWalkConfig = async () => {
    setLoading(true);
    try {
      const data = await adminApi.get("/config/walk");
      setWalkConfig(data || {});
    } catch {
      toast.error("Failed to load walk settings");
    }
    setLoading(false);
  };

  const saveWalkConfig = async () => {
    setSaving(true);
    try {
      await adminApi.put("/config/walk", walkConfig);
      toast.success("Walk config saved");
    } catch {
      toast.error("Failed to save walk config");
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="text-gray-400 text-center py-8">Loading walk settings...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Walk Settings</h2>

      <div className="p-4 rounded-xl border border-gray-700 bg-gray-800/30 space-y-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Footprints className="w-5 h-5 text-green-400" />
          Walk-to-Earn Settings
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-gray-400 text-sm block mb-1">Daily Step Cap</label>
            <Input
              type="number"
              value={walkConfig.daily_step_cap || 10000}
              onChange={(e) =>
                setWalkConfig({
                  ...walkConfig,
                  daily_step_cap: parseInt(e.target.value) || 0,
                })
              }
              className="bg-gray-800 border-gray-700"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1">Steps per ZWAP</label>
            <Input
              type="number"
              value={walkConfig.steps_per_zwap || 1000}
              onChange={(e) =>
                setWalkConfig({
                  ...walkConfig,
                  steps_per_zwap: parseInt(e.target.value) || 0,
                })
              }
              className="bg-gray-800 border-gray-700"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1">Steps per zPt</label>
            <Input
              type="number"
              value={walkConfig.steps_per_zpt || 100}
              onChange={(e) =>
                setWalkConfig({
                  ...walkConfig,
                  steps_per_zpt: parseInt(e.target.value) || 0,
                })
              }
              className="bg-gray-800 border-gray-700"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1">Anti-Cheat Threshold</label>
            <Input
              type="number"
              value={walkConfig.anti_cheat_spike_threshold || 5000}
              onChange={(e) =>
                setWalkConfig({
                  ...walkConfig,
                  anti_cheat_spike_threshold: parseInt(e.target.value) || 0,
                })
              }
              className="bg-gray-800 border-gray-700"
            />
          </div>
        </div>

        <Button
          onClick={saveWalkConfig}
          disabled={saving}
          className="bg-cyan-600 hover:bg-cyan-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Walk Config"}
        </Button>
      </div>
    </div>
  );
}