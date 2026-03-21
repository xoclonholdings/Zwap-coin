import React from "react";

export default function SectionTab({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
        active
          ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
          : "text-gray-400 hover:text-white hover:bg-gray-800/50"
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}