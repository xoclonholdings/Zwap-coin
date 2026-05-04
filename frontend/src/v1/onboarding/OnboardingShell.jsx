import React from "react";

export default function OnboardingShell({ children }) {
  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.18),_rgba(8,10,22,0.96)_58%,_rgba(0,0,0,1)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(180,134,255,0.08),_transparent_35%,_rgba(34,211,238,0.08))]" />

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6 text-center">
        {children}
      </div>
    </div>
  );
}