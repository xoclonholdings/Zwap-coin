import React from "react";
import { WifiOff, Wifi } from "lucide-react";

export default function OfflineNotice({ isOnline }) {
  if (isOnline) {
    return (
      <div className="w-full rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <Wifi className="w-4 h-4 text-green-400" />
          <p className="text-sm text-green-300 font-medium">
            Connected
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3">
      <div className="flex items-start gap-2">
        <WifiOff className="w-4 h-4 text-yellow-400 mt-0.5" />
        <div>
          <p className="text-sm text-yellow-300 font-medium">
            Offline Mode
          </p>
          <p className="text-xs text-yellow-200/80 mt-1 leading-relaxed">
            Learn, Move, and Play can still be used offline. Any reward activity
            will be saved locally and tallied once you reconnect.
          </p>
        </div>
      </div>
    </div>
  );
}
