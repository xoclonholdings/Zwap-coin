import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ZWAP_BANG } from "@/App";
import { ArrowLeft, Footprints, Gamepad2, ArrowRightLeft, ShoppingBag, Coins, Zap, Shield } from "lucide-react";

export default function AboutPage() {
  const navigate = useNavigate();

  const features = [
    { icon: Footprints, title: "MOVE", desc: "Walk and earn ZWAP! Coin with our step tracker. The more you move, the more you earn.", color: "cyan" },
    { icon: Gamepad2, title: "PLAY", desc: "Play games like zBrickles and zTrivia to earn ZWAP! and Z Points. Games get harder = more rewards!", color: "purple" },
    { icon: ArrowRightLeft, title: "SWAP", desc: "One-tap exchange between ZWAP! and major cryptos like BTC, ETH, SOL, and POL.", color: "blue" },
    { icon: ShoppingBag, title: "SHOP", desc: "Spend your earnings at Zupreme Imports. Merch, eBooks, tech, and exclusive drops.", color: "pink" },
  ];

  const colorMap = {
    cyan: "text-cyan-400 bg-cyan-500/20",
    purple: "text-purple-400 bg-purple-500/20",
    blue: "text-blue-400 bg-blue-500/20",
    pink: "text-pink-400 bg-pink-500/20",
  };

  return (
    <div className="min-h-screen bg-[#050510] text-white overflow-x-hidden">
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate("/")}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </motion.button>

      {/* Hero Section - Reduced spacing */}
      <section className="relative min-h-[60vh] flex flex-col items-center justify-center px-6 pt-12 pb-8">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-cyan-500/15 rounded-full blur-[120px]"
            animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/15 rounded-full blur-[120px]"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.15, 0.2] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center max-w-4xl mx-auto"
        >
          {/* Logo - Larger */}
          <motion.img
            src={ZWAP_BANG}
            alt="ZWAP!"
            className="h-32 sm:h-44 mx-auto mb-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              filter: [
                "drop-shadow(0 0 20px rgba(0,245,255,0.4))",
                "drop-shadow(0 0 40px rgba(0,245,255,0.7))",
                "drop-shadow(0 0 20px rgba(0,245,255,0.4))"
              ]
            }}
            transition={{ delay: 0.2, duration: 2, repeat: Infinity }}
          />

          {/* Headline */}
          <motion.h1
            className="text-3xl sm:text-4xl font-extrabold mb-3 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
              CRYPTO-POWERED
            </span>
            <br />
            <span className="text-white">LIFESTYLE & GAMEFI</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Turn everyday movement and gameplay into real, spendable value.
          </motion.p>
        </motion.div>
      </section>

      {/* Token Section - MOVED UP (was below "How it works") */}
      <section className="py-12 px-6 bg-[#0a0b1e]">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            className="text-2xl sm:text-3xl font-bold text-center mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <span className="text-gray-400">DUAL</span>{" "}
            <span className="text-purple-400">CURRENCY SYSTEM</span>
          </motion.h2>

          <div className="grid sm:grid-cols-2 gap-6">
            <motion.div
              className="p-6 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-transparent"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(0,245,255,0.2)" }}
            >
              <motion.div
                animate={{ 
                  boxShadow: [
                    "0 0 10px rgba(0,245,255,0.2)",
                    "0 0 20px rgba(0,245,255,0.4)",
                    "0 0 10px rgba(0,245,255,0.2)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center mb-4"
              >
                <Coins className="w-6 h-6 text-cyan-400" />
              </motion.div>
              <h3 className="text-xl font-bold text-cyan-400 mb-2">ZWAP! COIN</h3>
              <p className="text-gray-400 text-sm mb-4">
                The main reward token. Earn it through walking, playing games, and faucet rewards. 
                Spend it in the marketplace or swap for other crypto.
              </p>
              <div className="text-xs text-gray-500">
                • Earned from zWALK + Games<br />
                • Tradeable for BTC, ETH, SOL, POL<br />
                • Spendable at Zupreme Imports
              </div>
            </motion.div>

            <motion.div
              className="p-6 rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-transparent"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(153,69,255,0.2)" }}
            >
              <motion.div
                animate={{ 
                  boxShadow: [
                    "0 0 10px rgba(153,69,255,0.2)",
                    "0 0 20px rgba(153,69,255,0.4)",
                    "0 0 10px rgba(153,69,255,0.2)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4"
              >
                <Zap className="w-6 h-6 text-purple-400" />
              </motion.div>
              <h3 className="text-xl font-bold text-purple-400 mb-2">Z POINTS</h3>
              <p className="text-gray-400 text-sm mb-4">
                Loyalty credits earned only from games. Use them for exclusive items, 
                boosts, and special redemptions. Convert 1000 zPts to 1 ZWAP!
              </p>
              <div className="text-xs text-gray-500">
                • Game-only rewards<br />
                • Daily caps: 20-30 zPts<br />
                • Exclusive shop items
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section - MOVED DOWN (was above token section) */}
      <section className="py-12 px-6 bg-[#050510]">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            className="text-2xl sm:text-3xl font-bold text-center mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <span className="text-gray-400">HOW IT</span>{" "}
            <span className="text-cyan-400">WORKS</span>
          </motion.h2>

          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  className="glass-card p-5 rounded-2xl"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <motion.div 
                    className={`w-10 h-10 rounded-xl ${colorMap[feature.color]} flex items-center justify-center mb-3`}
                    animate={{ 
                      boxShadow: [
                        `0 0 10px rgba(0,0,0,0.1)`,
                        `0 0 20px rgba(0,0,0,0.2)`,
                        `0 0 10px rgba(0,0,0,0.1)`
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.div>
                  <h3 className={`text-lg font-bold mb-2 ${colorMap[feature.color].split(" ")[0]}`}>
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 px-6 bg-[#0a0b1e]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div
              animate={{ 
                filter: [
                  "drop-shadow(0 0 10px rgba(0,245,255,0.3))",
                  "drop-shadow(0 0 25px rgba(0,245,255,0.5))",
                  "drop-shadow(0 0 10px rgba(0,245,255,0.3))"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Shield className="w-14 h-14 text-cyan-400 mx-auto mb-4" />
            </motion.div>
            <h2 className="text-xl sm:text-2xl font-bold mb-3">
              <span className="text-cyan-400">BUILT</span>{" "}
              <span className="text-white">FOR THE FUTURE</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-6 text-sm">
              ZWAP! is powered by XOCLON HOLDINGS INC. — a trust-owned platform 
              focused on restoration, innovation, and legacy.
            </p>
            <div className="flex justify-center gap-4 text-xs text-gray-500">
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

      {/* Get Started CTA */}
      <section className="py-12 px-6 bg-[#050510]">
        <div className="max-w-lg mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-white mb-4">Ready to Start Earning?</h2>
            <p className="text-gray-400 mb-6">Join thousands of Zwappers earning crypto every day.</p>
            <motion.button
              onClick={() => navigate("/dashboard")}
              className="px-10 py-4 text-lg font-bold bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 rounded-full text-white shadow-[0_0_30px_rgba(0,245,255,0.4)] hover:shadow-[0_0_50px_rgba(0,245,255,0.6)] transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
