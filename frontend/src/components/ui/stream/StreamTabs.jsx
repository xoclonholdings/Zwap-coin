import React from "react";
import { BookOpen, Headphones, Radio, Video } from "lucide-react";
import { motion } from "framer-motion";

const tabs = [
  { id: "watch", label: "Watch", icon: Video },
  { id: "listen", label: "Listen", icon: Headphones },
  { id: "live", label: "Live", icon: Radio },
  { id: "library", label: "Library", icon: BookOpen },
];

export default function StreamTabs({ activeTab, setActiveTab }) {
  return (
    <div className="grid grid-cols-4 gap-2 rounded-[22px] border border-white/6 bg-white/[0.03] p-1.5">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            whileTap={{ scale: 0.98 }}
            className={`rounded-2xl px-2 py-3 text-[11px] font-medium transition-all ${
              isActive
                ? "border border-cyan-400/30 bg-gradient-to-r from-cyan-500/20 via-sky-500/15 to-purple-500/20 text-white shadow-[0_0_18px_rgba(34,211,238,0.12)]"
                : "border border-transparent bg-white/[0.02] text-gray-400 hover:bg-white/[0.05] hover:text-gray-200"
            }`}
          >
            <div className="flex flex-col items-center gap-1.5">
              <Icon className="h-4 w-4" />
              <span className="leading-none">{tab.label}</span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}