import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
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

export default function AdminPanelV1({
  isOpen = false,
  onClose,
}) {
  const [activeSection, setActiveSection] = useState("dashboard");

  useEffect(() => {
    if (!isOpen) {
      setActiveSection("dashboard");
    }
  }, [isOpen]);

  const sections = [
    { id: "dashboard", label: "Dashboard", icon: Shield },
    { id: "users", label: "Users", icon: Users },
    { id: "treasury", label: "Treasury", icon: Database },
    { id: "move", label: "Move", icon: Footprints },
    { id: "play", label: "Play", icon: Gamepad2 },
    { id: "shop", label: "Shop", icon: ShoppingBag },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "badges", label: "Badges", icon: Award },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <Section title="System Overview">
            ZWAP! behavioral engine is active.
            <br />
            All reward systems routing through reward_service.
          </Section>
        );

      case "users":
        return (
          <Section title="Users">
            Monitor user growth, onboarding flow, and retention signals.
          </Section>
        );

      case "treasury":
        return (
          <Section title="Treasury">
            Track zPts issuance, ZWAP unlocks, and conversion flow.
          </Section>
        );

      case "move":
        return (
          <Section title="Move System">
            Step validation, cooldown enforcement, and activity spikes.
          </Section>
        );

      case "play":
        return (
          <Section title="Play System">
            Game sessions, progression depth, and reward distribution.
          </Section>
        );

      case "shop":
        return (
          <Section title="Shop">
            Item rotation, purchases, and value sink behavior.
          </Section>
        );

      case "activity":
        return (
          <Section title="Activity">
            System-wide engagement and event tracking.
          </Section>
        );

      case "badges":
        return (
          <Section title="Badges">
            Badge progression, trophy system, identity layer.
          </Section>
        );

      case "settings":
        return (
          <Section title="Settings">
            Reward tuning, unlock control, environment flags.
          </Section>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200]">
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />

          {/* PANEL */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="absolute inset-0 flex flex-col bg-[#050816]"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 pt-[max(env(safe-area-inset-top),16px)] pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-400/20">
                  <Shield className="w-5 h-5 text-cyan-300" />
                </div>

                <div>
                  <div className="text-sm font-bold text-white">
                    ZWAP! Admin
                  </div>
                  <div className="text-[11px] text-white/40">
                    Control Surface
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            {/* NAV */}
            <div className="flex gap-2 overflow-x-auto px-4 py-3 border-b border-white/10">
              {sections.map((s) => {
                const Icon = s.icon;
                const isActive = activeSection === s.id;

                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(s.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs whitespace-nowrap transition ${
                      isActive
                        ? "bg-cyan-500/20 text-white border border-cyan-400/30"
                        : "bg-white/5 text-white/40 border border-white/10"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {s.label}
                  </button>
                );
              })}
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto p-4">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {renderSection()}
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-sm font-semibold text-white mb-2">
        {title}
      </div>
      <div className="text-xs text-white/60 leading-5">
        {children}
      </div>
    </div>
  );
}