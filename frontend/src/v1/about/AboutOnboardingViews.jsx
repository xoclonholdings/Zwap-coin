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
      className="flex w-full max-w-[300px] flex-col items-center justify-center gap-3 px-2"
    >
      {lines.map((line) => (
        <div
          key={line}
          className="w-full text-center text-[1.92rem] font-black leading-[1.08] tracking-[-0.055em] text-white drop-shadow-[0_0_18px_rgba(255,255,255,0.08)]"
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
    </motion.div>
  );
}

export function ShopProofView() {
  const items = [
    {
      id: "ebook",
      src: ebookItem,
      className: "left-[22px] top-[26px] h-[104px] w-[104px]",
    },
    {
      id: "move-boost",
      src: moveBoost12h,
      className: "right-[22px] top-[26px] h-[104px] w-[104px]",
    },
    {
      id: "play-boost",
      src: playBoost12h,
      className: "left-[22px] top-[138px] h-[104px] w-[104px]",
    },
    {
      id: "bronze-ring",
      src: bronzeRing,
      className: "right-[22px] top-[138px] h-[104px] w-[104px]",
    },
  ];

  return (
    <motion.div className="relative h-[350px] w-[280px]">
      {items.map((item) => (
        <div key={item.id} className={`absolute ${item.className}`}>
          <img src={item.src} className="h-full w-full object-cover" />
        </div>
      ))}
    </motion.div>
  );
}

export function CoinProofView() {
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex gap-5">
        <img src={zptsCoin} className="h-[112px]" />
        <img src={zwapCoin} className="h-[112px]" />
      </div>
    </div>
  );
}