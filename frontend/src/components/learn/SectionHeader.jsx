import React from "react";

export default function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  colorClass = "text-cyan-300",
}) {
  return (
    <div className="mb-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${colorClass}`} />
        <h3 className="text-white font-semibold">{title}</h3>
      </div>
      {subtitle ? <p className="text-sm text-gray-400">{subtitle}</p> : null}
    </div>
  );
}