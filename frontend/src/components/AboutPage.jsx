import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ZWAP_LOGO, ZWAP_BANG } from "@/App";
import { ArrowLeft, Footprints, Gamepad2, ArrowRightLeft, ShoppingBag, Coins, Users, Shield, Zap } from "lucide-react";

export default function AboutPage() {
  const navigate = useNavigate();

  const features = [
    { icon: Footprints, title: "MOVE", desc: "Walk and earn ZWAP! Coin with our step tracker. The more you move, the more you earn.", color: "cyan" },
    { icon: Gamepad2, title: "PLAY", desc: "Play games like zBrickles and zTrivia to earn ZWAP! and Z Points. Games get harder = more rewards!", color: "purple" },
    { icon: ArrowRightLeft, title: "SWAP", desc: "One-tap exchange between ZWAP! and major cryptos like BTC, ETH, SOL, and POL.", color: "blue" },
    { icon: ShoppingBag, title: "SHOP", desc: "Spend your earnings at Zupreme Imports. Merch, eBooks, tech, and exclusive drops.", color: "pink" },
  ];

  const stats = [
    { value: "30B", label: "ZWAP! SUPPLY", icon: Coins },
    { value: "4+", label: "EARNING GAMES", icon: Gamepad2 },
    { value: "5", label: "CRYPTO PAIRS", icon: ArrowRightLeft },
    { value: "∞", label: "POSSIBILITIES", icon: Zap },
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

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[150px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center max-w-4xl mx-auto"
        >
          {/* Logo */}
          <motion.img
            src={ZWAP_BANG}
            alt="ZWAP!"
            className="h-24 sm:h-32 mx-auto mb-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          />

          {/* Headline */}
          <motion.h1
            className="text-3xl sm:text-5xl font-extrabold mb-4 leading-tight"
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
            className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Turn everyday movement and gameplay into real, spendable value. 
            Walk, play, shop, and earn — with built-in crypto swap functionality.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              onClick={() => navigate("/")}
              className="px-8 py-6 text-lg font-bold bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full shadow-[0_0_30px_rgba(0,245,255,0.3)]"
            >
              GET STARTED
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0a0b1e] to-transparent py-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="max-w-4xl mx-auto px-6 grid grid-cols-4 gap-4">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                    {stat.value}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-[#0a0b1e]">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            className="text-2xl sm:text-3xl font-bold text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <span className="text-gray-400">HOW IT</span>{" "}
            <span className="text-cyan-400">WORKS</span>
          </motion.h2>

          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  className="glass-card p-6 rounded-2xl"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className={`w-12 h-12 rounded-xl ${colorMap[feature.color]} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${colorMap[feature.color].split(" ")[0]}`}>
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Token Section */}
      <section className="py-20 px-6 bg-[#050510]">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            className="text-2xl sm:text-3xl font-bold text-center mb-12"
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
            >
              <Coins className="w-10 h-10 text-cyan-400 mb-4" />
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
            >
              <Zap className="w-10 h-10 text-purple-400 mb-4" />
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

      {/* Trust Section */}
      <section className="py-20 px-6 bg-[#0a0b1e]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Shield className="w-16 h-16 text-cyan-400 mx-auto mb-6" />
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              <span className="text-cyan-400">BUILT</span>{" "}
              <span className="text-white">FOR THE FUTURE</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-8">
              ZWAP! is powered by XOCLON HOLDINGS INC. — a trust-owned platform 
              focused on restoration, innovation, and legacy.
            </p>
            <div className="flex justify-center gap-4 text-xs text-gray-500">
              <span>Polygon Network</span>
              <span>•</span>
              <span>Multichain Ready</span>
              <span>•</span>
              <span>30B Supply</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 px-6 bg-gradient-to-t from-cyan-500/10 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-white">
              READY TO START EARNING?
            </h2>
            <Button
              onClick={() => navigate("/")}
              className="px-12 py-6 text-lg font-bold bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
            >
              ENTER ZWAP!
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
