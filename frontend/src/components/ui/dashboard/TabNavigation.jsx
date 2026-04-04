import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ZWAP_BANG } from "@/App";
import {
  Footprints,
  Gamepad2,
  ShoppingBag,
  ArrowRightLeft,
} from "lucide-react";
import { motion } from "framer-motion";

export default function TabNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: "move", path: "/move", icon: Footprints, label: "MOVE" },
    { id: "play", path: "/play", icon: Gamepad2, label: "PLAY" },
    { id: "bang", path: "/dashboard", home: true },
    { id: "shop", path: "/shop", icon: ShoppingBag, label: "SHOP" },
    { id: "swap", path: "/swap", icon: ArrowRightLeft, label: "SWAP" },
  ];

  return (
    <nav
      className="relative z-40 border-t border-cyan-400/10 bg-[#08101d]"
      data-testid="tab-navigation"
    >
      <div className="mx-auto max-w-lg px-2 pt-1 pb-1">
        <div className="grid grid-cols-5 items-center gap-1 rounded-t-2xl bg-[#0d1328] px-2 py-1 shadow-[0_-8px_30px_rgba(0,0,0,0.45)]">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;

            if (tab.home) {
              return (
                <motion.button
                    key={tab.id}
                    data-testid={`tab-${tab.id}`}
                    onClick={() => navigate("/dashboard")}
                    className={`relative flex h-[54px] items-center justify-center rounded-2xl transition-all ${
                      isActive
                        ? "bg-[#131d3d] shadow-[inset_0_2px_10px_rgba(0,0,0,0.45),0_0_18px_rgba(34,211,238,0.12)]"
                        : "bg-[#10182f] shadow-[inset_0_2px_10px_rgba(0,0,0,0.35)]"
                    }`}
                    whileTap={{ scale: 0.96 }}
                  >
                    <div className="pointer-events-none absolute inset-x-3 top-1 h-3 rounded-full bg-white/5 blur-sm" />
                  
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                        isActive
                          ? "border-cyan-300/50 bg-cyan-400/10"
                          : "border-white/10 bg-white/5"
                      }`}
                    >
                      <motion.img
                        src={ZWAP_BANG}
                        alt="ZWAP Home"
                        className="h-9 w-9 object-contain"
                        animate={
                          isActive
                            ? {
                                scale: [1, 1.05, 1],
                                filter: [
                                  "drop-shadow(0 0 2px rgba(34,211,238,0.35))",
                                  "drop-shadow(0 0 6px rgba(34,211,238,0.55))",
                                  "drop-shadow(0 0 2px rgba(34,211,238,0.35))",
                                ],
                              }
                            : {
                                scale: [1, 1.02, 1],
                                filter: [
                                  "drop-shadow(0 0 1px rgba(34,211,238,0.14))",
                                  "drop-shadow(0 0 3px rgba(168,85,247,0.16))",
                                  "drop-shadow(0 0 1px rgba(34,211,238,0.14))",
                                ],
                              }
                        }
                        transition={{ duration: 2.2, repeat: Infinity }}
                            />
                          </div>
                        </motion.button>
                        );
            }
                        
            const Icon = tab.icon;

            return (
              <motion.button
                key={tab.id}
                data-testid={`tab-${tab.id}`}
                onClick={() => navigate(tab.path)}
                className={`flex h-[54px] flex-col items-center justify-center rounded-xl px-2 text-[10px] font-medium tracking-[0.14em] transition-all ${
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
