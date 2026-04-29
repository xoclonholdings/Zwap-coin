import React from "react";
import { motion } from "framer-motion";

import OnboardingShell from "@/v1/onboarding/OnboardingShell";

import moveBoost12h from "@/assets/shop/move/12h_move_boost_item.png";
import playBoost12h from "@/assets/shop/play/12h_play_boost_item.png";
import ebookItem from "@/assets/shop/ebooks/tldr_ebook_item.png";
import bronzeRing from "@/assets/shop/profile/bronze_ring_item.png";

import zptsCoin from "@/assets/coin/zpts_coin.png";
import zwapCoin from "@/assets/coin/zwap_token.png";

function renderGradientLine(line) {
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
  return <OnboardingShell>{children}</OnboardingShell>;
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
      id: "ebook",
      src: ebookItem,
      alt: "TLDR ebook item",
      className: "left-[22px] top-[26px] h-[104px] w-[104px]",
      initial: { opacity: 0, y: -70, scale: 0.92, rotate: -7 },
      animate: { opacity: 1, y: 0, scale: 1, rotate: -4 },
      delay: 0.1,
    },
    {
      id: "move-boost",
      src: moveBoost12h,
      alt: "Move boost item",
      className: "right-[22px] top-[26px] h-[104px] w-[104px]",
      initial: { opacity: 0, x: 80, scale: 0.92, rotate: 7 },
      animate: { opacity: 1, x: 0, scale: 1, rotate: 4 },
      delay: 0.32,
    },
    {
      id: "play-boost",
      src: playBoost12h,
      alt: "Play boost item",
      className: "left-[22px] top-[138px] h-[104px] w-[104px]",
      initial: { opacity: 0, x: -80, scale: 0.92, rotate: -7 },
      animate: { opacity: 1, x: 0, scale: 1, rotate: -4 },
      delay: 0.54,
    },
    {
      id: "bronze-ring",
      src: bronzeRing,
      alt: "Bronze ring item",
      className: "right-[22px] top-[138px] h-[104px] w-[104px]",
      initial: { opacity: 0, y: 80, scale: 0.92, rotate: 7 },
      animate: { opacity: 1, y: 0, scale: 1, rotate: 4 },
      delay: 0.76,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: 8, filter: "blur(8px)" }}
      transition={{ duration: 0.55 }}
      className="relative h-[350px] w-[280px]"
    >
      <div className="absolute left-1/2 top-[8px] h-[250px] w-[260px] -translate-x-1/2 rounded-[34px] border border-cyan-300/10 bg-white/[0.035] shadow-[0_0_50px_rgba(34,211,238,0.13)] backdrop-blur-md" />

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
        transition={{ duration: 0.5, delay: 1.45 }}
        className="absolute bottom-[18px] left-0 right-0 text-center text-[1.15rem] font-black tracking-[-0.04em] text-white/85 drop-shadow-[0_0_18px_rgba(255,255,255,0.12)]"
      >
        ...and much more.
      </motion.div>
    </motion.div>
  );
}

export function CoinProofView() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 1.03, filter: "blur(8px)" }}
      transition={{ duration: 0.65 }}
      className="flex max-w-[330px] flex-col items-center gap-5 text-center"
    >
      <div className="flex items-center justify-center gap-5">
        {[zptsCoin, zwapCoin].map((coin, index) => (
          <motion.img
            key={coin}
            src={coin}
            alt={index === 0 ? "zPts coin" : "ZWAP coin"}
            initial={{ opacity: 0, y: -80, rotate: -180, scale: 0.72 }}
            animate={{
              opacity: 1,
              y: 0,
              rotate: 360,
              scale: 1,
            }}
            transition={{
              duration: 0.9,
              delay: index * 0.22,
              type: "spring",
              stiffness: 95,
              damping: 12,
            }}
            className="h-[112px] w-[112px] object-contain drop-shadow-[0_0_28px_rgba(34,211,238,0.35)]"
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.75 }}
        className="text-center text-[2rem] font-black leading-[1.03] tracking-[-0.065em] text-white"
      >
        {renderGradientLine("SWAP for ZWAP!")}
      </motion.div>
    </motion.div>
  );
}