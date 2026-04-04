import React from "react";
import { Wifi, WifiOff } from "lucide-react";

export default function OfflineNotice({ isOnline }) {
  return (
    <div
      className={`flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-semibold backdrop-blur-sm ${
        isOnline
          ? "border-green-400/20 bg-green-500/10 text-green-300"
          : "border-yellow-400/20 bg-yellow-500/10 text-yellow-300"
      }`}
    >
      {isOnline ? (
        <Wifi className="h-3 w-3" />
      ) : (
        <WifiOff className="h-3 w-3" />
      )}

      {isOnline ? "Online" : "Offline"}
    </div>
  );
}