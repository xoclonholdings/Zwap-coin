import React from "react";

function renderOnboardingLine(line) {
  const parts = String(line).split(
    /(ZWAP!|zPts|SHOP|SWAP|MOVE|PLAY|EARN TODAY)/g
  );

  return parts.map((part, index) => {
    if (part === "ZWAP!") {
      return (
        <span
          key={`${part}-${index}`}
          className="bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(34,211,238,0.35)]"
        >
          ZWAP!
        </span>
      );
    }

    if (part === "zPts") {
      return (
        <span
          key={`${part}-${index}`}
          className="bg-gradient-to-r from-lime-200 via-cyan-300 to-emerald-300 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(45,212,191,0.35)]"
        >
          zPts
        </span>
      );
    }

    if (part === "SHOP") {
      return (
        <span
          key={`${part}-${index}`}
          className="bg-gradient-to-r from-cyan-200 via-cyan-300 to-teal-300 bg-clip-text text-transparent drop-shadow-[0_0_16px_rgba(34,211,238,0.35)]"
        >
          SHOP
        </span>
      );
    }

    if (part === "SWAP") {
      return (
        <span
          key={`${part}-${index}`}
          className="bg-gradient-to-r from-cyan-300 via-teal-300 to-blue-300 bg-clip-text text-transparent drop-shadow-[0_0_16px_rgba(34,211,238,0.35)]"
        >
          SWAP
        </span>
      );
    }

    if (part === "MOVE" || part === "PLAY" || part === "EARN TODAY") {
      return (
        <span
          key={`${part}-${index}`}
          className="text-cyan-300 drop-shadow-[0_0_16px_rgba(34,211,238,0.30)]"
        >
          {part}
        </span>
      );
    }

    return part;
  });
}

export default function OnboardingVoiceText({ lines = [] }) {
  return (
    <div className="flex w-full max-w-[320px] flex-col items-center justify-center gap-3 overflow-visible">
      {lines.map((line) => (
        <div
          key={line}
          className="w-full break-words text-center text-[2rem] font-black leading-[1.08] tracking-[-0.065em] text-white drop-shadow-[0_0_18px_rgba(255,255,255,0.08)]"
        >
          {renderOnboardingLine(line)}
        </div>
      ))}
    </div>
  );
}
