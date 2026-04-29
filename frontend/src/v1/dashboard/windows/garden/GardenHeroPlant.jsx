import React from "react";
import { motion } from "framer-motion";

export default function GardenHeroPlant({ stage, healthState, rarePlantUnlocked }) {
  const isRare = rarePlantUnlocked || stage === "rare";
  const isWeak = healthState.key === "weak" || healthState.key === "wilted";
  const opacity = healthState.key === "wilted" ? 0.45 : 1;
  const droop =
    healthState.key === "wilted" ? 16 : healthState.key === "weak" ? 8 : 0;

  const showLeaves = stage !== "seed";
  const showSecondLeaves = ["young", "mature", "rare"].includes(stage);
  const showFlower = ["mature", "rare"].includes(stage);

  return (
    <div className="relative flex h-[270px] w-full items-end justify-center overflow-hidden rounded-[1.35rem] border border-lime-300/20 bg-[radial-gradient(circle_at_center,rgba(91,255,83,0.2),rgba(3,20,12,0.95)_58%,rgba(2,8,14,1))]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(145,255,99,0.2),transparent_28%),linear-gradient(to_bottom,rgba(255,255,255,0.04),transparent_38%)]" />

      {[...Array(18)].map((_, index) => (
        <motion.span
          key={index}
          className="absolute h-1 w-1 rounded-full bg-lime-200/80 shadow-[0_0_10px_rgba(166,255,111,0.85)]"
          style={{
            left: `${8 + ((index * 17) % 84)}%`,
            top: `${10 + ((index * 23) % 55)}%`,
          }}
          animate={{ opacity: [0.18, 0.85, 0.18], y: [0, -8, 0] }}
          transition={{
            duration: 2.2 + index * 0.18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.div
        className="absolute bottom-16 h-44 w-44 rounded-full blur-3xl"
        style={{
          background: isRare
            ? "radial-gradient(circle, rgba(255,122,231,0.45), rgba(124,255,91,0.28), transparent 70%)"
            : `radial-gradient(circle, ${healthState.glow}, transparent 72%)`,
        }}
        animate={{
          scale: isRare ? [1, 1.08, 1] : [1, 1.035, 1],
          opacity: isWeak ? [0.45, 0.58, 0.45] : [0.72, 0.95, 0.72],
        }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="absolute bottom-0 h-20 w-full bg-gradient-to-t from-black/70 to-transparent" />

      <motion.div
        className="relative z-10 mb-5 flex flex-col items-center"
        animate={{ y: isWeak ? [0, 1, 0] : [0, -5, 0] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="relative flex h-40 w-36 items-end justify-center">
          <div
            className="absolute bottom-4 h-32 w-2.5 rounded-full"
            style={{
              opacity: stage === "seed" ? 0.35 : opacity,
              transform: `rotate(${droop > 0 ? droop / 4 : 0}deg)`,
              background: isRare
                ? "linear-gradient(to top, #5dff8f, #ff7ae7)"
                : "linear-gradient(to top, #2e8f43, #a6ff6f)",
              boxShadow: isRare
                ? "0 0 24px rgba(255,122,231,0.55)"
                : "0 0 18px rgba(124,255,91,0.42)",
            }}
          />

          {stage === "seed" ? (
            <motion.div
              className="absolute bottom-7 h-8 w-5 rounded-full"
              style={{
                background: "linear-gradient(135deg, #7cff5b, #d7ff8f)",
                boxShadow: "0 0 22px rgba(124,255,91,0.5)",
              }}
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 2.4, repeat: Infinity }}
            />
          ) : null}

          {showLeaves ? (
            <>
              <div
                className="absolute bottom-20 left-8 h-12 w-20 rounded-[100%_0_100%_0]"
                style={{
                  opacity,
                  transform: `rotate(${-34 - droop}deg)`,
                  background: isRare
                    ? "linear-gradient(135deg, #7cff5b, #b486ff)"
                    : "linear-gradient(135deg, #caff8a, #43d948)",
                  boxShadow: isRare
                    ? "0 0 22px rgba(180,134,255,0.55)"
                    : "0 0 18px rgba(124,255,91,0.32)",
                }}
              />

              <div
                className="absolute bottom-24 right-8 h-12 w-20 rounded-[0_100%_0_100%]"
                style={{
                  opacity,
                  transform: `rotate(${34 + droop}deg)`,
                  background: isRare
                    ? "linear-gradient(135deg, #67f2ff, #ff7ae7)"
                    : "linear-gradient(135deg, #d7ff8f, #61ff72)",
                  boxShadow: isRare
                    ? "0 0 22px rgba(255,122,231,0.55)"
                    : "0 0 18px rgba(124,255,91,0.32)",
                }}
              />
            </>
          ) : null}

          {showSecondLeaves ? (
            <>
              <div
                className="absolute bottom-[7.1rem] left-11 h-9 w-16 rounded-[100%_0_100%_0]"
                style={{
                  opacity,
                  transform: `rotate(${-16 - droop}deg)`,
                  background: isRare
                    ? "linear-gradient(135deg, #b486ff, #8cff66)"
                    : "linear-gradient(135deg, #efffb7, #64e35d)",
                }}
              />

              <div
                className="absolute bottom-[7.8rem] right-11 h-9 w-16 rounded-[0_100%_0_100%]"
                style={{
                  opacity,
                  transform: `rotate(${16 + droop}deg)`,
                  background: isRare
                    ? "linear-gradient(135deg, #ff7ae7, #67f2ff)"
                    : "linear-gradient(135deg, #b9ff73, #54d85b)",
                }}
              />
            </>
          ) : null}

          {showFlower ? (
            <motion.div
              className="absolute bottom-[9.7rem] flex h-14 w-14 items-center justify-center rounded-full"
              style={{
                opacity,
                background: isRare
                  ? "radial-gradient(circle, #ffffff 0 13%, #ff7ae7 15% 42%, #67f2ff 48% 72%, transparent 74%)"
                  : "radial-gradient(circle, #ffffff 0 13%, #d7ff8f 15% 44%, #7cff5b 48% 72%, transparent 74%)",
                filter: "drop-shadow(0 0 16px rgba(124,255,91,0.62))",
              }}
              animate={{
                rotate: isRare ? [0, 4, -4, 0] : [0, 2, -2, 0],
                scale: isRare ? [1, 1.06, 1] : [1, 1.025, 1],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          ) : null}
        </div>

        <div className="relative -mt-4 h-20 w-32 rounded-b-[2.2rem] rounded-t-[1rem] border border-lime-200/20 bg-gradient-to-b from-slate-800 to-black shadow-[0_20px_35px_rgba(0,0,0,0.55)]">
          <div className="absolute inset-x-3 top-3 h-3 rounded-full bg-lime-200/12" />
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-lime-200/80 to-transparent" />
          <div className="absolute left-1/2 top-7 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border border-lime-200/20 bg-black/45 text-sm font-black text-lime-100">
            Z
          </div>
        </div>
      </motion.div>
    </div>
  );
}
