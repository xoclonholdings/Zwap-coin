import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Footprints,
  Gamepad2,
  ShoppingBag,
  ArrowRightLeft,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";

export default function TabNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: "move", path: "/move", icon: Footprints, label: "MOVE" },
    { id: "play", path: "/play", icon: Gamepad2, label: "PLAY" },
    { id: "bang", path: "/dashboard", icon: Zap, label: "BANG", home: true },
    { id: "shop", path: "/shop", icon: ShoppingBag, label: "SHOP" },
    { id: "swap", path: "/swap", icon: ArrowRightLeft, label: "SWAP" },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-cyan-400/10 bg-[#0a0f1f]"
      data-testid="tab-navigation"
    >
      <div className="mx-auto max-w-lg px-2 py-2">
        <div className="grid grid-cols-5 items-end gap-1 rounded-t-2xl bg-[#0d1328] px-2 py-2 shadow-[0_-8px_30px_rgba(0,0,0,0.35)]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path;

            if (tab.home) {
              return (
                <motion.button
                  key={tab.id}
                  data-testid={`tab-${tab.id}`}
                  onClick={() => navigate("/dashboard")}
                  className={`relative flex flex-col items-center justify-center rounded-2xl px-2 py-3 transition-all ${
                    isActive
                      ? "bg-[#131d3d] text-cyan-300 shadow-[inset_0_2px_10px_rgba(0,0,0,0.45),0_0_18px_rgba(34,211,238,0.12)]"
                      : "bg-[#10182f] text-white/85 shadow-[inset_0_2px_10px_rgba(0,0,0,0.35)]"
                  }`}
                  whileTap={{ scale: 0.96 }}
                >
                  {/* subtle concave highlight */}
                  <div className="pointer-events-none absolute inset-x-3 top-1 h-3 rounded-full bg-white/5 blur-sm" />
                  <motion.div
                    animate={
                      isActive
                        ? {
                            filter: [
                              "drop-shadow(0 0 4px rgba(34,211,238,0.35))",
                              "drop-shadow(0 0 10px rgba(34,211,238,0.65))",
                              "drop-shadow(0 0 4px rgba(34,211,238,0.35))",
                            ],
                          }
                        : {}
                    }
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Icon className="mb-1 h-6 w-6" />
                  </motion.div>
                  <span className="text-[10px] font-semibold tracking-[0.16em]">
                    BANG
                  </span>
                </motion.button>
              );
            }

            return (
              <motion.button
                key={tab.id}
                data-testid={`tab-${tab.id}`}
                onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center justify-center rounded-xl px-2 py-3 text-[10px] font-medium tracking-[0.14em] transition-all ${
                  isActive
                    ? "text-cyan-400"
                    : "text-white/45 hover:text-white/75"
                }`}
                whileTap={{ scale: 0.96 }}
              >
                <motion.div
                  animate={
                    isActive
                      ? {
                          filter: [
                            "drop-shadow(0 0 4px rgba(34,211,238,0.30))",
                            "drop-shadow(0 0 8px rgba(34,211,238,0.55))",
                            "drop-shadow(0 0 4px rgba(34,211,238,0.30))",
                          ],
                        }
                      : {}
                  }
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Icon className="mb-1 h-5 w-5" />
                </motion.div>
                <span>{tab.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}