import React from "react";
import { motion } from "framer-motion";

import boostItem from "../../assets/boost_item.png";
import ebookItem from "../../assets/ebook_item.png";
import mysteryboxItem from "../../assets/mysterybox_item.png";
import ringItem from "../../assets/ring_item.png";

/* ---------------- TEXT ---------------- */

function renderGradientLine(line) {
  const parts = String(line).split(
    /(ZWAP!|zPts|SHOP|SWAP|MOVE|PLAY|EARN TODAY)/g
  );

  return parts.map((part, index) => {
    if (part === "ZWAP!") {
      return (
        <span key={index} className="bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
          ZWAP!
        </span>
      );
    }

    if (part === "zPts") {
      return (
        <span key={index} className="bg-gradient-to-r from-lime-200 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
          zPts
        </span>
      );
    }

    if (part === "SHOP") {
      return (
        <span key={index} className="bg-gradient-to-r from-purple-200 via-pink-300 to-cyan-200 bg-clip-text text-transparent">
          SHOP
        </span>
      );
    }

    if (part === "SWAP") {
      return (
        <span key={index} className="bg-gradient-to-r from-cyan-200 via-blue-300 to-purple-300 bg-clip-text text-transparent">
          SWAP
        </span>
      );
    }

    if (part === "MOVE" || part === "PLAY" || part === "EARN TODAY") {
      return (
        <span key={index} className="text-cyan-300">
          {part}
        </span>
      );
    }

    return part;
  });
}

/* ---------------- GUIDANCE ---------------- */

function getFinalGuidance({ hasTriedMove, hasTriedPlay }) {
  if (hasTriedMove && !hasTriedPlay) return ["Now try", "PLAY."];
  if (!hasTriedMove && hasTriedPlay) return ["Now try", "MOVE."];
  if (!hasTriedMove && !hasTriedPlay) return ["Choose your", "next action."];
  return null;
}

/* ---------------- BUTTON ---------------- */

function OnboardingActionButton({ type = "move", onClick, full = false }) {
  const isMove = type === "move";

  const label = isMove ? "Move" : "Play";
  const eyebrow = isMove ? "STEP INTO VALUE" : "ENTER THE ARCADE";

  const color = isMove
    ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.2)]"
    : "border-purple-300/40 bg-purple-400/10 text-purple-100 shadow-[0_0_24px_rgba(168,85,247,0.2)]";

  const dot = isMove ? "bg-cyan-300" : "bg-purple-300";

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className={[
        "relative rounded-2xl border px-5 py-5 text-left transition",
        "flex flex-col justify-center",
        full ? "w-full" : "flex-1",
        color,
      ].join(" ")}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        <div className="text-[9px] font-bold tracking-[0.22em] text-white/50">
          {eyebrow}
        </div>
      </div>

      <div className="text-[1.35rem] font-black tracking-[-0.04em] text-white">
        {label}
      </div>
    </motion.button>
  );
}

/* ---------------- SHELL ---------------- */

export function AboutShell({ children }) {
  return (
    <div className="relative flex h-screen w-full items-center justify-center bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(34,211,238,0.18),_rgba(0,0,0,1))]" />

      <div className="relative z-10 w-[360px] h-[560px] rounded-[42px] border border-cyan-300/10 bg-white/[0.03] flex items-center justify-center px-8 text-center">
        {children}
      </div>
    </div>
  );
}

/* ---------------- VOICE ---------------- */

export function VoiceView({ lines }) {
  return (
    <motion.div
      key={lines.join("-")}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center gap-2"
    >
      {lines.map((line) => (
        <div key={line} className="text-[2.1rem] font-black tracking-tight">
          {renderGradientLine(line)}
        </div>
      ))}
    </motion.div>
  );
}

/* ---------------- FINAL ---------------- */

export function FinalContinueView({
  hasTriedMove,
  hasTriedPlay,
  onMove,
  onPlay,
}) {
  const showMove = !hasTriedMove;
  const showPlay = !hasTriedPlay;

  const lines = getFinalGuidance({ hasTriedMove, hasTriedPlay });
  if (!lines) return null;

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-[320px]">
      <div className="flex flex-col items-center">
        {lines.map((line) => (
          <div key={line} className="text-[2rem] font-black">
            {renderGradientLine(line)}
          </div>
        ))}
      </div>

      {showMove && showPlay && (
        <div className="flex w-full gap-4">
          <OnboardingActionButton type="move" onClick={onMove} />
          <OnboardingActionButton type="play" onClick={onPlay} />
        </div>
      )}

      {showMove && !showPlay && (
        <OnboardingActionButton type="move" onClick={onMove} full />
      )}

      {!showMove && showPlay && (
        <OnboardingActionButton type="play" onClick={onPlay} full />
      )}
    </div>
  );
}