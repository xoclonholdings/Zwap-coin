import React, { useEffect, useState } from "react";
import { Lock, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import adminApi from "@/lib/adminApi";

export default function AccountSection() {
  const [settings, setSettings] = useState({
    admin_email: "",
    notification_enabled: true,
    two_factor_enabled: false,
  });

  const [keyForm, setKeyForm] = useState({
    current_key: "",
    new_key: "",
    confirm_key: "",
  });

  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [changingKey, setChangingKey] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await adminApi.get("/account/settings");
      setSettings(data);
    } catch {
      toast.error("Failed to load account settings");
    }
    setLoading(false);
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      await adminApi.put("/account/settings", {
        admin_email: settings.admin_email,
        notification_enabled: settings.notification_enabled,
        two_factor_enabled: settings.two_factor_enabled,
      });
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    }
    setSavingSettings(false);
  };

  const changeKey = async () => {
    if (keyForm.new_key !== keyForm.confirm_key) {
      toast.error("New keys don't match");
      return;
    }

    if (keyForm.new_key.length < 12) {
      toast.error("New key must be at least 12 characters");
      return;
    }

    setChangingKey(true);

    try {
      await adminApi.post("/account/change-key", {
        current_key: keyForm.current_key,
        new_key: keyForm.new_key,
      });

      localStorage.setItem("zwap_admin_key", keyForm.new_key);

      toast.success("Admin key changed successfully");

      setKeyForm({
        current_key: "",
        new_key: "",
        confirm_key: "",
      });

      loadSettings();
    } catch (e) {
      toast.error(e.message || "Failed to change key");
    }

    setChangingKey(false);
  };

  if (loading) {
    return (
      <div className="text-gray-400 text-center py-8">
        Loading account settings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Account Settings</h2>

      {/* Change Key */}
      <div className="p-5 rounded-xl border border-red-500/30 bg-red-500/5 space-y-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Lock className="w-5 h-5 text-red-400" />
          Change Admin Key
        </h3>

        <div className="space-y-3">
          <Input
            type="password"
            placeholder="Current key"
            value={keyForm.current_key}
            onChange={(e) =>
              setKeyForm({ ...keyForm, current_key: e.target.value })
            }
          />

          <Input
            type="password"
            placeholder="New key"
            value={keyForm.new_key}
            onChange={(e) =>
              setKeyForm({ ...keyForm, new_key: e.target.value })
            }
          />

          <Input
            type="password"
            placeholder="Confirm new key"
            value={keyForm.confirm_key}
            onChange={(e) =>
              setKeyForm({ ...keyForm, confirm_key: e.target.value })
            }
          />

          <Button
            onClick={changeKey}
            disabled={
              changingKey ||
              !keyForm.current_key ||
              !keyForm.new_key ||
              !keyForm.confirm_key
            }
            className="bg-red-600 hover:bg-red-700"
          >
            {changingKey ? "Changing..." : "Change Key"}
          </Button>
        </div>
      </div>

      {/* Email Settings */}
      <div className="p-5 rounded-xl border border-gray-700 bg-gray-800/30 space-y-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Bell className="w-5 h-5 text-cyan-400" />
          Notifications
        </h3>

        <Input
          type="email"
          placeholder="admin@email.com"
          value={settings.admin_email}
          onChange={(e) =>
            setSettings({ ...settings, admin_email: e.target.value })
          }
        />

        <button
          onClick={() =>
            setSettings({
              ...settings,
              notification_enabled: !settings.notification_enabled,
            })
          }
          className={`px-4 py-2 rounded-lg text-sm ${
            settings.notification_enabled
              ? "bg-green-500/20 text-green-400"
              : "bg-gray-700 text-gray-400"
          }`}
        >
          {settings.notification_enabled ? "Enabled" : "Disabled"}
        </button>

        <Button
          onClick={saveSettings}
          disabled={savingSettings}
          className="bg-cyan-600 hover:bg-cyan-700"
        >
          {savingSettings ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}