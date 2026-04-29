import React from "react";
import { motion } from "framer-motion";

import OnboardingActionButton from "@/v1/onboarding/OnboardingActionButton";
import OnboardingShell from "@/v1/onboarding/OnboardingShell";
import OnboardingVoiceText from "@/v1/onboarding/OnboardingVoiceText";

import moveBoost3h from "@/assets/shop/move/3H_move_boost_item.png";
import moveBoost12h from "@/assets/shop/move/12h_move_boost_item.png";
import playBoost3h from "@/assets/shop/play/3h_play_boost_item.png";
import playBoost12h from "@/assets/shop/play/12h_play_boost_item.png";
import ebookItem from "@/assets/shop/ebooks/tldr_ebook_item.png";
import bronzeRing from "@/assets/shop/profile/bronze_ring_item.png";
import goldRing from "@/assets/shop/profile/gold_ring_item.png";
import diamondRing from "@/assets/shop/profile/diamond_ring_item.png";

import zptsCoin from "@/assets/coin/zpts_coin.png";
import zwapCoin from "@/assets/coin/zwap_token.png";

function ProofItem({ src, label, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      className="flex h-[118px] w-[118px] items-center justify-center rounded-[28px] border border-cyan-300/10 bg-white/[0.045] shadow-[0_0_34px_rgba(34,211,238,0.14)]"
    >
      <img
        src={src}
        alt={label}
        className="max-h-[94px] max-w-[94px] object-contain drop-shadow-[0_0_20px_rgba(34,211,238,0.26)]"
      />
    </motion.div>
  );
}

function Coin({ src, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -80, rotate: -180, scale: 0.6 }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: 360,
        scale: 1,
      }}
      transition={{
        duration: 0.9,
        delay,
        type: "spring",
        stiffness: 90,
      }}
      className="flex h-[110px] w-[110px] items-center justify-center"
    >
      <motion.img
        src={src}
        className="h-[100px] w-[100px] object-contain drop-shadow-[0_0_28px_rgba(34,211,238,0.35)]"
        animate={{
          rotateY: [0, 360],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </motion.div>
  );
}

export function AboutShell({ children }) {
  return <OnboardingShell>{children}</OnboardingShell>;
}

export function VoiceView({ lines }) {
  return (
    <motion.div
      key={lines.join("-")}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <OnboardingVoiceText lines={lines} />
    </motion.div>
  );
}

/* ---------------- ACTION PROOF (SCREEN 2 FIX) ---------------- */

export function ActionProofView() {
  return (
    <motion.div
      key="action-proof"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="flex w-full max-w-[320px] flex-col items-center gap-6"
    >
      <OnboardingVoiceText lines={["Steps become", "zPts."]} />

      <div className="flex flex-col items-center gap-4 text-white/80 text-sm">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          1,240 steps → 120 zPts
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          Round 3 → 45 zPts
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          Round 7 → 90 zPts
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ---------------- SHOP PROOF (SCREEN 5 FIX) ---------------- */

export function ShopProofView() {
  return (
    <motion.div
      key="shop-proof"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="flex w-full max-w-[330px] flex-col items-center gap-5"
    >
      <OnboardingVoiceText lines={["Use zPts", "in the SHOP."]} />

      <div className="relative flex h-[260px] w-full items-center justify-center">
        {[ebookItem, moveBoost12h, playBoost12h, bronzeRing].map(
          (item, i) => (
            <motion.div
              key={i}
              initial={{
                opacity: 0,
                y: -120,
                scale: 0.7,
                rotate: -20,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                rotate: 0,
              }}
              transition={{
                delay: 0.15 * i,
                type: "spring",
                stiffness: 90,
              }}
              className="absolute"
              style={{
                transform: `translate(${(i - 1.5) * 60}px, ${
                  i % 2 === 0 ? -20 : 20
                }px)`,
              }}
            >
              <img
                src={item}
                className="h-[90px] w-[90px] object-contain"
              />
            </motion.div>
          )
        )}
      </div>
    </motion.div>
  );
}

/* ---------------- NEW COIN PROOF ---------------- */

export function CoinProofView() {
  return (
    <motion.div
      key="coin-proof"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="flex w-full max-w-[320px] flex-col items-center gap-6"
    >
      <OnboardingVoiceText lines={["Swap for", "ZWAP."]} />

      <div className="flex items-center justify-center gap-6">
        <Coin src={zptsCoin} delay={0.1} />
        <Coin src={zwapCoin} delay={0.3} />
      </div>
    </motion.div>
  );
}

/* ---------------- ANCHOR ---------------- */

export function AnchorView() {
  return (
    <motion.div
      key="anchor"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="flex w-full max-w-[330px] flex-col items-center gap-5"
    >
      <OnboardingVoiceText lines={["Progress becomes", "identity."]} />

      <div className="flex items-center justify-center gap-4">
        <ProofItem src={goldRing} label="Gold Ring" delay={0.05} />
        <ProofItem src={diamondRing} label="Diamond Ring" delay={0.15} />
      </div>
    </motion.div>
  );
}

/* ---------------- FINAL ---------------- */

export function FinalContinueView({ finalState, onMove, onPlay }) {
  const lines = finalState?.lines || [];
  const showMove = Boolean(finalState?.showMove);
  const showPlay = Boolean(finalState?.showPlay);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65 }}
      className="flex w-full max-w-[320px] flex-col items-center gap-5"
    >
      <OnboardingVoiceText lines={lines} />

      <div className="flex w-full flex-col items-center gap-4">
        {showMove && <OnboardingActionButton type="move" onClick={onMove} />}
        {showPlay && <OnboardingActionButton type="play" onClick={onPlay} />}
      </div>
    </motion.div>
  );
}