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
          className="bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent"
        >
          ZWAP!
        </span>
      );
    }

    if (part === "zPts") {
      return (
        <span
          key={`${part}-${index}`}
          className="bg-gradient-to-r from-lime-200 via-cyan-300 to-emerald-300 bg-clip-text text-transparent"
        >
          zPts
        </span>
      );
    }

    if (part === "SHOP") {
      return (
        <span
          key={`${part}-${index}`}
          className="bg-gradient-to-r from-purple-200 via-pink-300 to-cyan-200 bg-clip-text text-transparent"
        >
          SHOP
        </span>
      );
    }

    if (part === "SWAP") {
      return (
        <span
          key={`${part}-${index}`}
          className="bg-gradient-to-r from-cyan-200 via-blue-300 to-purple-300 bg-clip-text text-transparent"
        >
          SWAP
        </span>
      );
    }

    if (part === "MOVE" || part === "PLAY" || part === "EARN TODAY") {
      return (
        <span key={`${part}-${index}`} className="text-cyan-300">
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
      className="flex max-w-[340px] flex-col items-center justify-center gap-3"
    >
      {lines.map((line) => (
        <div
          key={line}
          className="text-center text-[2.2rem] font-black leading-[1.05] tracking-[-0.06em] text-white"
        >
          {renderGradientLine(line)}
        </div>
      ))}
    </motion.div>
  );
}

/* =========================
   🔥 FIXED SHOP VIEW
========================= */

export function ShopProofView() {
  const items = [
    {
      id: "ebook",
      src: ebookItem,
      className: "left-[20px] top-[20px]",
    },
    {
      id: "move",
      src: moveBoost12h,
      className: "right-[20px] top-[20px]",
    },
    {
      id: "play",
      src: playBoost12h,
      className: "left-[20px] bottom-[20px]",
    },
    {
      id: "ring",
      src: bronzeRing,
      className: "right-[20px] bottom-[20px]",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="relative h-[420px] w-[340px]"   // 🔥 BIGGER CONTAINER
    >
      {/* BACK PANEL */}
      <div className="absolute inset-0 rounded-[36px] border border-cyan-300/10 bg-white/[0.04] backdrop-blur-md" />

      {/* ITEMS */}
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: 0.2 + i * 0.15,
            duration: 0.45,
          }}
          className={`absolute ${item.className} h-[140px] w-[140px]`} // 🔥 BIGGER ITEMS
        >
          <img
            src={item.src}
            alt=""
            className="h-full w-full rounded-[22px] object-cover"
          />
        </motion.div>
      ))}

      {/* TEXT */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-[16px] left-0 right-0 text-center text-[1.2rem] font-black text-white/85"
      >
        ...and much more.
      </motion.div>
    </motion.div>
  );
}

/* ========================= */

export function CoinProofView() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.65 }}
      className="flex max-w-[340px] flex-col items-center gap-5 text-center"
    >
      <div className="flex items-center justify-center gap-6">
        {[zptsCoin, zwapCoin].map((coin, index) => (
          <motion.img
            key={coin}
            src={coin}
            initial={{ opacity: 0, y: -80, rotate: -180, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, rotate: 360, scale: 1 }}
            transition={{
              duration: 0.8,
              delay: index * 0.2,
            }}
            className="h-[120px] w-[120px] object-contain"
          />
        ))}
      </div>

      <div className="text-[2rem] font-black text-white">
        {renderGradientLine("SWAP for ZWAP!")}
      </div>
    </motion.div>
  );
}