import React from "react";

export default function WalletIcon({ color, children }) {
  return (
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
      style={{ background: `${color}20` }}
    >
      {children}
    </div>
  );
}