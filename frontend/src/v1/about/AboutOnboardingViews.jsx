import React from "react";
import { motion } from "framer-motion";

import boostItem from "../../assets/boost_item.png";
import ebookItem from "../../assets/ebook_item.png";
import ringItem from "../../assets/ring_item.png";

function renderGradientLine(line) {
  const parts = String(line).split(/(ZWAP!|zPts|SHOP|SWAP|MOVE|PLAY|EARN TODAY)/g);

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
          className="bg-gradient-to-r from-purple-200 via-pink-300 to-cyan-200 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(180,134,255,0.35)]"
        >
          SHOP
        </span>
      );
    }

    if (part === "SWAP") {
      return (
        <span
          key={`${part}-${index}`}
          className="bg-gradient-to-r from-cyan-200 via-blue-300 to-purple-300 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(34,211,238,0.35)]"
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

export function AboutShell({ children }) {
  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.18),_rgba(8,10,22,0.96)_58%,_rgba(0,0,0,1)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(180,134,255,0.08),_transparent_35%,_rgba(34,211,238,0.08))]" />

      <div className="absolute left-1/2 top-1/2 h-[560px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-[42px] border border-cyan-300/10 bg-white/[0.025] shadow-[0_0_90px_rgba(34,211,238,0.22)]" />

      <div className="relative z-10 flex min-h-[560px] w-full max-w-[460px] flex-col items-center justify-center px-10 text-center">
        {children}
      </div>
    </div>
  );
}

export function AboutControls({ isPaused, onPause, onNext }) {
  return (
    <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-4">
      <button
        type="button"
        onClick={onPause}
        aria-label={isPaused ? "Resume" : "Pause"}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 backdrop-blur-md transition active:scale-95"
      >
        {isPaused ? (
          <span className="ml-[2px] text-[15px]">▶</span>
        ) : (
          <span className="text-[15px]">Ⅱ</span>
        )}
      </button>

      <button
        type="button"
        onClick={onNext}
        aria-label="Next"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10 text-cyan-100 backdrop-blur-md transition active:scale-95"
      >
        <span className="ml-[2px] text-[15px]">▶</span>
      </button>
    </div>
  );
}

export function VoiceView({ lines }) {
  return (
    <motion.div
      key={lines.join("-")}
      initial={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 1.03, filter: "blur(8px)" }}
      transition={{ duration: 0.65 }}
      className="flex max-w-[330px] flex-col items-center justify-center gap-3"
    >
      {lines.map((line) => (
        <div
          key={line}
          className="text-center text-[2.15rem] font-black leading-[1.03] tracking-[-0.065em] text-white drop-shadow-[0_0_18px_rgba(255,255,255,0.08)]"
        >
          {renderGradientLine(line)}
        </div>
      ))}
    </motion.div>
  );
}

