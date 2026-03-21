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
  Lock,
  Footprints,
  Database,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import adminApi from "@/lib/adminApi";
import SectionTab from "@/components/admin/SectionTab";
import AdminLogin from "@/components/admin/AdminLogin";
import DashboardSection from "@/components/admin/DashboardSection";
import UsersSection from "@/components/admin/UsersSection";
import TreasurySection from "@/components/admin/TreasurySection";
import SettingsSection from "@/components/admin/SettingsSection";
import WalkSection from "@/components/admin/WalkSection";
import MarketplaceSection from "@/components/admin/MarketplaceSection";
import AccountSection from "@/components/admin/AccountSection";
import GamesSection from "@/components/admin/GamesSection";
import SwapConfigSection from "@/components/admin/SwapConfigSection";
import ActivityLogSection from "@/components/admin/ActivityLogSection";

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [dashboardData, setDashboardData] = useState(null);

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
    { id: "settings", label: "Settings", icon: Settings },
    { id: "account", label: "Account", icon: Lock },
    { id: "activity", label: "Activity Log", icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-[#050510]">
      <header className="bg-[#0a0b1e] border-b border-gray-800 px-4 py-3 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-7 h-7 text-cyan-400" />
            <div>
              <h1 className="text-lg font-bold text-white">ZWAP! Admin</h1>
              <p className="text-xs text-gray-500">Mission Control</p>
            </div>
          </div>

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

        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {activeSection === "dashboard" && (
            <DashboardSection data={dashboardData} onRefresh={loadDashboard} />
          )}
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