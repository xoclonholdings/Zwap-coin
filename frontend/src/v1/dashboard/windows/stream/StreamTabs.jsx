import React from "react";
import { Headphones, Music2, Radio } from "lucide-react";
import { motion } from "framer-motion";

const tabs = [
  { id: "zwap-radio", label: "ZWAP! Radio", icon: Radio },
  { id: "spotify", label: "Spotify", icon: Headphones },
  { id: "apple-music", label: "Apple Music", icon: Music2 },
];

export default function StreamTabs({ activeTab, setActiveTab }) {
  return (
    <div className="flex gap-2">
      {tabs.map((tab, index) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <motion.button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            whileTap={{ scale: 0.98 }}
            className={[
              "flex-1 rounded-2xl border px-2 py-2 text-left text-xs font-black",
              isActive
                ? "border-cyan-300/40 bg-cyan-400/15 text-white"
                : "border-white/10 bg-white/[0.04] text-white/50",
            ].join(" ")}
          >
            <span className="flex items-center gap-1.5">
              <Icon size={13} />
              <span>
                {index + 1}. {tab.label}
              </span>
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}