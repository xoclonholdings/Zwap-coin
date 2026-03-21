import React from "react";

const COLOR_STYLES = {
  cyan: {
    card: "border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-transparent",
    iconWrap: "bg-cyan-500/20",
    icon: "text-cyan-400",
  },
  green: {
    card: "border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent",
    iconWrap: "bg-green-500/20",
    icon: "text-green-400",
  },
  purple: {
    card: "border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-transparent",
    iconWrap: "bg-purple-500/20",
    icon: "text-purple-400",
  },
  blue: {
    card: "border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-transparent",
    iconWrap: "bg-blue-500/20",
    icon: "text-blue-400",
  },
  red: {
    card: "border-red-500/30 bg-gradient-to-br from-red-500/10 to-transparent",
    iconWrap: "bg-red-500/20",
    icon: "text-red-400",
  },
};

export default function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  color = "cyan",
}) {
  const styles = COLOR_STYLES[color] || COLOR_STYLES.cyan;

  return (
    <div className={`p-4 rounded-xl border ${styles.card}`}>
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${styles.iconWrap}`}>
          <Icon className={`w-5 h-5 ${styles.icon}`} />
        </div>
      </div>

      <p className="text-2xl font-bold text-white mt-3">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
      {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
    </div>
  );
}