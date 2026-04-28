import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Shield,
  Route,
  Users,
  Database,
  Footprints,
  Gamepad2,
  ShoppingBag,
  Activity,
  Award,
  Settings,
  X,
} from "lucide-react";

import adminApi from "@/lib/adminApi";

import AdminLogin from "./AdminLogin";

import AdminDashboardSectionV1 from "./AdminDashboardSectionV1";
import AdminProgressionSectionV1 from "./AdminProgressionSectionV1";
import AdminUsersSectionV1 from "./AdminUsersSectionV1";
import AdminTreasurySectionV1 from "./AdminTreasurySectionV1";
import AdminMoveSectionV1 from "./AdminMoveSectionV1";
import AdminPlaySectionV1 from "./AdminPlaySectionV1";
import AdminShopSectionV1 from "./AdminShopSectionV1";
import AdminActivitySectionV1 from "./AdminActivitySectionV1";
import AdminBadgesSectionV1 from "./AdminBadgesSectionV1";
import AdminSettingsSectionV1 from "./AdminSettingsSectionV1";

export default function AdminPanelV1({ isOpen = false, onClose }) {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(false);

  const sections = useMemo(
    () => [
      { id: "dashboard", label: "Dashboard", icon: Shield },
      { id: "progression", label: "Progression", icon: Route },
      { id: "users", label: "Users", icon: Users },
      { id: "treasury", label: "Treasury", icon: Database },
      { id: "move", label: "Move", icon: Footprints },
      { id: "play", label: "Play", icon: Gamepad2 },
      { id: "shop", label: "Shop", icon: ShoppingBag },
      { id: "activity", label: "Activity", icon: Activity },
      { id: "badges", label: "Badges", icon: Award },
      { id: "settings", label: "Settings", icon: Settings },
    ],
    []
  );

  useEffect(() => {
    if (!isOpen) {
      setActiveSection("dashboard");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const key = localStorage.getItem("zwap_admin_key");

    if (!key) {
      setIsAuthenticated(false);
      setDashboardData(null);
      setCheckingAuth(false);
      return undefined;
    }

    let cancelled = false;

    async function verifyAdminKey() {
      setCheckingAuth(true);

      try {
        const data = await adminApi.get("/dashboard", key);

        if (!cancelled) {
          setDashboardData(data);
          setIsAuthenticated(true);
        }
      } catch {
        localStorage.removeItem("zwap_admin_key");

        if (!cancelled) {
          setDashboardData(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (!cancelled) {
          setCheckingAuth(false);
        }
      }
    }

    verifyAdminKey();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const activeSectionLabel =
    sections.find((section) => section.id === activeSection)?.label ||
    "Dashboard";

  const handleLogout = () => {
    localStorage.removeItem("zwap_admin_key");
    setDashboardData(null);
    setIsAuthenticated(false);
    setActiveSection("dashboard");
  };

  const handleLogin = (data) => {
    setDashboardData(data || null);
    setIsAuthenticated(true);
    setActiveSection("dashboard");
  };

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <AdminDashboardSectionV1 data={dashboardData} />;

      case "progression":
        return (
          <AdminProgressionSectionV1
            currentPhase={dashboardData?.current_phase || "Phase A"}
            phaseLabel={dashboardData?.phase_label || "Activation"}
            progression={dashboardData?.progression || undefined}
          />
        );

      case "users":
        return <AdminUsersSectionV1 />;

      case "treasury":
        return <AdminTreasurySectionV1 />;

      case "move":
        return <AdminMoveSectionV1 />;

      case "play":
        return <AdminPlaySectionV1 />;

      case "shop":
        return <AdminShopSectionV1 />;

      case "activity":
        return <AdminActivitySectionV1 />;

      case "badges":
        return <AdminBadgesSectionV1 />;

      case "settings":
        return <AdminSettingsSectionV1 onLogout={handleLogout} />;

      default:
        return <AdminDashboardSectionV1 data={dashboardData} />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[200] bg-[#050816]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />

          <div className="absolute inset-0 flex justify-center">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="relative flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden border-x border-white/10 bg-[#050816] text-white shadow-[0_0_60px_rgba(0,0,0,0.5)]"
            >
              <div className="border-b border-white/10 px-4 pb-3 pt-[max(env(safe-area-inset-top),16px)]">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-500/10 shadow-[0_0_18px_rgba(34,211,238,0.12)]">
                      <Shield className="h-5 w-5 text-cyan-300" />
                    </div>

                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold text-white">
                        ZWAP! Admin
                      </div>

                      <div className="truncate text-[11px] text-white/40">
                        {checkingAuth
                          ? "Verifying Mission Control Access"
                          : isAuthenticated
                            ? `${activeSectionLabel} Control Surface`
                            : "Mission Control Access"}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close admin panel"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition active:scale-[0.97]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {isAuthenticated ? (
                <div className="border-b border-white/10 px-4 py-3">
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {sections.map((section) => {
                      const Icon = section.icon;
                      const isActive = activeSection === section.id;

                      return (
                        <button
                          key={section.id}
                          type="button"
                          onClick={() => setActiveSection(section.id)}
                          className={[
                            "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3 py-2 text-xs transition active:scale-[0.98]",
                            isActive
                              ? "border-cyan-400/30 bg-cyan-500/20 text-white shadow-[0_0_14px_rgba(34,211,238,0.10)]"
                              : "border-white/10 bg-white/5 text-white/40",
                          ].join(" ")}
                        >
                          <Icon
                            className={[
                              "h-4 w-4",
                              isActive ? "text-cyan-300" : "text-white/35",
                            ].join(" ")}
                          />
                          {section.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div className="min-h-0 flex-1 overflow-y-auto p-4 pb-[calc(env(safe-area-inset-bottom)+24px)]">
                {checkingAuth ? (
                  <div className="flex min-h-[320px] items-center justify-center">
                    <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-5 py-4 text-center text-sm font-semibold text-cyan-200">
                      Verifying admin access...
                    </div>
                  </div>
                ) : isAuthenticated ? (
                  <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    {renderSection()}
                  </motion.div>
                ) : (
                  <AdminLogin onLogin={handleLogin} />
                )}
              </div>
            </motion.div>
          </div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
