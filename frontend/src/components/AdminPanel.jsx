import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Gamepad2,
  ShoppingBag,
  ArrowRightLeft,
  Settings,
  Shield,
  Activity,
  BarChart3,
  Footprints,
  Database,
  PanelLeft,
  LogOut,
  Home,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import adminApi from "@/lib/adminApi";
import AdminLogin from "@/components/admin/AdminLogin";
import DashboardSection from "@/components/admin/DashboardSection";
import AccountSettingsSection from "@/components/admin/AccountSettingsSection";
import UsersSection from "@/components/admin/UsersSection";
import TreasurySection from "@/components/admin/TreasurySection";
import WalkSection from "@/components/admin/WalkSection";
import MarketplaceSection from "@/components/admin/MarketplaceSection";
import GamesSection from "@/components/admin/GamesSection";
import SwapConfigSection from "@/components/admin/SwapConfigSection";
import ActivityLogSection from "@/components/admin/ActivityLogSection";

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [dashboardData, setDashboardData] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const key = localStorage.getItem("zwap_admin_key");

    if (key) {
      adminApi
        .get("/dashboard")
        .then((data) => {
          setIsAuthenticated(true);
          setDashboardData(data);
        })
        .catch(() => {
          localStorage.removeItem("zwap_admin_key");
        });
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

  const handleLogout = () => {
    localStorage.removeItem("zwap_admin_key");
    setIsAuthenticated(false);
  };

  const handleReturnToApp = () => {
    window.location.href = "/";
  };

  if (!isAuthenticated) {
    return (
      <AdminLogin
        onLogin={() => {
          setIsAuthenticated(true);
          loadDashboard();
        }}
      />
    );
  }

  const sections = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users },
    { id: "treasury", label: "Treasury", icon: Database },
    { id: "walk", label: "Walk", icon: Footprints },
    { id: "games", label: "Games", icon: Gamepad2 },
    { id: "marketplace", label: "Marketplace", icon: ShoppingBag },
    { id: "swap", label: "Swap Config", icon: ArrowRightLeft },
    { id: "account-settings", label: "Account Settings", icon: Settings },
    { id: "activity", label: "Activity Log", icon: Activity },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardSection data={dashboardData} onRefresh={loadDashboard} />;
      case "users":
        return <UsersSection />;
      case "treasury":
        return <TreasurySection />;
      case "walk":
        return <WalkSection />;
      case "games":
        return <GamesSection />;
      case "marketplace":
        return <MarketplaceSection />;
      case "swap":
        return <SwapConfigSection />;
      case "account-settings":
        return <AccountSettingsSection />;
      case "activity":
        return <ActivityLogSection />;
      default:
        return <DashboardSection data={dashboardData} onRefresh={loadDashboard} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050510] text-white">
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-72 flex-col border-r border-gray-800 bg-[#070b17]">
          <div className="px-6 py-6 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">ZWAP! Admin</h1>
                <p className="text-sm text-gray-400">Mission Control</p>
              </div>
            </div>
          </div>

          <div className="flex-1 px-4 py-5 space-y-2">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-pink-400/30 via-cyan-400/25 to-blue-400/30 border border-cyan-400/30 text-white shadow-[0_0_20px_rgba(34,211,238,0.12)]"
                      : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-cyan-300" : "text-gray-500"}`} />
                  <span className="font-medium">{section.label}</span>
                </button>
              );
            })}
          </div>

          <div className="px-4 py-4 border-t border-gray-800 space-y-2">
            <button
              onClick={handleReturnToApp}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-gray-400 hover:text-white hover:bg-white/5"
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Return to App</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-gray-400 hover:text-white hover:bg-white/5"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header */}
          <header className="lg:hidden sticky top-0 z-40 border-b border-gray-800 bg-[#0a0b1e]/95 backdrop-blur px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-2 rounded-xl border border-gray-700 bg-white/5"
                >
                  <PanelLeft className="w-5 h-5 text-cyan-400" />
                </button>

                <div className="min-w-0">
                  <h1 className="text-lg font-bold text-white truncate">ZWAP! Admin</h1>
                  <p className="text-xs text-gray-400 truncate">Mission Control</p>
                </div>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleReturnToApp}
                className="text-gray-400 hover:text-white"
              >
                App
              </Button>
            </div>
          </header>

          {/* Mobile Drawer */}
          {mobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-50">
              <div
                className="absolute inset-0 bg-black/70"
                onClick={() => setMobileMenuOpen(false)}
              />

              <div className="absolute left-0 top-0 h-full w-72 bg-[#070b17] border-r border-gray-800 flex flex-col">
                <div className="px-5 py-5 border-b border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">ZWAP! Admin</h2>
                      <p className="text-xs text-gray-400">Mission Control</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 px-4 py-5 space-y-2 overflow-y-auto">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;

                    return (
                      <button
                        key={section.id}
                        onClick={() => {
                          setActiveSection(section.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all ${
                          isActive
                            ? "bg-gradient-to-r from-pink-400/30 via-cyan-400/25 to-blue-400/30 border border-cyan-400/30 text-white"
                            : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? "text-cyan-300" : "text-gray-500"}`} />
                        <span className="font-medium">{section.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="px-4 py-4 border-t border-gray-800 space-y-2">
                  <button
                    onClick={handleReturnToApp}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-gray-400 hover:text-white hover:bg-white/5"
                  >
                    <Home className="w-5 h-5" />
                    <span className="font-medium">Return to App</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-gray-400 hover:text-white hover:bg-white/5"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Desktop top bar */}
          <header className="hidden lg:flex items-center justify-between border-b border-gray-800 bg-[#0a0b1e] px-6 py-4">
            <div>
              <h2 className="text-xl font-semibold text-white">
                {sections.find((s) => s.id === activeSection)?.label || "Dashboard"}
              </h2>
              <p className="text-sm text-gray-400">Admin control surface</p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleReturnToApp}
                className="text-gray-400 hover:text-white"
              >
                Return to App
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleLogout}
                className="text-gray-400 hover:text-white"
              >
                Logout
              </Button>
            </div>
          </header>

          <main className="flex-1 min-w-0">
            <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {renderSection()}
              </motion.div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}