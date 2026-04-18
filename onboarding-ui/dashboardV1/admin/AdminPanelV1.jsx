import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Shield,
  X,
  Users,
  Coins,
  Footprints,
  Gamepad2,
  ShoppingBag,
  ClipboardList,
  Award,
  Activity,
  Settings,
  RefreshCw,
  LogOut,
  ChevronRight,
} from "lucide-react";

export default function AdminPanelV1({
  isOpen = false,
  onClose,
  onLogout,
  dashboardData = null,
  onRefresh,
}) {
  const [activeSection, setActiveSection] = useState("dashboard");

  useEffect(() => {
    if (!isOpen) {
      setActiveSection("dashboard");
    }
  }, [isOpen]);

  const sections = useMemo(
    () => [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: Shield,
      },
      {
        id: "users",
        label: "Users",
        icon: Users,
      },
      {
        id: "treasury",
        label: "Treasury",
        icon: Coins,
      },
      {
        id: "move",
        label: "Move",
        icon: Footprints,
      },
      {
        id: "play",
        label: "Play",
        icon: Gamepad2,
      },
      {
        id: "shop",
        label: "Shop",
        icon: ShoppingBag,
      },
      {
        id: "tasks",
        label: "Tasks",
        icon: ClipboardList,
      },
      {
        id: "badges",
        label: "Badges",
        icon: Award,
      },
      {
        id: "activity",
        label: "Activity",
        icon: Activity,
      },
      {
        id: "settings",
        label: "Settings",
        icon: Settings,
      },
    ],
    []
  );

  const stats = {
    totalUsers: dashboardData?.totalUsers ?? 0,
    activeUsers: dashboardData?.activeUsers ?? 0,
    totalZpts: dashboardData?.totalZpts ?? 0,
    totalZwap: dashboardData?.totalZwap ?? 0,
    todaySteps: dashboardData?.todaySteps ?? 0,
    todayGames: dashboardData?.todayGames ?? 0,
    shopPurchases: dashboardData?.shopPurchases ?? 0,
    activeStreaks: dashboardData?.activeStreaks ?? 0,
  };

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Total Users"
                value={stats.totalUsers}
                glow="from-cyan-500/20 to-blue-500/20"
              />
              <StatCard
                label="Active Users"
                value={stats.activeUsers}
                glow="from-pink-500/20 to-purple-500/20"
              />
              <StatCard
                label="zPts Issued"
                value={stats.totalZpts}
                glow="from-emerald-500/20 to-cyan-500/20"
              />
              <StatCard
                label="ZWAP Issued"
                value={stats.totalZwap}
                glow="from-yellow-500/20 to-orange-500/20"
              />
              <StatCard
                label="Steps Today"
                value={stats.todaySteps}
                glow="from-cyan-500/20 to-teal-500/20"
              />
              <StatCard
                label="Games Today"
                value={stats.todayGames}
                glow="from-purple-500/20 to-pink-500/20"
              />
              <StatCard
                label="Shop Orders"
                value={stats.shopPurchases}
                glow="from-orange-500/20 to-pink-500/20"
              />
              <StatCard
                label="Active Streaks"
                value={stats.activeStreaks}
                glow="from-lime-500/20 to-emerald-500/20"
              />
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    System Status
                  </h3>
                  <p className="mt-1 text-xs text-white/45">
                    Reward service, streak logic, movement validation, and Shop
                    systems appear stable.
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1">
                  <div className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-medium text-emerald-300">
                    Stable
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case "users":
        return (
          <SectionCard
            title="Users"
            description="Monitor total users, streak retention, onboarding flow, and locked feature progression."
          />
        );

      case "treasury":
        return (
          <SectionCard
            title="Treasury"
            description="Track zPts issuance, ZWAP unlocks, conversion readiness, sponsor pools, and Shop value sinks."
          />
        );

      case "move":
        return (
          <SectionCard
            title="Move"
            description="Review step claims, cooldown validation, movement spikes, and daily MOVE output."
          />
        );

      case "play":
        return (
          <SectionCard
            title="Play"
            description="Review active games, average session depth, round progression, and reward balancing."
          />
        );

      case "shop":
        return (
          <SectionCard
            title="Shop"
            description="Manage active items, Shop rotations, eBooks, boosts, rings, and future sponsor inventory."
          />
        );

      case "tasks":
        return (
          <SectionCard
            title="Tasks"
            description="Control daily task visibility, completion rates, loop bonuses, and unlock pacing."
          />
        );

      case "badges":
        return (
          <SectionCard
            title="Badges"
            description="Monitor badge progress, trophy progression, identity unlocks, and long-term mastery pacing."
          />
        );

      case "activity":
        return (
          <SectionCard
            title="Activity"
            description="Track system-wide activity, assists, Shop purchases, streak milestones, and future Stream events."
          />
        );

      case "settings":
        return (
          <SectionCard
            title="Settings"
            description="Control admin keys, reward multipliers, phase unlocks, sponsor toggles, and environment values."
          />
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[140]">
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
            transition={{ type: "spring", damping: 26, stiffness: 240 }}
            className="absolute inset-x-0 bottom-0 top-0 flex flex-col overflow-hidden bg-[#050816]"
          >
            <div className="border-b border-white/10 bg-[#08101f]/95 px-4 pb-4 pt-[max(env(safe-area-inset-top),20px)] backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[20px] border border-cyan-400/20 bg-cyan-500/10">
                    <Shield className="h-6 w-6 text-cyan-300" />
                  </div>

                  <div className="min-w-0">
                    <h1 className="truncate text-lg font-bold text-white">
                      ZWAP! Admin
                    </h1>
                    <p className="truncate text-xs text-white/45">
                      Mission control for the behavioral engine
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-all hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  onClick={onRefresh}
                  className="flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-xs font-medium text-cyan-200"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>

                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-200"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>

            <div className="border-b border-white/10 bg-[#08101f] px-4 py-3">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;

                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                        isActive
                          ? "border-cyan-400/30 bg-gradient-to-r from-cyan-500/20 to-pink-500/20 text-white"
                          : "border-white/10 bg-white/[0.04] text-white/50"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 ${
                          isActive ? "text-cyan-300" : "text-white/35"
                        }`}
                      />
                      {section.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+28px)] pt-5">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
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

function StatCard({ label, value, glow }) {
  return (
    <div
      className={`rounded-[24px] border border-white/10 bg-gradient-to-br ${glow} p-4`}
    >
      <p className="text-xs uppercase tracking-[0.18em] text-white/40">
        {label}
      </p>

      <div className="mt-3 text-2xl font-bold text-white">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
    </div>
  );
}

function SectionCard({ title, description }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-white/50">
            {description}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5">
          <ChevronRight className="h-5 w-5 text-white/35" />
        </div>
      </div>
    </div>
  );
}