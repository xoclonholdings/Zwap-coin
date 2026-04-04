import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ZWAP_BANG } from "@/App";
import { useApp } from "@/app/AppProvider";
import {
  ArrowLeft,
  Footprints,
  Gamepad2,
  ArrowRightLeft,
  ShoppingBag,
  Zap,
  Shield,
  ChevronRight,
} from "lucide-react";

// ZWAP Coin logo
const ZWAP_COIN_LOGO =
  "https://customer-assets.emergentagent.com/job_zwap-coin-mobile/artifacts/zbcxii5n_D53F824E-1DBA-4963-86D4-4D4E73400DE1.png";

export default function AboutPage() {
  const navigate = useNavigate();
  const {
    walletAddress,
    setIsWalletModalOpen,
    setIsEmailAuthModalOpen,
  } = useApp();

  const features = [
    {
      icon: Footprints,
      title: "MOVE",
      desc: "Walk and earn ZWAP! Coin with our step tracker. The more you move, the more you earn.",
      color: "cyan",
      glow: "rgba(0,245,255,0.22)",
    },
    {
      icon: Gamepad2,
      title: "PLAY",
      desc: "Play games like zBrickles and zTrivia to earn ZWAP! and Z Points. Higher challenge, better rewards.",
      color: "purple",
      glow: "rgba(168,85,247,0.22)",
    },
    {
      icon: ArrowRightLeft,
      title: "SWAP",
      desc: "Exchange value across the ecosystem with a clean, simple experience built for motion and momentum.",
      color: "blue",
      glow: "rgba(59,130,246,0.22)",
    },
    {
      icon: ShoppingBag,
      title: "SHOP",
      desc: "Use what you earn on curated merch, eBooks, tech, and exclusive drops inside the ZWAP ecosystem.",
      color: "pink",
      glow: "rgba(236,72,153,0.22)",
    },
  ];

  const colorMap = {
    cyan: {
      text: "text-cyan-400",
      bg: "bg-cyan-500/15",
      border: "border-cyan-500/25",
      shadow: "0 0 28px rgba(0,245,255,0.14)",
    },
    purple: {
      text: "text-purple-400",
      bg: "bg-purple-500/15",
      border: "border-purple-500/25",
      shadow: "0 0 28px rgba(168,85,247,0.14)",
    },
    blue: {
      text: "text-blue-400",
      bg: "bg-blue-500/15",
      border: "border-blue-500/25",
      shadow: "0 0 28px rgba(59,130,246,0.14)",
    },
    pink: {
      text: "text-pink-400",
      bg: "bg-pink-500/15",
      border: "border-pink-500/25",
      shadow: "0 0 28px rgba(236,72,153,0.14)",
    },
  };

  const handleBeginJourney = () => {
    if (walletAddress) {
      navigate("/dashboard");
      return;
    }

    setIsEmailAuthModalOpen(false);
    setIsWalletModalOpen(false);
    navigate("/start");
  };

  return (
    <div className="min-h-screen bg-[#04040d] text-white pb-16">
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate("/")}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </motion.button>

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[32rem] h-[32rem] rounded-full bg-cyan-500/10 blur-[140px]"
          animate={{ scale: [1, 1.12, 1], opacity: [0.18, 0.28, 0.18] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/3 -left-16 w-[24rem] h-[24rem] rounded-full bg-blue-500/10 blur-[130px]"
          animate={{ scale: [1.08, 1, 1.08], opacity: [0.14, 0.24, 0.14] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 right-[-5rem] w-[28rem] h-[28rem] rounded-full bg-purple-500/12 blur-[140px]"
          animate={{ scale: [1, 1.1, 1], opacity: [0.18, 0.24, 0.18] }}
          transition={{ duration: 5.6, repeat: Infinity }}
        />
      </div>

      <section className="relative min-h-[52vh] flex flex-col items-center justify-center px-6 pt-20 pb-10">
        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-5"
          >
            <motion.img
              src={ZWAP_BANG}
              alt="ZWAP!"
              className="h-32 sm:h-44 mx-auto"
              animate={{
                filter: [
                  "drop-shadow(0 0 18px rgba(0,245,255,0.32))",
                  "drop-shadow(0 0 42px rgba(0,245,255,0.65))",
                  "drop-shadow(0 0 18px rgba(0,245,255,0.32))",
                ],
              }}
              transition={{ duration: 2.4, repeat: Infinity }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.65 }}
            className="rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_0_60px_rgba(0,0,0,0.35)] px-6 py-8 sm:px-10 sm:py-10"
          >
            <h1 className="text-3xl sm:text-5xl font-black mb-4 leading-tight tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
                CRYPTO-POWERED
              </span>
              <br />
              <span className="text-white">LIFESTYLE & GAMEFI</span>
            </h1>

            <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              ZWAP turns everyday movement, play, and participation into
              spendable digital value with a culture-first ecosystem built for
              real people, not just crypto natives.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="relative px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-2xl sm:text-3xl font-black text-center mb-8 tracking-tight"
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-gray-400">ONE</span>{" "}
            <span className="text-white">ECOSYSTEM.</span>{" "}
            <span className="text-cyan-400">FOUR MODES.</span>
          </motion.h2>

          <div className="grid sm:grid-cols-2 gap-5">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              const styles = colorMap[feature.color];

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{
                    y: -4,
                    boxShadow: styles.shadow,
                  }}
                  className={`rounded-[1.75rem] border ${styles.border} bg-white/[0.04] backdrop-blur-xl p-5 sm:p-6`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${styles.bg}`}
                  >
                    <Icon className={`w-7 h-7 ${styles.text}`} />
                  </div>

                  <h3 className={`text-xl font-black mb-2 tracking-wide ${styles.text}`}>
                    {feature.title}
                  </h3>

                  <p className="text-gray-300 text-sm sm:text-[15px] leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            className="text-2xl sm:text-3xl font-black text-center mb-8 tracking-tight"
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-gray-400">DUAL</span>{" "}
            <span className="text-purple-400">CURRENCY SYSTEM</span>
          </motion.h2>

          <div className="grid sm:grid-cols-2 gap-6">
            <motion.div
              className="rounded-[1.75rem] border border-cyan-500/25 bg-white/[0.04] backdrop-blur-xl p-6"
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{
                y: -4,
                boxShadow: "0 0 32px rgba(0,245,255,0.16)",
              }}
            >
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 10px rgba(0,245,255,0.16)",
                    "0 0 22px rgba(0,245,255,0.34)",
                    "0 0 10px rgba(0,245,255,0.16)",
                  ],
                }}
                transition={{ duration: 2.2, repeat: Infinity }}
                className="w-14 h-14 rounded-2xl bg-cyan-500/15 flex items-center justify-center mb-4 overflow-hidden"
              >
                <img
                  src={ZWAP_COIN_LOGO}
                  alt="ZWAP! Coin"
                  className="w-12 h-12 object-contain"
                />
              </motion.div>

              <h3 className="text-xl font-black text-cyan-400 mb-3">
                ZWAP! COIN
              </h3>

              <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                The main reward token. Earn it through walking, gameplay, and
                ecosystem participation. Spend it in the marketplace or use it
                across the ZWAP experience.
              </p>

              <div className="text-xs text-gray-400 leading-6">
                • Earned from movement and games
                <br />
                • Visible value across the ecosystem
                <br />
                • Spendable inside curated drops and shops
              </div>
            </motion.div>

            <motion.div
              className="rounded-[1.75rem] border border-purple-500/25 bg-white/[0.04] backdrop-blur-xl p-6"
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{
                y: -4,
                boxShadow: "0 0 32px rgba(168,85,247,0.16)",
              }}
            >
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 10px rgba(168,85,247,0.16)",
                    "0 0 22px rgba(168,85,247,0.34)",
                    "0 0 10px rgba(168,85,247,0.16)",
                  ],
                }}
                transition={{ duration: 2.2, repeat: Infinity }}
                className="w-14 h-14 rounded-2xl bg-purple-500/15 flex items-center justify-center mb-4"
              >
                <Zap className="w-8 h-8 text-purple-400" />
              </motion.div>

              <h3 className="text-xl font-black text-purple-400 mb-3">
                Z POINTS
              </h3>

              <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                Loyalty-style credits earned through play and engagement. They
                deepen the game loop, unlock ecosystem perks, and reward active
                participation.
              </p>

              <div className="text-xs text-gray-400 leading-6">
                • Earned through gameplay
                <br />
                • Used for ecosystem perks
                <br />
                • Designed to increase engagement and retention
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            className="text-2xl sm:text-3xl font-black text-center mb-8 tracking-tight"
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-gray-400">HOW IT</span>{" "}
            <span className="text-cyan-400">WORKS</span>
          </motion.h2>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                title: "1. Learn & Explore",
                desc: "Move through short, accessible modules that break down Web3 ideas using grounded, everyday examples.",
              },
              {
                title: "2. Get Your Wallet",
                desc: "When you’re ready, create a wallet in-app or connect one you already have to begin earning and saving progress.",
              },
              {
                title: "3. Play, Move & Shop",
                desc: "Walk, play, and participate in a digital economy built around actions that already fit into daily life.",
              },
              {
                title: "4. Build Your Stack",
                desc: "Turn time, effort, and engagement into assets and progress you can actually see and use.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                className="rounded-[1.5rem] bg-white/[0.04] border border-cyan-900/40 backdrop-blur-xl p-5"
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <h3 className="text-white font-bold mb-2 text-sm sm:text-base">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-[2rem] border border-white/10 bg-white/[0.05] backdrop-blur-xl shadow-[0_0_60px_rgba(0,0,0,0.3)] px-6 py-8 sm:px-10 sm:py-10"
          >
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-4 tracking-tight">
              {walletAddress
                ? "Welcome Back, Zwapper"
                : "Ready to Begin the Journey?"}
            </h2>

            <p className="text-gray-300 mb-8 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
              {walletAddress
                ? "Your wallet is connected and your progress is waiting. Head back to your dashboard and keep building."
                : "Start by learning, exploring, and getting your wallet when you’re ready. ZWAP is built to ease you into Web3, not throw you into the deep end."}
            </p>

            <motion.button
              onClick={handleBeginJourney}
              className="inline-flex items-center gap-2 px-10 py-4 text-lg font-bold bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 rounded-full text-white shadow-[0_0_30px_rgba(0,245,255,0.28)] hover:shadow-[0_0_50px_rgba(0,245,255,0.45)] transition-all"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              data-testid="about-cta-button"
            >
              {walletAddress ? "Back to Dashboard" : "Begin Your Journey"}
              {!walletAddress && <ChevronRight className="w-5 h-5" />}
            </motion.button>
          </motion.div>
        </div>
      </section>

      <section className="relative py-14 px-6 bg-[#090913] border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div
              animate={{
                filter: [
                  "drop-shadow(0 0 10px rgba(0,245,255,0.25))",
                  "drop-shadow(0 0 24px rgba(0,245,255,0.5))",
                  "drop-shadow(0 0 10px rgba(0,245,255,0.25))",
                ],
              }}
              transition={{ duration: 2.2, repeat: Infinity }}
            >
              <Shield
                className="w-14 h-14 text-cyan-400 mx-auto mb-4 cursor-pointer"
                onClick={() => {
                  const now = Date.now();
                  const lastTap = window._adminTapTime || 0;
                  const tapCount =
                    now - lastTap < 500 ? (window._adminTapCount || 0) + 1 : 1;

                  window._adminTapTime = now;
                  window._adminTapCount = tapCount;

                  if (tapCount >= 3) {
                    window._adminTapCount = 0;
                    navigate("/admin");
                  }
                }}
              />
            </motion.div>

            <h2 className="text-xl sm:text-2xl font-black mb-3 tracking-tight">
              <span className="text-cyan-400">BUILT</span>{" "}
              <span className="text-white">FOR THE FUTURE</span>
            </h2>

            <p className="text-gray-400 max-w-xl mx-auto mb-6 text-sm sm:text-base leading-relaxed">
              ZWAP!™️ is a Web3 asset owned by{" "}
              <span className="text-cyan-400">ZWAP LLC</span>, held by{" "}
              <span className="text-white">XOCLON Holdings Inc</span>.
            </p>

            <div className="flex justify-center gap-4 text-xs text-gray-500 flex-wrap">
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Polygon Network
              </motion.span>
              <span>•</span>
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
              >
                Multichain Ready
              </motion.span>
              <span>•</span>
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
              >
                30B Supply
              </motion.span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}