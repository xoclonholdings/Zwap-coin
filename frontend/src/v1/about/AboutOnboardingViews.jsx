import React from "react";
import { motion } from "framer-motion";

import OnboardingActionButton from "@/v1/onboarding/OnboardingActionButton";
import OnboardingShell from "@/v1/onboarding/OnboardingShell";
import OnboardingVoiceText from "@/v1/onboarding/OnboardingVoiceText";

import moveBoost3h from "@/assets/shop/move/3H_move_boost_item.PNG";
import moveBoost12h from "@/assets/shop/move/12h_move_boost_item.PNG";
import playBoost3h from "@/assets/shop/play/3h_play_boost_item.PNG";
import playBoost12h from "@/assets/shop/play/12h_play_boost_item.PNG";
import ebookItem from "@/assets/shop/ebooks/tldr_ebook_item.PNG";
import bronzeRing from "@/assets/shop/profile/bronze_ring_item.PNG";
import goldRing from "@/assets/shop/profile/gold_ring_item.PNG";
import diamondRing from "@/assets/shop/profile/diamond_ring_item.PNG";

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

export function ActionProofView() {
  return (
    <motion.div
      key="action-proof"
      initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: 8, filter: "blur(8px)" }}
      transition={{ duration: 0.6 }}
      className="flex w-full max-w-[320px] flex-col items-center gap-5"
    >
      <OnboardingVoiceText lines={["Actions unlock", "boosts."]} />

      <div className="grid grid-cols-2 gap-4">
        <ProofItem src={moveBoost3h} label="3H Move Boost" delay={0.05} />
        <ProofItem src={playBoost3h} label="3H Play Boost" delay={0.15} />
      </div>
    </motion.div>
  );
}

export function ShopProofView() {
  return (
    <motion.div
      key="shop-proof"
      initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: 8, filter: "blur(8px)" }}
      transition={{ duration: 0.6 }}
      className="flex w-full max-w-[330px] flex-col items-center gap-5"
    >
      <OnboardingVoiceText lines={["Use zPts", "in the SHOP."]} />

      <div className="grid grid-cols-2 gap-4">
        <ProofItem src={ebookItem} label="TLDR Ebook" delay={0.05} />
        <ProofItem src={moveBoost12h} label="12H Move Boost" delay={0.12} />
        <ProofItem src={playBoost12h} label="12H Play Boost" delay={0.19} />
        <ProofItem src={bronzeRing} label="Bronze Ring" delay={0.26} />
      </div>
    </motion.div>
  );
}

export function AnchorView() {
  return (
    <motion.div
      key="anchor"
      initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: 8, filter: "blur(8px)" }}
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

export function FinalContinueView({ finalState, onMove, onPlay }) {
  const lines = finalState?.lines || [];
  const showMove = Boolean(finalState?.showMove);
  const showPlay = Boolean(finalState?.showPlay);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
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