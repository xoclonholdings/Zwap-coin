import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Footprints, Gamepad2, ShoppingBag, ArrowRightLeft, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function TabNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: "move", path: "/move", icon: Footprints, label: "MOVE" },
    { id: "play", path: "/play", icon: Gamepad2, label: "PLAY" },
    { id: "bang", path: "/dashboard", icon: Zap, label: "BANG", center: true },
    { id: "shop", path: "/shop", icon: ShoppingBag, label: "SHOP" },
    { id: "swap", path: "/swap", icon: ArrowRightLeft, label: "SWAP" },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-3"
      data-testid="tab-navigation"
    >
      <div className="relative max-w-lg mx-auto">
        <div className="relative flex justify-between items-center px-6 py-3 rounded-[24px] bg-[#0b0c22]/90 backdrop-blur-xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path;

            if (tab.center) {
              return (
                <motion.button
                  key={tab.id}
                  data-testid={`tab-${tab.id}`}
                  onClick={() => navigate("/dashboard")}
                  className="absolute left-1/2 -translate-x-1/2 -top-7 flex flex-col items-center justify-center w-20 h-20"
                  whileTap={{ scale: 0.92 }}
                >
                  <motion.div
                    className={`flex items-center justify-center w-16 h-16 rounded-full border ${
                      isActive
                        ? "bg-gradient-to-br from-cyan-400 via-sky-400 to-purple-500 border-cyan-200/60"
                        : "bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 border-white/20"
                    } shadow-[0_8px_25px_rgba(0,0,0,0.35)]`}
                    animate={{
                      y: [0, -2, 0],
                      boxShadow: isActive
                        ? [
                            "0 0 16px rgba(34,211,238,0.45), 0 8px 25px rgba(0,0,0,0.35)",
                            "0 0 28px rgba(168,85,247,0.55), 0 10px 28px rgba(0,0,0,0.4)",
                            "0 0 16px rgba(34,211,238,0.45), 0 8px 25px rgba(0,0,0,0.35)",
                          ]
                        : [
                            "0 0 10px rgba(34,211,238,0.25), 0 8px 25px rgba(0,0,0,0.35)",
                            "0 0 18px rgba(168,85,247,0.35), 0 10px 28px rgba(0,0,0,0.4)",
                            "0 0 10px rgba(34,211,238,0.25), 0 8px 25px rgba(0,0,0,0.35)",
                          ],
                    }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Zap className="w-7 h-7 text-white" />
                  </motion.div>

                  <span className="mt-1 text-[10px] font-semibold tracking-wide text-white/90">
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
                className={`flex flex-col items-center justify-center min-w-[56px] pt-1 text-[10px] font-medium tracking-wide transition-all ${
                  isActive ? "text-cyan-400" : "text-gray-500 hover:text-gray-300"
                }`}
                whileTap={{ scale: 0.92 }}
              >
                <motion.div
                  animate={
                    isActive
                      ? {
                          filter: [
                            "drop-shadow(0 0 4px rgba(34,211,238,0.35))",
                            "drop-shadow(0 0 10px rgba(34,211,238,0.75))",
                            "drop-shadow(0 0 4px rgba(34,211,238,0.35))",
                          ],
                        }
                      : {}
                  }
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Icon className="w-5 h-5 mb-1" />
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