import React from "react";

export default function SectionTab({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
      ${
        active
          ? "bg-cyan-500/10 text-cyan-300 border border-cyan-400/20"
          : "text-gray-400 hover:text-white hover:bg-white/5"
      }`}
    >
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all
        ${
          active
            ? "bg-cyan-500/15 text-cyan-300"
            : "bg-gray-800/60 text-gray-500 group-hover:text-white"
        }`}
      >
        <Icon className="w-4 h-4" />
      </div>

      <span className="truncate">{label}</span>
    </button>
  );
}