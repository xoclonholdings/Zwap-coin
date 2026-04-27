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

import AdminSectionCardV1 from "./components/AdminSectionCardV1";
import AdminProgressionSectionV1 from "./sections/AdminProgressionSectionV1";

export default function AdminPanelV1({ isOpen = false, onClose }) {
  const [activeSection, setActiveSection] = useState("dashboard");

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

  const activeSectionLabel =
    sections.find((section) => section.id === activeSection)?.label ||
    "Dashboard";

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <AdminSectionCardV1 title="System Overview">
            ZWAP! behavioral engine is active.
            <br />
            All reward systems route through reward_service.
          </AdminSectionCardV1>
        );

      case "progression":
        return <AdminProgressionSectionV1 />;

      case "users":
        return (
          <AdminSectionCardV1 title="Users">
            Monitor user growth, onboarding flow, account status, and retention
            signals.
          </AdminSectionCardV1>
        );

      case "treasury":
        return (
          <AdminSectionCardV1 title="Treasury">
            Track zPts issuance, ZWAP unlocks, conversion readiness, sponsor
            pools, and value sinks.
          </AdminSectionCardV1>
        );

      case "move":
        return (
          <AdminSectionCardV1 title="Move System">
            Review step validation, cooldown enforcement, movement claims, and
            activity spikes.
          </AdminSectionCardV1>
        );

      case "play":
        return (
          <AdminSectionCardV1 title="Play System">
            Review game sessions, progression depth, score signals, and reward
            distribution.
          </AdminSectionCardV1>
        );

      case "shop":
        return (
          <AdminSectionCardV1 title="Shop">
            Manage item rotation, purchases, unlock thresholds, and value sink
            behavior.
          </AdminSectionCardV1>
        );

      case "activity":
        return (
          <AdminSectionCardV1 title="Activity">
            Track system-wide engagement, streak events, purchases, assists, and
            milestone activity.
          </AdminSectionCardV1>
        );

      case "badges":
        return (
          <AdminSectionCardV1 title="Badges">
            Monitor badge progression, trophy completion, identity unlocks, and
            mastery pacing.
          </AdminSectionCardV1>
        );

      case "settings":
        return (
          <AdminSectionCardV1 title="Settings">
            Control reward tuning, unlock flags, environment settings, and admin
            configuration.
          </AdminSectionCardV1>
        );

      default:
        return (
          <AdminSectionCardV1 title="System Overview">
            ZWAP! behavioral engine is active.
          </AdminSectionCardV1>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[200]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="absolute inset-0 flex flex-col bg-[#050816] text-white"
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
                      {activeSectionLabel} Control Surface
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
                        "flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs whitespace-nowrap transition active:scale-[0.98]",
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

            <div className="flex-1 overflow-y-auto p-4 pb-[calc(env(safe-area-inset-bottom)+24px)]">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
              >
                {renderSection()}
              </motion.div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}