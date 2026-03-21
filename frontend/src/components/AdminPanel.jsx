import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Gamepad2,
  ShoppingBag,
  ArrowRightLeft,
  Settings,
  Shield,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Activity,
  BarChart3,
  Lock,
  Footprints,
  Bell,
  Globe,
  RefreshCw,
  Database,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import adminApi from "@/lib/adminApi";
import StatCard from "@/components/admin/StatCard";
import SectionTab from "@/components/admin/SectionTab";
import AdminLogin from "@/components/admin/AdminLogin";
import DashboardSection from "@/components/admin/DashboardSection";
import UsersSection from "@/components/admin/UsersSection";
import TreasurySection from "@/components/admin/TreasurySection";
import SettingsSection from "@/components/admin/SettingsSection";
import WalkSection from "@/components/admin/WalkSection";
import MarketplaceSection from "@/components/admin/MarketplaceSection";

// Account Section
const AccountSection = () => {
  const [settings, setSettings] = useState({ admin_email: "", notification_enabled: true, two_factor_enabled: false });
  const [keyForm, setKeyForm] = useState({ current_key: "", new_key: "", confirm_key: "" });
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
      setKeyForm({ current_key: "", new_key: "", confirm_key: "" });
      loadSettings();
    } catch (e) {
      toast.error(e.message || "Failed to change key");
    }
  
    setChangingKey(false);
  };

  if (loading) return <div className="text-gray-400 text-center py-8">Loading account settings...</div>;

  return (
    <div className="space-y-6">
      <h2 data-testid="account-settings-title" className="text-xl font-bold text-white">Account Settings</h2>

      <div data-testid="change-key-section" className="p-5 rounded-xl border border-red-500/30 bg-red-500/5 space-y-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Lock className="w-5 h-5 text-red-400" />
          Change Admin Key
        </h3>
        <p className="text-gray-400 text-sm">Your key is securely hashed. After changing, you will need to use the new key to log in.</p>
        <div className="space-y-3">
          <div>
            <label className="text-gray-400 text-sm block mb-1">Current Key</label>
            <Input
              data-testid="current-key-input"
              type="password"
              placeholder="Enter current admin key"
              value={keyForm.current_key}
              onChange={(e) => setKeyForm({ ...keyForm, current_key: e.target.value })}
              className="bg-gray-800 border-gray-700"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-1">New Key (min 12 characters)</label>
            <Input
              data-testid="new-key-input"
              type="password"
              placeholder="Enter new admin key"
              value={keyForm.new_key}
              onChange={(e) => setKeyForm({ ...keyForm, new_key: e.target.value })}
              className="bg-gray-800 border-gray-700"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-1">Confirm New Key</label>
            <Input
              data-testid="confirm-key-input"
              type="password"
              placeholder="Confirm new admin key"
              value={keyForm.confirm_key}
              onChange={(e) => setKeyForm({ ...keyForm, confirm_key: e.target.value })}
              className="bg-gray-800 border-gray-700"
            />
          </div>
          <Button
            data-testid="change-key-button"
            onClick={changeKey}
            disabled={changingKey || !keyForm.current_key || !keyForm.new_key || !keyForm.confirm_key}
            className="bg-red-600 hover:bg-red-700"
          >
            <Lock className="w-4 h-4 mr-2" /> {changingKey ? "Changing..." : "Change Admin Key"}
          </Button>
        </div>
        {settings.key_last_changed && (
          <p className="text-gray-500 text-xs">Key last changed: {new Date(settings.key_last_changed).toLocaleString()}</p>
        )}
      </div>

      <div data-testid="email-settings-section" className="p-5 rounded-xl border border-gray-700 bg-gray-800/30 space-y-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Bell className="w-5 h-5 text-cyan-400" />
          Admin Email & Notifications
        </h3>
        <div>
          <label className="text-gray-400 text-sm block mb-1">Admin Email</label>
          <Input
            data-testid="admin-email-input"
            type="email"
            placeholder="admin@example.com"
            value={settings.admin_email || ""}
            onChange={(e) => setSettings({ ...settings, admin_email: e.target.value })}
            className="bg-gray-800 border-gray-700"
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white text-sm">Email Notifications</p>
            <p className="text-gray-500 text-xs">Receive alerts for suspicious activity</p>
          </div>
          <button
            data-testid="notification-toggle"
            onClick={() => setSettings({ ...settings, notification_enabled: !settings.notification_enabled })}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              settings.notification_enabled ? "bg-green-500/20 text-green-400" : "bg-gray-700 text-gray-400"
            }`}
          >
            {settings.notification_enabled ? "Enabled" : "Disabled"}
          </button>
        </div>
        <Button
          data-testid="save-settings-button"
          onClick={saveSettings}
          disabled={savingSettings}
          className="bg-cyan-600 hover:bg-cyan-700"
        >
          <Save className="w-4 h-4 mr-2" /> {savingSettings ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      {settings.last_login && (
        <div className="p-4 rounded-xl border border-gray-700 bg-gray-800/30">
          <p className="text-gray-400 text-sm">
            Last login: <span className="text-white">{new Date(settings.last_login).toLocaleString()}</span>
          </p>
        </div>
      )}
    </div>
  );
};

// Activity Log Section
const ActivityLogSection = () => {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActions();
  }, []);

  const loadActions = async () => {
    setLoading(true);
    try {
      const data = await adminApi.get("/actions");
      setActions(data.actions || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load activity log");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-gray-400 text-center py-8">Loading activity log...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Activity Log</h2>
        <Button
          size="sm"
          variant="outline"
          onClick={loadActions}
          className="border-gray-700"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {actions.length === 0 ? (
        <div className="text-gray-400 text-center py-8 rounded-xl border border-gray-700 bg-gray-800/20">
          No admin actions recorded yet
        </div>
      ) : (
        <div className="grid gap-3">
          {actions.map((action, i) => (
            <div
              key={action.id || i}
              className="p-4 rounded-xl border border-gray-700 bg-gray-800/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-white font-medium">
                    {action.action_type || "Unknown Action"}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Target: {action.target_type || "—"} • {action.target_id || "—"}
                  </p>
                  {action.wallet_address && (
                    <p className="text-gray-500 text-xs font-mono mt-1">
                      Wallet: {action.wallet_address}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  {(action.amount !== undefined && action.amount !== null) && (
                    <p className="text-cyan-400 text-sm font-medium">
                      {action.amount} {action.currency || ""}
                    </p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    {action.created_at
                      ? new Date(action.created_at).toLocaleString()
                      : "No timestamp"}
                  </p>
                </div>
              </div>

              <div className="mt-2 text-xs text-gray-500">
                Performed by: {action.performed_by || "admin"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Main Admin Panel Component
export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const key = localStorage.getItem("zwap_admin_key");
    if (key) {
      adminApi.get("/dashboard")
        .then((data) => {
          setIsAuthenticated(true);
          setDashboardData(data);
        })
        .catch(() => localStorage.removeItem("zwap_admin_key"));
    }
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await adminApi.get("/dashboard");
      setDashboardData(data);
    } catch {
      toast.error("Failed to load dashboard");
    }
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => { setIsAuthenticated(true); loadDashboard(); }} />;
  }

  const sections = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users },
    { id: "treasury", label: "Treasury", icon: Database },
    { id: "walk", label: "Walk", icon: Footprints },
    { id: "games", label: "Games", icon: Gamepad2 },
    { id: "marketplace", label: "Marketplace", icon: ShoppingBag },
    { id: "swap", label: "Swap Config", icon: ArrowRightLeft },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "account", label: "Account", icon: Lock },
    { id: "activity", label: "Activity Log", icon: Activity },
  ];

  return (
  <div className="min-h-screen bg-[#050510]">
    <header className="bg-[#0a0b1e] border-b border-gray-800 px-4 py-3 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Left side — Admin title */}
        <div className="flex items-center gap-3">
          <Shield className="w-7 h-7 text-cyan-400" />
          <div>
            <h1 className="text-lg font-bold text-white">ZWAP! Admin</h1>
            <p className="text-xs text-gray-500">Mission Control</p>
          </div>
        </div>

        {/* Right side — Navigation buttons */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              window.location.href = "/";
            }}
            className="text-gray-400 hover:text-white"
          >
            Return to App
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              localStorage.removeItem("zwap_admin_key");
              setIsAuthenticated(false);
            }}
            className="text-gray-400 hover:text-white"
          >
            Logout
          </Button>
        </div>

      </div>
    </header>
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="flex gap-2 mb-6 pb-4 border-b border-gray-800 overflow-x-auto">
          {sections.map((section) => (
            <SectionTab
              key={section.id}
              icon={section.icon}
              label={section.label}
              active={activeSection === section.id}
              onClick={() => setActiveSection(section.id)}
            />
          ))}
        </div>

        <motion.div key={activeSection} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {activeSection === "dashboard" && <DashboardSection data={dashboardData} onRefresh={loadDashboard} />}
          {activeSection === "users" && <UsersSection />}
          {activeSection === "treasury" && <TreasurySection />}
          {activeSection === "walk" && <WalkSection />}
          {activeSection === "games" && <GamesSection />}
          {activeSection === "marketplace" && <MarketplaceSection />}
          {activeSection === "swap" && <SwapConfigSection />}
          {activeSection === "settings" && <SettingsSection />}
          {activeSection === "account" && <AccountSection />}
          {activeSection === "activity" && <ActivityLogSection />}
        </motion.div>
      </div>
    </div>
  );
}