export function ActionProofView() {
  const roundFrames = [
    { round: "Round 1", zpts: "+10" },
    { round: "Round 2", zpts: "+25" },
    { round: "Round 3", zpts: "+50" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: 8, filter: "blur(8px)" }}
      transition={{ duration: 0.55 }}
      className="flex w-full max-w-[320px] flex-col items-center gap-5"
    >
      <motion.div
        animate={{
          boxShadow: [
            "0 0 28px rgba(34,211,238,0.10)",
            "0 0 46px rgba(34,211,238,0.20)",
            "0 0 28px rgba(34,211,238,0.10)",
          ],
        }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-[28px] border border-cyan-300/15 bg-white/[0.06] px-5 py-5 text-center backdrop-blur-md"
      >
        <div>
          <motion.div
            animate={{ opacity: [1, 0, 1, 0, 1, 0, 1] }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="text-2xl font-black tracking-[-0.05em] text-white"
          >
            20
          </motion.div>
          <div className="mt-1 text-[10px] font-black tracking-[0.22em] text-white/45">
            STEPS
          </div>
        </div>

        <div className="h-10 w-px bg-white/15" />

        <div>
          <motion.div
            animate={{ opacity: [1, 0, 1, 0, 1, 0, 1] }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="bg-gradient-to-r from-lime-200 via-cyan-300 to-emerald-300 bg-clip-text text-2xl font-black tracking-[-0.05em] text-transparent"
          >
            +50
          </motion.div>
          <div className="mt-1 text-[10px] font-black tracking-[0.22em] text-white/45">
            zPTS
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0.78 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="w-full rounded-[28px] border border-purple-300/15 bg-white/[0.06] px-5 py-5 text-center shadow-[0_0_42px_rgba(180,134,255,0.14)] backdrop-blur-md"
      >
        <div className="mb-4 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2">
          {roundFrames.map((frame, index) => (
            <React.Fragment key={frame.round}>
              <motion.div
                initial={{ opacity: 0.35, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.42,
                  delay: 0.35 + index * 0.45,
                  repeat: Infinity,
                  repeatDelay: 2.1,
                }}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-2 py-3"
              >
                <div className="text-[12px] font-black tracking-[-0.03em] text-white">
                  {frame.round}
                </div>
                <div className="mt-1 bg-gradient-to-r from-lime-200 via-cyan-300 to-emerald-300 bg-clip-text text-[13px] font-black tracking-[-0.03em] text-transparent">
                  {frame.zpts}
                </div>
              </motion.div>

              {index < roundFrames.length - 1 && (
                <div className="text-sm font-black text-cyan-200/70">&gt;</div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="text-[10px] font-black tracking-[0.22em] text-white/45">
          ROUNDS BUILD zPTS
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ShopProofView() {
  const items = [
    {
      id: "boost",
      src: boostItem,
      alt: "Boost item",
      className: "left-1/2 top-[18px] h-[112px] w-[112px] -translate-x-1/2",
      initial: { opacity: 0, y: -70, scale: 0.92, rotate: -4 },
      animate: { opacity: 1, y: 0, scale: 1, rotate: 0 },
      delay: 0.1,
    },
    {
      id: "ebook",
      src: ebookItem,
      alt: "eBook item",
      className: "left-[20px] top-[122px] h-[104px] w-[104px]",
      initial: { opacity: 0, x: -80, scale: 0.92, rotate: -7 },
      animate: { opacity: 1, x: 0, scale: 1, rotate: -4 },
      delay: 0.38,
    },
    {
      id: "ring",
      src: ringItem,
      alt: "Ring item",
      className: "right-[20px] top-[122px] h-[104px] w-[104px]",
      initial: { opacity: 0, y: 80, scale: 0.92, rotate: 7 },
      animate: { opacity: 1, y: 0, scale: 1, rotate: 4 },
      delay: 0.66,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: 8, filter: "blur(8px)" }}
      transition={{ duration: 0.55 }}
      className="relative h-[330px] w-[280px]"
    >
      <div className="absolute left-1/2 top-[8px] h-[236px] w-[260px] -translate-x-1/2 rounded-[34px] border border-cyan-300/10 bg-white/[0.035] shadow-[0_0_50px_rgba(34,211,238,0.13)] backdrop-blur-md" />

      {items.map((item) => (
        <motion.div
          key={item.id}
          initial={item.initial}
          animate={item.animate}
          transition={{
            duration: 0.7,
            delay: item.delay,
            ease: "easeOut",
          }}
          className={`absolute z-10 rounded-[26px] border border-white/10 bg-black/20 p-2 shadow-[0_0_36px_rgba(34,211,238,0.12)] ${item.className}`}
        >
          <img
            src={item.src}
            alt={item.alt}
            className="h-full w-full rounded-[20px] object-cover"
          />
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.15 }}
        className="absolute bottom-[18px] left-0 right-0 text-center text-[1.15rem] font-black tracking-[-0.04em] text-white/85 drop-shadow-[0_0_18px_rgba(255,255,255,0.12)]"
      >
        ...and much more.
      </motion.div>
    </motion.div>
  );
}

export function AnchorView() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 1.03, filter: "blur(8px)" }}
      transition={{ duration: 0.65 }}
      className="flex max-w-[330px] flex-col items-center gap-3 text-center"
    >
      <div className="text-3xl font-black leading-[1.02] tracking-[-0.06em] text-white">
        So{" "}
        <span className="text-cyan-300 drop-shadow-[0_0_16px_rgba(34,211,238,0.30)]">
          MOVE
        </span>{" "}
        or{" "}
        <span className="text-cyan-300 drop-shadow-[0_0_16px_rgba(34,211,238,0.30)]">
          PLAY
        </span>
        ...
      </div>

      <div className="mt-2 text-3xl font-black leading-[1.02] tracking-[-0.06em] text-white">
        You can{" "}
        <span className="text-cyan-300 drop-shadow-[0_0_16px_rgba(34,211,238,0.30)]">
          EARN TODAY.
        </span>
      </div>
    </motion.div>
  );
}

export function FinalContinueView({
  hasTriedMove = false,
  hasTriedPlay = false,
  onMove,
  onPlay,
}) {
  const showMove = !hasTriedMove;
  const showPlay = !hasTriedPlay;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.65 }}
      className="flex w-full max-w-[320px] flex-col items-center gap-5"
    >
      {showMove && showPlay && (
        <div className="flex w-full gap-4">
          <button
            type="button"
            onClick={onMove}
            className="flex-1 rounded-2xl border border-cyan-300/45 bg-cyan-300/15 px-6 py-4 text-lg font-black text-cyan-100 shadow-[0_0_28px_rgba(34,211,238,0.16)]"
          >
            Move
          </button>

          <button
            type="button"
            onClick={onPlay}
            className="flex-1 rounded-2xl border border-purple-300/45 bg-purple-400/15 px-6 py-4 text-lg font-black text-purple-100 shadow-[0_0_28px_rgba(180,134,255,0.16)]"
          >
            Play
          </button>
        </div>
      )}

      {showMove && !showPlay && (
        <button
          type="button"
          onClick={onMove}
          className="w-full rounded-2xl border border-cyan-300/45 bg-cyan-300/15 px-6 py-4 text-lg font-black text-cyan-100 shadow-[0_0_28px_rgba(34,211,238,0.16)]"
        >
          Move
        </button>
      )}

      {!showMove && showPlay && (
        <button
          type="button"
          onClick={onPlay}
          className="w-full rounded-2xl border border-purple-300/45 bg-purple-400/15 px-6 py-4 text-lg font-black text-purple-100 shadow-[0_0_28px_rgba(180,134,255,0.16)]"
        >
          Play
        </button>
      )}
    </motion.div>
  );
}